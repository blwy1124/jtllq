/* eslint-disable @typescript-eslint/no-explicit-any */

import { ProgressCallback, Result } from "../../shared";
import NativeLibraryBase from "../../shared/NativeLibraryBase";

/**
 * SimpleDll
 * 因为不支持传function, 所以koffi的异步特性无法使用，但可以在渲染层模拟
 */
class SimpleDll implements NativeLibraryBase{
  public unload(): void{
    return (window as any).__ElectronSimpleDllNativeLibrary__.unload();
  }

  // 假设这个函数是来自一个DLL文件
  public add(a: number, b: number): Result{
    return (window as any).__ElectronSimpleDllNativeLibrary__.add(a, b);
  }

  /**
   *  因为不支持传function, 所以koffi的异步特性无法使用
   * @param i 
   * @param j 
   * @param pcb 
   * @returns 
   */
  public addSync(i: number, j: number, pcb: ProgressCallback): Result{
    return (window as any).__ElectronSimpleDllNativeLibrary__.addSync(i, j, pcb);
  }
}

export default SimpleDll;