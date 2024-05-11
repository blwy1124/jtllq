import { app, session } from "electron";
import path from "path";
import koffi from "koffi";
import { NativeLibraryError } from "../shared";
import { GetErrorMessage } from "../../utils/shared";

class NativeLibrary{
  public initialize(){
    this._preloadFilePath = path.join(__dirname, "native-library-preload.js");
    // console.log("File download preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);
  
    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }

  public getLib(fileName: string){
    if(this._dylibMap.has(fileName)){
      return this._dylibMap.get(fileName);
    }
    return void 0;
  }

  public getLibPath(fileName: string){    
    let libpath = "../../../dylib/";
    switch (process.platform){
      case "linux":
        libpath += fileName + ".so";
        break;
      case "win32":
      default:
        libpath += fileName + ".dll";
        break;  
    }
    
    return path.resolve(__dirname, libpath);
  }

  /**
     * 加载动态链接库
     * @param fileName 库名称
     * @returns 
     */
  public load(fileName: string){
    if(fileName === void 0 || fileName.length === 0){
      throw Error("fileName is empty");
    }
  
    if(this._dylibMap.has(fileName)){
      return this._dylibMap.get(fileName);
    }
    
    let lib;
    const libpath = this.getLibPath(fileName);
    // 加载动态链接库
    try {
      lib = koffi.load(libpath);
      this._dylibMap.set(fileName, lib);
    } catch (e){
      throw new NativeLibraryError(`Library load error: ${GetErrorMessage(e)}, path: ${libpath}`);
    }
    
    return lib;
  }
  
  /**
     * 卸载库
     * @param fileName 库名称
     */
  public unload(fileName: string){
    if(this._dylibMap.has(fileName)){
      this._dylibMap.get(fileName).unload();
      this._dylibMap.delete(fileName);
    }
  }
  
  /**
     * 卸载所有库
     */
  public unloadAll(){
    if(this._dylibMap.size > 0){
      this._dylibMap.forEach(lib => lib.unload());
    }
  }
  
  /**
     * 获取已注册的类型，防止页面刷新。因为页面刷新不取消已注册的类型
     * @param name 注册的类型名称
     * @param register 注册方法
     * @returns 
     */
  public getRegistedType(name: string, register){
    let type;
    try {
      type = koffi.resolve(name); // koffi.type
    } catch (error){
      register && (type = register());
    }
    return type;
  }
    
  protected setPreload(session){
    session.setPreloads([ ...session.getPreloads(), this._preloadFilePath ]);
  }
  
  protected _preloadFilePath : string = "";
  protected _dylibMap = new Map();
}

export default NativeLibrary;