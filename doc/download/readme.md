## 实现思路
1. 在主进程中定义一个全局变量 downloadItems 用于管理所有的下载任务项
2. 主进程在接收到下载文件任务的时候，将下载任务添加进入 downloadItems，通过win.webContents.send(‘watch-download-file-state’)把下载过程进度 推送给渲染进程
3. 主进程监听渲染进程发送过来的事件，根据下载任务项downloadItems 来获取某个文件下载实例，进行相应的处理。
4. 通过预加载脚本向渲染器进程暴露一个全局的 window.electronAPI 变量
```js
downloadFile: (windowName,url,fileName,fingerPrint) => ipcRenderer.send('download-file', windowName,url,fileName,fingerPrint),//下载文件
watchDownloadFileState: (callback) => ipcRenderer.on('watch-download-file-state', callback),//推送给渲染进程 下载过程中的状态
setDownloadFileState: (state,fingerPrint,url) => ipcRenderer.send('set-download-file-state',state,fingerPrint,url),//接收渲染进程 设置下载状态（暂停、恢复、取消） 的通知
getDownloadFileState: (fingerPrint,url,returnType) => ipcRenderer.invoke('get-download-file-state',fingerPrint,url,returnType),//接收渲染进程 获取下载状态 的通知 返回下载状态字符串
getDownloadFileSavepath: (fingerPrint) => ipcRenderer.invoke('get-download-file-savepath',fingerPrint),//接收渲染进程 获取某个下载文件的下载存放路径 的通知 返回下载存放路径
openDir: (path,isOpenFile) => ipcRenderer.invoke('open-dir',path,isOpenFile),//从渲染进程中打开目录，并返回结果
fsExists: (path) => ipcRenderer.invoke('fs-exists',path),//从渲染进程中通知主进程判断一下文件路径是否存在，主进程返回结果
```
5. 渲染进程下载文件逻辑
   
![下载文件逻辑](./4eea9b50065749978c6f426d9cf40487.png?raw=true)

## 代码

