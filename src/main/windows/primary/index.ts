import path from "path";
import { app, dialog, ipcMain } from "electron";
import appState from "../../app-state";
import WindowBase from "../window-base";
import FramelessWindow from "../frameless";
import axiosInst from "../../../lib/axios-inst/main";
import nl from "../../../lib/native/main";

class PrimaryWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 1024,
      height: 768,
      frame: false, // 是否显示窗口边框
      webPreferences: { // 网页功能设置
        devTools: true, // 是否打开调试模式
        webSecurity: true, // 禁用安全策略
        allowRunningInsecureContent: true, // 允许一个 https 页面运行 http url 里的资源
        nodeIntegration: true, // 5.x以上版本，默认无法在渲染进程引入node模块，需要这里设置为true  //是否集成node，默认false
        webviewTag: true, // 允许使用<webview>标签
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // 拦截close事件
    this._browserWindow?.on("close", (e) => {
      if(!appState.allowExitApp){
        this._browserWindow?.webContents.send("show-close-primary-win-msgbox");
        e.preventDefault();
      }
    });

    this.openRouter("/primary");
  }

  protected registerIpcMainHandler(): void{
    ipcMain.on("minimize-main-window", (event) => {
      this._browserWindow?.minimize();
    });
  
    ipcMain.on("restore-main-window", (event) => {
      if(this.browserWindow){
        if(this.browserWindow.isMaximized())
          this.browserWindow.restore();
        else
          this.browserWindow.maximize();
      }
    });
  
    ipcMain.on("close-main-window", (event) => {
      this.browserWindow?.close();
    });

    ipcMain.on("message", (event, message) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      console.log(message);
    });
  
    ipcMain.on("show-frameless-sample-window", (event) => {
      if(!appState.framelessWindow?.valid){
        appState.framelessWindow = new FramelessWindow();
      }
      
      const win = appState.framelessWindow?.browserWindow;
      if(win){
        // 居中到父窗体中
        const parent = win.getParentWindow();
        if(parent){
          const parentBounds = parent.getBounds();
          const x = Math.round(parentBounds.x + (parentBounds.width - win.getSize()[0]) / 2);
          const y = Math.round(parentBounds.y + (parentBounds.height - win.getSize()[1]) / 2);

          win.setPosition(x, y, false);
        }
        win.show();
      }
    });

    ipcMain.on("clear-app-configuration", (event) => {
      appState.cfgStore?.clear();
    });
    
    function delay(time){
      return new Promise(resolve => setTimeout(resolve, time));
    }

    ipcMain.on("min-to-tray", (event) => {
      if(!this.isIpcMainEventBelongMe(event))
        return;

      this.browserWindow?.hide();

      // 托盘气泡消息只显示一次，用配置文件记录是否已经显示
      if(!appState.cfgStore?.get("TrayBalloonDisplayed", false) as boolean){
        appState.cfgStore?.set("TrayBalloonDisplayed", true);
        if(appState.tray){
          appState.tray.displayBalloon({
            title: "electron-vue-boilerplate",
            content: "客户端已经最小化到系统托盘。\n\n该气泡消息配置为只会显示一次!"
          });
        }
      }
    });
    
    ipcMain.handle("async-exit-app", async(event) => {
      // 暂停1500毫秒，模拟退出程序时的清理操作
      nl.unloadAll();
      await delay(1500);
      appState.allowExitApp = true;
      app.quit();
    });

    ipcMain.on("http-get-request", (event, url) => {
      axiosInst.get(url)
        .then((rsp) => {
          dialog.showMessageBox(this._browserWindow!, {
            message: `在主进程中请求 ${url} 成功！状态码：${rsp.status}`,
            type: "info"
          });
        })
        .catch((err) => {
          dialog.showMessageBox(this._browserWindow!, {
            message: `在主进程中请求 ${url} 失败！错误消息：${err.message}`,
            type: "error"
          });
        });
    });
  }
}

export default PrimaryWindow;