/*
* This code can only be used in the main process.
*/

import { ipcMain } from "electron";
import log from "electron-log/main";
import NativeLibrary from "./NativeLibrary";
import SimpleDll from "./lib/SimpleDll";

log.info("[SimpleDll] loading");
const simpleDll = new SimpleDll();
ipcMain.handle("electron-native-library-simple-dll-add", (event, i, j) => {
  return simpleDll.add(i, j);
});

ipcMain.handle("electron-native-library-simple-dll-addSync", (event, i, j, pcb) => {
  return simpleDll.addSync(i, j, pcb);
});

ipcMain.on("electron-native-library-simple-dll-unload", () => {
  return simpleDll.unload();
});
log.info("[SimpleDll] loaded");

const nl = new NativeLibrary();
export default nl;