### 主进程
```js
const { app, BrowserWindow, ipcMain, shell} = require('electron');
const fs = require('fs');
const path = require('path');
//所有窗体
let windows = {
	mainWindow: null, //主窗口
}

//统一管理下载项数组
let downloadItems = [];

/**
 * 下载文件
 * @param {String} windowName 文件下载的窗体
 * @param {String} url 文件下载路径
 * @param {String} fileName  文件名称，包含后缀名（例如：图1.png）
 * @param {String} fingerPrint  文件指纹，唯一标识
 */
function downloadFile(windowName,url,fileName,fingerPrint){

	const currWindow = windows[windowName];
	//根据fileName 拼接 文件下载存放路径
	const filePath = path.join(app.getPath('appData'),`/File`,`${fileName}`)

	//1- 下载文件
	currWindow.webContents.downloadURL(url);
	//2- 准备下载的时候触发
	currWindow.webContents.session.once('will-download',(event,item,webContents) => {
		//(1) 设置下载项的保存文件路径（我这里将下载地址放在了程序根目录下的download文件夹下）
		item.setSavePath(filePath);
		
		downloadItems.push({//存储下载项
			fingerPrint,
			item,
			windowName,
		})

		//(2) 监听updated事件，当下载正在执行时，把下载进度发给渲染进程进行展示
		item.on('updated',(event,state) => {
			switch(state){
				case 'interrupted'://下载中断
					currWindow.webContents.send('watch-download-file-state',state,{//推送给渲染进程 下载过程中 的状态
						fingerPrint:fingerPrint,
					})
					break;
				case 'progressing'://下载停止
					if (item.isPaused()) { // 下载停止
						currWindow.webContents.send('watch-download-file-state','pause',{//推送给渲染进程 下载过程中 的状态
							fingerPrint:fingerPrint,
						})
				    } else if(item.getReceivedBytes() && item.getTotalBytes()) {//下载中
						currWindow.webContents.send('watch-download-file-state',state,{//推送给渲染进程 下载过程中 的状态
							saveFilePath: filePath,
							loaded: item.getReceivedBytes(),
							total: item.getTotalBytes(),
							fingerPrint:fingerPrint,
						})

					}

					break;
			}
		})
		//(3) 监听done事件，在下载完成时打开文件。
		item.once('done',(e,state) => {
			switch(state){
				case 'completed'://下载完成
					shell.openPath(filePath);//打开文件
					currWindow.webContents.send('watch-download-file-state',state,{//推送给渲染进程 下载过程中 的状态
						fingerPrint:fingerPrint,
					})
					break;
				case 'interrupted'://下载中断
					currWindow.webContents.send('watch-download-file-state',state,{//推送给渲染进程 下载过程中 的状态
						fingerPrint:fingerPrint,
					})
					break;
				case 'cancelle'://下载取消
					for(let i = 0; i < downloadItems.length; i++){
						if(fingerPrint == downloadItems[i].fingerPrint && downloadItems[i].item.getURL() === url){
							downloadItems.splice(i,1);
							break;
						}
					}
					currWindow.webContents.send('watch-download-file-state',state,{//推送给渲染进程 下载过程中 的状态
						fingerPrint:fingerPrint,
					})
					break;
			}
		})
	})
}

/**接收渲染进程 下载文件 的通知
 * @param {String} windowName 文件下载的窗体
 * @param {String} url 文件下载路径
 * @param {String} fileName  文件名称，包含后缀名（例如：图1.png）
 * @param {String} fingerPrint  文件指纹，唯一标识
 */
ipcMain.on('download-file', function(event, windowName, url, fileName, fingerPrint) {
    downloadFile(windowName, url, fileName, fingerPrint);
});

/**接收渲染进程 获取下载状态 的通知
 * @param {String} fingerPrint 文件指纹（因为同一个文件即使不同名，下载路径也是一样的，所以需要消息指纹识别）
 * @param {String} url 文件下载路径
 * @param {String (str|obj)} returnType 返回的类型， 值为str是仅仅返回一个状态，值为obj返回一个对象
 */
ipcMain.handle('get-download-file-state', function(event, fingerPrint, url, returnType = 'str') {
    let state = null;
    for (let i = 0; i < downloadItems.length; i++) {
        if (downloadItems[i].fingerPrint === fingerPrint) {
            const item = downloadItems[i].item;
            if (url === item.getURL()) {
                state = item.getState();//返回 string - 当前状态。 可以是 progressing、 completed、 cancelled 或 interrupted。
                if (state === 'progressing') {
                    if (item.isPaused()) {
                        state = 'interrupted';
                    }
                }
                return returnType === 'str' ? state : { state: state, windowName: downloadItems[i].windowName };
                break;
            }
        }
    }
    return returnType === 'str' ? state : { state: state, windowName: '' };
});

/**接收渲染进程 设置下载状态（暂停、恢复、取消） 的通知
 * @param {String} state 需要暂停下载的路径（pause：暂停下载，stop：取消下载，resume：恢复下载）
 * @param {String} fingerPrint 需要暂停下载的文件指纹（因为同一个文件即使不同名，下载路径也是一样的，所以需要消息指纹识别）
 * @param {String} url 需要暂停下载的路径
 *
 */
ipcMain.on('set-download-file-state', function(event, state, fingerPrint, url) {
    for (let i = 0; i < downloadItems.length; i++) {
        if (downloadItems[i].fingerPrint === fingerPrint) {
            const item = downloadItems[i].item;
            if (url === item.getURL()) {
                switch (state) {
                    case 'pause':
                        item.pause();//暂停下载
                        break;
                    case 'cancel':
                        item.cancel();//取消下载
                        downloadItems.splice(i, 1);
                        break;
                    case 'resume':
                        if (item.canResume()) {
                            item.resume();
                        }
                        break;
                }
            }
        }
    }
});

/**接收渲染进程 获取某个下载文件的下载存放路径 的通知 返回下载存放路径
 * @param {String} fingerPrint 文件指纹
 */
ipcMain.handle('get-download-file-savepath', function(event, fingerPrint) {
    let state = null;
    for (let i = 0; i < downloadItems.length; i++) {
        if (downloadItems[i].fingerPrint === fingerPrint) {
            const item = downloadItems[i].item;
            return item.getSavePath();
            break;
        }
    }
    return state;
});

/**接收渲染进程 打开指定路径的本地文件 的通知 并返回结果（路径存在能打开就返回true，路径不存在无法打开就返回false）
 * @param {Object} event
 * @param {String} path
 */
ipcMain.handle('open-dir', function(event, path, isOpenFile) {
    if (!path) return false;
    if (isOpenFile) {
         shell.openPath(filePath);//打开文件
        return true;
    } else {
        const checkPath = fs.existsSync(path);//以同步的方法检测文件路径是否存在。
        if (checkPath) {//文件存在直接打开所在目录
            shell.showItemInFolder(path);
            return true;
        } else { 
            return false;
        }
    }

});

/**
 * 接收渲染进程 判断文件路径是否存在 的通知 返回是否存在的布尔值结果
 */
ipcMain.handle('fs-exists', function(event, path) {
    if (!path) return false;
    const checkPath = fs.existsSync(path);//以同步的方法检测文件路径是否存在。
    return checkPath;
});

```

