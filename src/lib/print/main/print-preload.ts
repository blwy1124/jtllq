import { contextBridge, ipcRenderer, OpenDialogOptions } from "electron";

function initialize(){
  if(!ipcRenderer){
    return;
  }

  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronPrintUtils__", {
        openPrintPreview: () => ipcRenderer.send("electron-print-open-print-preview"),
        getPrinterList: () => ipcRenderer.send("electron-print-get-printer-list"),
        
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();