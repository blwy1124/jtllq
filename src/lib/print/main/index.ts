/**
 * @file 当前目录的代码只能被主进程所使用
 */
import { app, session, ipcMain } from "electron";
import path from "path";
import * as PrintUtil from "./print-util";
import appState from "../../../main/app-state";
import SilentPrintWindow from "../../../main/windows/silentPrint";


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
ipcMain.on("electron-print-open-print-window", async(event, printOptionArr) => {
  // 参数验证
  if(!printOptionArr || printOptionArr.length < 1){
    throw new Error("Invalid parameters: printOptionArr不能为空!");
  }
  if(printOptionArr.length === 1){
    const printOption = printOptionArr[0];
    const url = printOption["url"];
    const printType = printOption["printType"];
    if(!url){
      throw new Error("打印内容url不能为空!");
    }
    if(!printType || printType === "browser"){
      const options = printOption["options"];
      const isSecondaryCall = printOption["isSecondaryCall"];
      appState.silentPrintWindow = new SilentPrintWindow(url, options, isSecondaryCall);
      const win = appState.silentPrintWindow?.browserWindow;
      win?.show();
    }else{
      event.returnValue = "还未开发";
    }
  }else if(printOptionArr.length > 1){
    // 批量
    await batchPrint(null, {}, null);
  }
});

ipcMain.handle("electron-print-get-printer-list", async(event) => {
  // 获取到打印机列表
  const list = await event.sender.getPrintersAsync();
  return list;
});
// === FALG LINE (DO NOT MODIFY/REMOVE) ===

// 批量
async function batchPrint(urls, options, isHandle){
  for (let i = 0;i < urls.length;i++){
    appState.silentPrintWindow = new SilentPrintWindow(urls, options, isHandle);
    const win = appState.silentPrintWindow?.browserWindow;
  }
}
export default print;
export {
  PrintUtil
};