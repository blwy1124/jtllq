/**
 * @file 当前目录的代码只能被主进程所使用
 */
import { app, session, ipcMain, BrowserWindow } from "electron";
import path from "path";
import * as PrintUtil from "./print-util";
import appState from "../../../main/app-state";
import SilentPrintWindow from "../../../main/windows/silentPrint";
import log from "electron-log/main";


class Print{
  public initialize(){
    this._preloadFilePath = path.join(__dirname, "print-preload.js");
    // console.log("Utils preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);
  
    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }
  protected setPreload(session){
    session.setPreloads([ ...session.getPreloads(), this._preloadFilePath ]);
  }
  
  protected _preloadFilePath : string = "";
  
  // === PUBLIC METHOD FALG LINE (DO NOT MODIFY/REMOVE) ===
}
  
const print = new Print();

/**
 * @printType: 打印类型 printType = "fr3" or "browser"
 * @printOptions: 打印参数
 * {
 *    urls:"",  //打印页面地址数组 例：["https://www.runoob.com/vue3/vue3-directives.html","http://192.168.100.139:8080/webhis"]
 *	  options:{} //按照Electron中webcontents  contents.print([options], [callback]) options传参即可
 * } 
 *  @isHandle: true调用窗口函数print在打印，false:调用后即打印。不传默认直接打印
 */
ipcMain.on("electron-print-open-print-window", (event, printType, printOptionArr) => {
  // 参数验证
  if(!printOptionArr || printOptionArr.length < 1){
    throw new Error("Invalid parameters: printOptionArr不能为空!");
  }
  if(printType === "browser"){
    if(printOptionArr.length === 1){
      const printOption = printOptionArr[0];
      const url = printOption["url"];
      if(!url){
        throw new Error("打印内容url不能为空!");
      }
      const options = printOption["options"];
      const isSecondaryCall = printOption["isSecondaryCall"];
      appState.silentPrintWindow = new SilentPrintWindow(url, options, isSecondaryCall);
      // log.info("electron-print-open-print-window:" + BrowserWindow.fromWebContents(event.sender)?.webContents.getTitle());
      const win = appState.silentPrintWindow?.browserWindow;
      win?.setParentWindow(BrowserWindow.fromWebContents(event.sender));
      // log.info("electron-print-open-print-window2:" + BrowserWindow.fromWebContents(event.sender)?.webContents.getTitle());
    }else if(printOptionArr.length > 1){
      // 批量
      batchPrint(printOptionArr);
    }
  }else if(printType === "fr3"){
    console.log("还未开发");
  }
});


ipcMain.handle("electron-print-get-printer-list", async(event) => {
  // 获取到打印机列表
  const list = await event.sender.getPrintersAsync();
  return list;
});
// 打印暂时没用
ipcMain.on("electron-print-silent-print-current-window", (event) => {
  event.sender.print();
});
// === FALG LINE (DO NOT MODIFY/REMOVE) ===

// 批量打印
async function batchPrint(printOptionArr){
  let win;
  for (let i = 0;i < printOptionArr.length;i++){
    const printOption = printOptionArr[i];
    const url = printOption["url"];
    const options = printOption["options"];
    const isSecondaryCall = printOption["isSecondaryCall"];
    appState.silentPrintWindow = new SilentPrintWindow(url, options, isSecondaryCall);
    win = appState.silentPrintWindow?.browserWindow;
    // await createSilentWindow(url, options, isSecondaryCall);
    win?.show();
  }
}


async function createSilentWindow(url, options, isSecondaryCall){
  const printWindow = new BrowserWindow({
    width: 800,  
    height: 1000,  
    show: true, // 可以先隐藏窗口，打印后再显示  
    webPreferences: {  
      nodeIntegration: false, // 根据你的需求启用或禁用  
      contextIsolation: true, // 推荐启用  
      webviewTag: true, // 允许使用<webview>标签
      // 可以在这里添加 preload 脚本以安全地暴露 ipcRenderer API  
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false
    }
  });
  printWindow.loadURL("../../../renderer/views/print/index1.vue");


  printWindow?.webContents.on("did-finish-load", (event) => {
    //   this._browserWindow?.webContents.executeJavaScript(`
    //   console.log('Hello from executeJavaScript!');
    //   window.silentWindowAPI.printSilentWindow();
    //   console.log('Hello from 已执行!1111');
    // `);
    event.sender.openDevTools();
    if(!isSecondaryCall){
      try {
        // 执行打印操作
        event.sender.print(options, (success, failureReason) => {
          if(!success){
            console.error(`Print failed: ${failureReason}`);
          }else{
            console.log("打印成功！");
          }
        });
      } catch (error){
        // console.error(`Print error: ${error.message}`);
      }
    }
  });

  // 监听渲染进程发出的打印请求
  ipcMain.on("print-silent-window-print1", async(event) => {
    try {
    // 执行打印操作
      await event.sender.print(options, (success, failureReason) => {
        if(!success){
          console.error(`Print failed: ${failureReason}`);
        }else{
          console.log("打印成功！");
        }
      });
    } catch (error){
      // console.error(`Print error: ${error.message}`);
    }
  }
  );
}

export default print;
export {
  PrintUtil
};