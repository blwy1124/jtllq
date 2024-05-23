/**
 * @file 当前目录的代码只能被主进程所使用
 */
import { app, session, ipcMain, BrowserWindow } from "electron";
import path from "path";
import * as PrintUtil from "./print-util";
import appState from "../../../main/app-state";
import SilentPrintWindow from "../../../main/windows/silentPrint";
import log from "electron-log/main";
import { as } from "koffi";


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
ipcMain.handle("electron-print-open-print-window", async(event, printType, printOptionArr) => {
  // 参数验证
  if(!printOptionArr || printOptionArr.length < 1){
    throw new Error("Invalid parameters: printOptionArr不能为空!");
  }
  if(!printType){
    throw new Error("Invalid parameters: printType不能为空!");
  }
  if(printType == "" || printType === "browser"){
    if(printOptionArr.length === 1){
      const printOption = printOptionArr[0];
      const url = printOption["url"];
      if(!url){
        throw new Error("打印内容url不能为空!");
      }
      const options = printOption["options"];
      const isSecondaryCall = printOption["isSecondaryCall"];
      // 创建窗口
      const ss = new SilentPrintWindow(url, options, isSecondaryCall);
      console.log("0.执行语句");
      const win = ss.browserWindow;
      // 设置父窗口
      win?.setParentWindow(BrowserWindow.fromWebContents(event.sender));
      // 等待打印完毕
      const res = await startPrint(url, ss);
      console.log("6.终于打印回来了");
      win?.close();
      win?.destroy();
      console.log("7.关闭敞口");
      return Promise.resolve(res);
    }else if(printOptionArr.length > 1){
      // 批量
      // await batchPrint(null, {}, null);
    }
  }else if(printType === "fr3"){
    event.returnValue = "还未开发";
  }
});


ipcMain.handle("electron-print-get-printer-list", async(event) => {
  // 获取到打印机列表
  const list = await event.sender.getPrintersAsync();
  return list;
});
// 直接打印暂时没用
ipcMain.on("electron-print-silent-print-current-window", (event) => {
  event.sender.print();
});
// === FALG LINE (DO NOT MODIFY/REMOVE) ===
// 加载地址

const json = {};
async function startPrint(url:string, silentPrintWindow?: SilentPrintWindow){
  return new Promise((resolve, reject) => {
    silentPrintWindow?.openRouter(url);
    // ipcMain.removeHandler("electron-print-end");
    json[silentPrintWindow?.browserWindow?.webContents.id || ""] = (event, res) => {
      if(res){
        console.log("===========" + url);
        resolve(res);
      }
    };
  });
}

ipcMain.handle("electron-print-end", async(event, res) => {
  json[event.sender.id](event, res);
});
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


export default print;
export {
  PrintUtil
};