### 预加载脚本
```js
//向渲染器进程暴露一个全局的 window.electronAPI 变量。
const { contextBridge, ipcRenderer, app } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
	downloadFile: (windowName,url,fileName,fingerPrint) => ipcRenderer.send('download-file', userId,windowName,url,fileName,fingerPrint),//下载文件
	watchDownloadFileState: (callback) => ipcRenderer.on('watch-download-file-state', callback),//推送给渲染进程 下载过程中的状态
	getDownloadFileState: (fingerPrint,url,returnType) => ipcRenderer.invoke('get-download-file-state',fingerPrint,url,returnType),//接收渲染进程 获取下载状态 的通知 返回下载状态字符串
	setDownloadFileState: (state,fingerPrint,url) => ipcRenderer.send('set-download-file-state',state,fingerPrint,url),//接收渲染进程 设置下载状态（暂停、恢复、取消） 的通知
	getDownloadFileSavepath: (fingerPrint) => ipcRenderer.invoke('get-download-file-savepath',fingerPrint),//接收渲染进程 获取某个下载文件的下载存放路径 的通知 返回下载存放路径
	openDir: (path,isOpenFile) => ipcRenderer.invoke('open-dir',path,isOpenFile),//从渲染进程中打开目录，并返回结果
	fsExists: (path) => ipcRenderer.invoke('fs-exists',path),//从渲染进程中通知主进程判断一下文件路径是否存在，主进程返回结果
})
```

