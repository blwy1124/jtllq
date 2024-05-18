/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file 当前目录的代码只能被渲染进程所使用
 */

import { OpenDialogOptions, OpenDialogReturnValue, PrinterInfo } from "electron";

class Print{
  public openPrintWindow(){
    return (window as any).__ElectronPrintUtils__.openPrintWindow();
  }
  public async getPrinterList() : Promise<PrinterInfo>{
    return await (window as any).__ElectronPrintUtils__.getPrinterList() as PrinterInfo;
  }
}
  
const print = new Print();

export default print;