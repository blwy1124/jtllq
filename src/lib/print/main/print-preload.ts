import { contextBridge, ipcRenderer, OpenDialogOptions, WebContentsPrintOptions } from "electron";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronPrintUtils__", {
        // 打开一个地址，并打印
        openPrintWindow: async(printType:string, printOptions: JSON, callback) => {
          const res = await ipcRenderer.invoke("electron-print-open-print-window", printType, printOptions);
          callback(res);
        },
        // 获取打印机列表
        getPrinterList: () => ipcRenderer.invoke("electron-print-get-printer-list"),
        // 打印当前页面
        printCurrentWindow: () => ipcRenderer.invoke("electron-print-silent-print-current-window"),
        // 打印当前页面
        printHandle: ipcRenderer.on("silent-print-end", (event, res) => {
          console.log("4.ipcRenderer.silent-print-end打印页面渲染进程监听成功!");
          ipcRenderer.invoke("electron-print-end", res);
        })
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();