/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file 当前目录的代码只能被渲染进程所使用
 */

import { OpenDialogOptions, OpenDialogReturnValue } from "electron";

class Print{
  public openPrintPreview(){
    return (window as any).__PrintUtils__.openPrintPreview();
  }
}
  
const print = new Print();

export default print;