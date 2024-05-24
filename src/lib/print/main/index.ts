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
import { ref } from "vue";


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
 * [{
 *    url:"",  //打印页面地址数组 例："https://www.runoob.com/vue3/vue3-directives.html"
 *	  options:{} //按照Electron中webcontents  contents.print([options], [callback]) options传参即可
 *    isSecondaryCall: true调用窗口函数print在打印，false:调用后即打印。不传默认直接打印
 * } 
 * ]
 * 
 * 
 */
ipcMain.handle("electron-print-open-print-window", async(event, printType, printOptionArr) => {
  // 参数验证
  if(!printOptionArr || printOptionArr.length < 1){
    throw new Error("Invalid parameters: printOptionArr不能为空!");
  }
  if(!printType){
    throw new Error("Invalid parameters: printType不能为空!");
  }
  // 判断打印类型
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
      const printWindow = new SilentPrintWindow(url, options, isSecondaryCall);
      console.log("0.执行语句");
      const win = printWindow.browserWindow;
      // 设置父窗口
      win?.setParentWindow(BrowserWindow.fromWebContents(event.sender));
      // 等待打印完毕
      const res = await startPrint(url, printWindow);
      console.log("6.终于打印回来了");
      win?.close();
      win?.destroy();
      console.log("7.关闭窗口");
      return Promise.resolve(res);
    }else if(printOptionArr.length > 1){
      // 批量
      const resArr = await batchPrint(event, printOptionArr);
      return resArr;
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

// === FALG LINE (DO NOT MODIFY/REMOVE) ===

const json = {};
async function startPrint(url:string, silentPrintWindow?: SilentPrintWindow) : Promise<JSON>{
  return new Promise((resolve, reject) => {
    silentPrintWindow?.openRouter(url);
    json[silentPrintWindow?.browserWindow?.webContents.id || ""] = (event, res) => {
      if(res){
        resolve(res);
      }else{
        reject({ "success": "false", "failureReason": "本次打印未返回结果" });
      }
    };
  });
}

// 打印完毕回来
ipcMain.handle("electron-print-end", async(event, res) => {
  json[event.sender.id](event, res);
});

// 批量打印
async function batchPrint(event, printOptionArr){
  const resArr: JSON[] = [];
  let win;
  for (let i = 0;i < printOptionArr.length;i++){
    const printOption = printOptionArr[i];
    const url = printOption["url"];
    const options = printOption["options"];
    const isSecondaryCall = printOption["isSecondaryCall"];
    const printWindow = new SilentPrintWindow(url, options, isSecondaryCall);
    win = printWindow.browserWindow;
    win?.show();
    let res:JSON;
    // eslint-disable-next-line prefer-const
    res = await startPrint(url, printWindow);
    console.log("6.终于打印回来了");
    win?.close();
    win?.destroy();
    console.log("7.关闭窗口");
    resArr.push(res);
  }
  return resArr;
}


export default print;
export {
  PrintUtil
};