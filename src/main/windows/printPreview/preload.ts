import { contextBridge, ipcRenderer } from "electron";

/*
暴露printPreview窗口主进程的方法到printPreview窗口的渲染进程
*/
contextBridge.exposeInMainWorld("printPreviewWindowAPI", {
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  restoreWindow: () => ipcRenderer.send("restore-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  print: () => ipcRenderer.send("print-window"),
  destroyPrintPreviewWindownt: () => ipcRenderer.send("print-print-preview-window"),
});
