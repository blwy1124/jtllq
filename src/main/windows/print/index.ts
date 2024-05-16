import path from "path";
import { BrowserWindow, ipcMain } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";
import PrintPreviewWindow from "../printPreview";
import SlientPrintWindow from "../slientPrint";

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

    ipcMain.on("show-print-preview-window", (event) => {
      if(!appState.printPreviewWindow?.valid){
        appState.printPreviewWindow = new PrintPreviewWindow();
      }
      
      const win = appState.printPreviewWindow?.browserWindow;
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

    ipcMain.on("slient-Print", (event) => {
      // 测试
      if(!appState.slientPrintWindow?.valid){
        appState.slientPrintWindow = new SlientPrintWindow();
      }
      const win = appState.slientPrintWindow?.browserWindow;
      win?.webContents.openDevTools();
      win?.show();
    });
  }
}

export default PrintWindow;