import { WebContentsPrintOptions, contextBridge, ipcRenderer } from "electron";

/*
暴露printPreview窗口主进程的方法到printPreview窗口的渲染进程
*/
contextBridge.exposeInMainWorld("printPreviewWindowAPI", {
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  restoreWindow: () => ipcRenderer.send("restore-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  print: (options: WebContentsPrintOptions) => ipcRenderer.send("print-window", options),
  destroyPrintPreviewWindow: () => ipcRenderer.send("print-destroy-preview-window"),
  getPrinters: () => ipcRenderer.invoke("print-get-printers"), 
  removeListener: () => ipcRenderer.send("remove-listener"),
});
