<template>
  <!-- <div class="titlebar">
    <span class="title">打印测试窗口</span>
    <div class="buttons">
      <div class="button" @click="onMinimizeWindow">
        <font-awesome-icon icon="fa-solid fa-minus" color="#9d9d9d" />
      </div>
      <div class="button" @click="onRestoreWindow">
        <font-awesome-icon icon="fa-solid fa-window-restore" color="#9d9d9d" />
      </div>
      <div class="button" @click="onCloseWindow">
        <font-awesome-icon icon="fa-solid fa-xmark" color="#9d9d9d" />
      </div>
    </div>
  </div> -->
  <div class="contents">
    <a-button @click="onOpenDevTools">
      Open DevTools
    </a-button>
    <a-button @click="onShowPrint">
      打印预览
    </a-button>
    <a-button @click="printTest">
      直接打印
    </a-button>
    <a-button @click="getPrinters">
      获取打印机列表
    </a-button>
    <a-button @click="fetchHTML">
      获取网页内容
    </a-button>
  </div>
  <div v-if="prehtml" v-html="prehtml" />
</template>
  
<script setup lang="ts">
import utils from "@utils/renderer";
import log from "electron-log/renderer";
import axios from "axios";
import { ref } from "vue";
const prehtml = ref<string>("");
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).printWindowAPI;
}

async function fetchHTML(){
  // const url = "https://www.runoob.com/html/html-tutorial.html"; // 替换为你想获取内容的网址
  // try {
  //   const response = await axios.get(url);
  //   prehtml.value = response.data; // 将网页内容赋值给 html 变量
  // } catch (error){
  //   console.error("获取网页内容失败:", error);
  // }
  // eslint-disable-next-line max-len
  prehtml.value = '<html lang="en"><head><meta charset="UTF-8"><style>div{margin: 10px;}</style><title>PDF print demo</title></head><body style="background-color: white"><div><button id="print">打印HTML内容</button></div><div><label for="story" style="display: block;">请输入要打印的html:</label><textarea id="story" name="story" rows="5" cols="33" style="font-size: 17px"><div style="color: cornflowerblue;font-size: 22px">hello world</div></textarea></div></body></html>';
  getElectronApi().fetchHTML();
}
  
function onMinimizeWindow(){
  getElectronApi().minimizeWindow();
}
  
function onRestoreWindow(){
  getElectronApi().restoreWindow();
}
  
function onCloseWindow(){
  getElectronApi().closeWindow();
}
  
function onOpenDevTools(){
  utils.openDevTools();
}

async function getPrinters(){
  log.info(await getElectronApi().getPrinters());
}
function onShowPrint(){
  getElectronApi().showPrintPreviewWindow();
}
// 直接打印测试
function printTest(){
  getElectronApi().printTest();
}
</script>
  
  <style scoped>

  .titlebar {
    -webkit-app-region: drag;
    height: 36px;
    background-color: #1f1f1f;
  
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0px 0 10px;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #ffffff;
  }
  
  .buttons {
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
  }
  
  .contents {
    display: flex;
    justify-content: center;
    padding-top: 50px;
  }
  .button {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
  
    &:hover {
      background-color: #666666;
    }
  }
  
  </style>
  