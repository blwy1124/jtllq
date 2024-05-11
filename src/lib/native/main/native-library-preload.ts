import { contextBridge, ipcRenderer } from "electron";
import { ProgressCallback } from "../shared";

function initialize(){
  if(!ipcRenderer){
    return;
  }
  
  if(contextBridge && process.contextIsolated){
    try {
      contextBridge.exposeInMainWorld("__ElectronSimpleDllNativeLibrary__", {
        add: (i: number, j: number) => ipcRenderer.invoke("electron-native-library-simple-dll-add", i, j),
        addSync: (i: number, j: number, pcb: ProgressCallback) => ipcRenderer.invoke("electron-native-library-simple-dll-addSync", i, j, pcb),
        unload: () => ipcRenderer.send("electron-native-library-simple-dll-unload")
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();