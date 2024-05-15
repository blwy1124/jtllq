/* eslint-disable space-before-function-paren */
import path from "path";
import { BrowserWindow, WebContentsPrintOptions, ipcMain } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";

class PrintPreviewWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      height: 595,
      useContentSize: true,
      width: 1140,
      autoHideMenuBar: true,
      minWidth: 842,
      frame: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: true,
        webSecurity: false,
      },
      // 设置父窗口
      parent: appState.primaryWindow?.browserWindow as BrowserWindow,
    });

    this.openRouter("/printPreview");
    // this.openNetworkRouter("http://www.baidu.com");
  }


  protected registerIpcMainHandler(): void{  
    ipcMain.on("minimize-window", (event) => {
      this._browserWindow?.minimize();
    });
  
    ipcMain.on("restore-window", (event) => {
      if(this.browserWindow){
        if(this.browserWindow.isMaximized())
          this.browserWindow.restore();
        else
          this.browserWindow.maximize();
      }
    });
  
    ipcMain.on("close-window", (event) => {
      this.browserWindow?.close();
    });

    ipcMain.handleOnce("print-get-printers", async (event) => {
      const list = await this.browserWindow?.webContents.getPrintersAsync();
      console.log("getPrintersAsync:" + list);
      return list;
    });

    ipcMain.on("print-window", (event, options: WebContentsPrintOptions) => {
      console.log(options);
      event.sender.print(
        options,
        (success: boolean, failureReason: string) => {
          console.log(success + ">" + failureReason);
        });
    });

    ipcMain.on("print-destroy-preview-window", (event) => {
      this.browserWindow?.destroy();
    });
    ipcMain.on("remove-listener", (event) => {
      // event.sender.removeListener(event,);
    });
  }
}

export default PrintPreviewWindow;