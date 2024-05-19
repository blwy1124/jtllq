import path from "path";
import { BrowserWindow, WebContentsPrintOptions, ipcMain } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";
import SilentPrintWindow from "../silentPrint";

class PrintWindow extends WindowBase{
  constructor(){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 600,
      height: 360,
    
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      // 设置父窗口
      parent: appState.primaryWindow?.browserWindow as BrowserWindow,
    });

    this.openRouter("/print");
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

    ipcMain.on("print-test", (event) => {
      // 测试
      this.browserWindow?.webContents.print(
        { silent: true,
          deviceName: "导出为WPS PDF" });
    });

    ipcMain.on("get-printer-list", async(event) => {
      const list = await event.sender.getPrintersAsync();
      console.log(list);
      event.returnValue = list;
    });

    ipcMain.on("silent-Print", (event) => {
      // 测试
      if(!appState.silentPrintWindow?.valid){
        const options: WebContentsPrintOptions = { silent: true, deviceName: "Microsoft Print to PDF" };
        appState.silentPrintWindow = new SilentPrintWindow("/index1", options, false);
      }
      const win = appState.silentPrintWindow?.browserWindow;
      // 使用 electron-print-preview
      win?.webContents.openDevTools();
      // win?.show();
    });
  }
}

export default PrintWindow;