### 渲染进程
```js
<template>
	<button @click="onDownloadFile({
		progress: 0,
		url: "这里是文件的下载路径",
		fileName: "测试文件.zip",
		fingerPrint: "abcdedf",
	})"></button>
</template>
<script lang="ts" setup>
	//点击下载文件
	async function onDownloadFile(item){
		const isSuccess = await electronDownloadFile('mainWindow',item.url,item.fileName,item.fingerPrint,({remainderTime,progress,speedStr}) => {
	  		item.progress = progress;//下载进度条
	  		item.remainderTime = remainderTime;//下载剩余时间
	  		item.speedStr = speedStr;//下载速度
	  	},(key,value) => {
	  		item[key] = value;
	  		return item[key]
	  	})
	  	if(isSuccess){
	  		item.progress = 100;
	  	}
	}
	
	/**electron下载文件
	 * @param {String} windowName 接收下载信息监听的窗口名称
	 * @param {string} url 下载的文件路径
	 * @param {string} fileName 下载的文件名称
	 * @param {string} fingerPrint 下载的文件指纹
	 * @param {function} progressCallBack 下载进度函数回调
	 * @param {function} setAttribute 需要设置属性的函数回调
	 */
	async function electronDownloadFile(windowName,url,fileName,fingerPrint,progressCallBack,setAttribute){
		if(!setAttribute) return 
		if(!window.electronAPI) return;
		
		/**定义回调函数获取：下载剩余时间，下载进度，下载速度
		 * @param {Number} remainderTime 下载剩余时间
		 * @param {Number} progress 下载进度
		 * @param {String} speedStr 下载速度
		 */
		const callBackUpdateFn = ({remainderTime,progress,speedStr}) => {
			
			progressCallBack && progressCallBack({remainderTime,progress,speedStr})
		}
		const progressCallback = uploadDownFileProgressFn(callBackUpdateFn)
		
		/**定义一个下载文件的方法
		 * @param {Boolean} onlyGetWatchResult 仅获取监听结果（因为恢复下载后只需要获取监听结果即可）
		 */
		const downloadFn = (onlyGetWatchResult = false) => { //
		
			return new Promise((resolve) => {
				//1- 下载文件
				if(onlyGetWatchResult === false){
					setAttribute('progress',0)//设置进度为0
					//获取本地用户信息
					const localUser = y9_storage.getObjectItem('localUser')//本地用户信息
					
					window.electronAPI.downloadFile(localUser.user_uid,windowName,url,fileName,fingerPrint)
				}
				//2- 获取监听下载过程中的状态
				window.electronAPI.watchDownloadFileState((event,state,info) => {
					if(fingerPrint !== info.fingerPrint) return 
					setAttribute('downloadState',state) //设置下载状态
					switch(state){
						case "progressing": //下载中
							progressCallback(info)
							break;
						case "pause"://下载暂停
							resolve(false)
							break;
						case "cancelled"://下载被取消了
							resolve(false)
							break;
						case "interrupted"://下载中断
							resolve(false)
							break;
						case "completed": //下载完成
							resolve(true)
							break;
						default://没下载过就开始下载
							resolve(false)
							break;
							
					}
				})
				
			})
			
		}
		
		//1- 获取当前文件在主进程的下载状态
		const {state:downloadState,windowName:downloadWindowName } = await window.electronAPI.getDownloadFileState(fingerPrint,url,'obj');
		//2- 根据下载状态作出对应的响应
		switch(downloadState){
			case "progressing": //下载中
				//防止当某个窗口正在下载时，另一个窗口点击了暂停
				if(downloadWindowName !== windowName) {
					ElNotification.error({
						title: '提示',
						message: `此文件正在${downloadWindowName}窗口下载中，请耐心等待`,
						offset: 100,
						duration: 1500,
						
					});
					return false
				} 
				//设置暂停下载
				window.electronAPI.setDownloadFileState('pause',fingerPrint,url)
				return false
			case "completed": //下载完成
				//获取文件下载后的保存路径
				const savePath =  await window.electronAPI.getDownloadFileSavepath(fingerPrint);
				//路径不存在说明被手动删除了，重新下载
				if(!savePath){
					ElNotification.error({
						title: '操作失败',
						message: '文件不存在，正在重新下载！',
						offset: 100
					});
					return await downloadFn()//下载文件
				}
				//路径存在就判断文件是否真实存在本地
				const isExist = await window.electronAPI.fsExists(savePath);
				if(!isExist){//不存在本地，说明下载过，但被手动删除了，取消此文件的上次下载记录，重新下载
					window.electronAPI.setDownloadFileState('cancel',fingerPrint,url)//设置取消下载
					return await downloadFn()//下载文件
				}else {//存在本地就打开该文件
					const result = await window.electronAPI.openDir(savePath,true)//打开文件
					if(!result){//打不开就给出合理提示进行重新下载
						ElNotification.error({
							title: '操作失败',
							message: '文件不存在，正在重新下载！',
							offset: 100
						});
						return await downloadFn()//下载文件
					}
				}
				return false
			case "cancelled"://下载被取消
				return false
			case "interrupted"://下载中断
				if(downloadWindowName === windowName){
					window.electronAPI.setDownloadFileState('resume',fingerPrint,url)//设置恢复下载
				}else {
				
					ElNotification.error({
						title: '提示',
						message: `此文件被${downloadWindowName}窗口暂停下载了，请前往恢复下载`,
						offset: 100,
						duration: 1500,
					});
				}
				
				return await downloadFn(true)//获取文件的下载过程信息
			default://没下载过就开始下载
				return await downloadFn()//下载文件
				
		}
			
	}
	
	/** 根据下载项目的总大小（以字节为单位）和 下载项目的接收字节 计算：下载剩余时间，下载进度，下载速度
	 * @param {Funciton} callBack 回调函数，函数参数必传一个对象{total,loaded}，返回一个对象，包含下载剩余时间，下载进度，下载速度
	 */
	function uploadDownFileProgressFn (callBack)  {
		//文件的上传进度、上传速度、上传剩余时间计算
		let lastTime = 0;//上一次计算剩余时间
		let lastSize = 0;//上一次计算的文件大小
		return (e) => {
            if(!e.total || !e.loaded) return
            if(lastTime == 0){
                lastTime = new Date().getTime();
                lastSize = e.loaded
                return
            }
            //计算时间间隔
            let nowTime = new Date().getTime();
            let intervalTime = (nowTime - lastTime)/1000;//时间单位为毫秒，需要转化为秒
            let intervalSize = e.loaded - lastSize;
            //重新赋值以便于下一次计算
            lastTime = nowTime;
            lastSize = e.loaded;
            //计算速度
            let speed = parseInt(intervalSize / intervalTime);
            const bSpeed = parseInt(speed);
            let units = 'b/s'
            if((speed / 1024) > 1) {
                speed = parseInt(speed / 1024);
                units = 'k/s'
            }
            if((speed / 1024) > 1) {
                speed = parseInt(speed / 1024);
                units = 'M/s'
            }
            //上传剩余时间
            let remainderTime = bSpeed ? Math.ceil(((e.total - e.loaded) / bSpeed)) : 0; 
            if(remainderTime < 0 || !remainderTime){
                remainderTime = 0;
            }
            remainderTime = parseInt(remainderTime)
            //上传进度
            const progress = parseInt((e.loaded / e.total) * 100);
            //上传速度
            const speedStr = speed + units;
            callBack && callBack({remainderTime,progress,speedStr})
		}
	}
</script>

```

## 参考

资料1 [Electron实现文件下载并展示下载进度](https://blog.csdn.net/weixin_56295520/article/details/131768646)