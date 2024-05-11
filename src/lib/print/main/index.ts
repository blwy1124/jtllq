/**
 * @file 当前目录的代码只能被主进程所使用
 */
import { app, session, BrowserWindow, ipcMain, shell, dialog, OpenDialogOptions } from "electron";
import path from "path";
import * as PrintUtil from "./print-util";
import appState from "../../../main/app-state";
import PrintWindow from "../../../main/windows/print";


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

  
ipcMain.on("electron-print-open-print-preview", (event) => {
  if(!appState.printWindow?.valid){
    appState.printWindow = new PrintWindow();
  }
  
  const win = appState.printWindow?.browserWindow;
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
// === FALG LINE (DO NOT MODIFY/REMOVE) ===
  
export default print;
export {
  PrintUtil
};