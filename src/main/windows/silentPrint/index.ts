import path from "path";
import { BrowserWindow, WebContentsPrintOptions, ipcMain, ipcRenderer } from "electron";
import WindowBase from "../window-base";
import log from "electron-log/main";
import appState from "../../app-state";

const json = {};
class SilentPrintWindow extends WindowBase{
  private router:string;
  private options:WebContentsPrintOptions;
  private isSecondaryCall:boolean = false;
  constructor(router : string, options: WebContentsPrintOptions, isSecondaryCall: boolean){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 800,  
      height: 1000,  
      show: false, // 可以先隐藏窗口，打印后再显示  
      webPreferences: {  
        nodeIntegration: false, // 根据你的需求启用或禁用  
        contextIsolation: true, // 推荐启用  
        webviewTag: true, // 允许使用<webview>标签
        // 可以在这里添加 preload 脚本以安全地暴露 ipcRenderer API  
        preload: path.join(__dirname, "preload.js"),
        webSecurity: false
      }
    });
    this.router = router;
    this.options = options;
    this.isSecondaryCall = isSecondaryCall;
   
    json[this.browserWindow?.webContents.id || ""] = async(event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      const parent = win?.getParentWindow();
      log.info("这是event.sender.print外部:" + event.sender.id);
      log.info("2.打印前的通信监听print-silent-window:" + parent?.webContents.getTitle());
      await event.sender.print(this.options, (success, failureReason) => {
        log.info("3.准备开始打印!");
        log.info("这是event.sender.print内部:" + event.sender.id);
        event.sender.send("silent-print-end", { "result": success, "failureReason": failureReason });
      }); 
      delete json[event.sender.id];
    };
  } 

  protected registerIpcMainHandler(): void{ 
    this._browserWindow?.webContents.on("did-finish-load", (event) => {
      console.log("1.did-finish-load:页面加载完成!");
      if(!this.isSecondaryCall){
        event.sender.executeJavaScript("window.silentWindowAPI.printSilentWindow();");
        // this.printWindow(event, this.options);
      }
    });
    
    ipcMain.on("closed", () => {
      appState.silentPrintWindow = null;
    });
  }
}
// 打印
ipcMain.handle("print-silent-window", async(event) => {  
  json[event.sender.id](event);
});

export default SilentPrintWindow;