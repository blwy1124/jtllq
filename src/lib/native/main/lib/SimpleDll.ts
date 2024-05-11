/* eslint-disable @typescript-eslint/no-explicit-any */
import koffi from "koffi";
import { NativeLibraryName, ProgressCallback, Result } from "../../shared";
import NativeLibraryBase from "../../shared/NativeLibraryBase";
import nl from "../index";
import { GetErrorMessage } from "../../../utils/shared";

/**
 * SimpleDll
 * 因为不支持传function, 所以koffi的异步特性无法使用
 */
class SimpleDll implements NativeLibraryBase{
  public unload(): void{
    const lib = nl.getLib(NativeLibraryName.SimpleDll);
    lib && lib.unload();
  }

  /**
   * add
   * @param i 
   * @param j 
   * @returns 
   */
  public add(i: number, j: number){
    const result : Result = {
      value: null,
      error: "",
    };

    const lib = nl.load(NativeLibraryName.SimpleDll);
    try {
      const add = lib.func("int add(int i, int j)");
      result.value = add(i, j);
      return result;
    } catch (e){
      result.error = GetErrorMessage(e);
      return result;
    }
  }

  /**
   * 因为不支持传function, 所以koffi的异步特性无法使用
   * @param i 
   * @param j 
   * @param pcb 
   * @returns 
   */
  public addSync(i: number, j: number, pcb: ProgressCallback){
    const result : Result = {
      value: null,
      error: "",
    };

    const lib = nl.load(NativeLibraryName.SimpleDll);
    try {
      const cb = nl.getRegistedType("TransferCallback", () => koffi.proto("void TransferCallback(int i, int j)"));
      const addSync = lib.func("addSync", "void", [ "int", "int", koffi.pointer(cb) ]);
      const ret = addSync(10, 1, (a, b) => {
        pcb && pcb(a, b);
      });
      result.value = ret;
    } catch (e){
      result.error = GetErrorMessage(e);
      return result;
    }
  }
}

export default SimpleDll;