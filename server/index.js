let gui;
let win;
try {
  gui = require("nw.gui");
  let path = require("path");

  const baseDir = path.dirname((process.main ? process.main : process.mainModule).filename);
  win = gui.Window.open("file://" + baseDir + "/about.html");
} catch (error){
  console.log(error);
}

let jquery = require("jquery");
let koffi = require("koffi");


/**
 * 获取本地库
 * @param {*} path 本地库路径，不需要跟文件扩展名
 * @returns 
 */
function getNativeLib(path){
  let lib;
  try {
    switch (nw.process.platform){
      case "linux":
        lib = koffi.load(path + ".so");
        break;
      case "mac":
        break;
      case "win32":
      default:
        lib = koffi.load(path + ".dll");
        break;  
    }
  } catch (e){
    console.log(e);
  }
  return lib;
}


/**
 * 获取已注册的类型，防止页面刷新。因为页面刷新不取消已注册的类型
 * @param {*} name 注册的类型名称
 * @param {*} register 注册方法
 * @returns 
 */
function getRegistedType(name, register){
  let type;
  try {
    type = koffi.resolve(name);
  } catch (error){
    register && (type = register());
  }
  return type;
}

console.log(jquery);

const lib = getNativeLib("lib/SimpleDll");

function callFnc(){
  try {
    const add = lib.func("int add(int i, int j)");
    console.log(add(1, 2));
    
    let cb = getRegistedType("TransferCallback", () => koffi.proto("void TransferCallback(int i, int j)"));
    const addSync = lib.func("addSync", "void", [ "int", "int", koffi.pointer(cb) ]);
    let ret = addSync(10, 1, (a, b) => {
      console.log(a, b);
    });
    console.log(ret);
  } catch (error){
    console.log(error);
  }
}


function free(){
  // koffi.free(TransferCallback);
}