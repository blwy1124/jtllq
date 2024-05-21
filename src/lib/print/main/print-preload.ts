import { contextBridge, ipcRenderer, OpenDialogOptions, WebContentsPrintOptions } from "electron";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronPrintUtils__", {
        // 打开一个地址，并打印
        openPrintWindow: (printType:string, printOptions: JSON) => {
          ipcRenderer.send("electron-print-open-print-window", printType, printOptions);
        },
        // 获取打印机列表
        getPrinterList: () => ipcRenderer.invoke("electron-print-get-printer-list"),
        // 打印当前页面
        printCurrentWindow: () => ipcRenderer.invoke("electron-print-silent-print-current-window"),
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();