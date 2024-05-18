import { contextBridge, ipcRenderer, OpenDialogOptions, WebContentsPrintOptions } from "electron";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronPrintUtils__", {
        openPrintWindow: (printOptions: JSON) => {
          ipcRenderer.send("electron-print-open-print-window", printOptions);
        },
        getPrinterList: () => ipcRenderer.invoke("electron-print-get-printer-list"),
        getPrinterList1: () => ipcRenderer.on("electron-print-get-printer-list", () => {

        })
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();