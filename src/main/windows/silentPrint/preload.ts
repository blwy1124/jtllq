import { WebContentsPrintOptions, contextBridge, ipcRenderer } from "electron";
import log from "electron-log";

/*
暴露printPreview窗口主进程的方法到printPreview窗口的渲染进程
*/
contextBridge.exposeInMainWorld("silentWindowAPI", {
  printSilentWindow: () => ipcRenderer.invoke("print-silent-window"),
});
