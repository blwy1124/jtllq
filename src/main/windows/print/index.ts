import path from "path";
import { ipcMain, BrowserWindow } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";

class PrintWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      parent: appState.primaryWindow?.browserWindow as BrowserWindow,
    });

    this.openRouter("/printPreview");
  }
  

  protected registerIpcMainHandler(): void{
    // 一个简单的 IPC 示例
    ipcMain.on("send-message", (event, message) => {
      console.log(message);
    });

    ipcMain.on("webview-print-request", (event, options) => {  
      
    });  

    // 添加更多的 ipcMain 处理函数
  }
}

export default PrintWindow;
