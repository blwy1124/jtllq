import { contextBridge, ipcRenderer } from "electron";

/*
暴露printWindow窗口主进程的方法到printWindow窗口的渲染进程
*/
contextBridge.exposeInMainWorld("printWindowAPI", {
  // 一个简单的示例
  sendMessage: (message) => ipcRenderer.send("send-message", message),

  // 暴露更多的API到渲染进程...
});
