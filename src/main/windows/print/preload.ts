import { contextBridge, ipcRenderer } from "electron";

/*
暴露print窗口主进程的方法到print窗口的渲染进程
*/
contextBridge.exposeInMainWorld("printWindowAPI", {
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  restoreWindow: () => ipcRenderer.send("restore-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  showPrintPreviewWindow: () => ipcRenderer.send("show-print-preview-window"),
  printTest: () => ipcRenderer.send("print-test")
});
