<template>
  <div class="contents">
    <a-button @click="onOpenDevTools">
      Open DevTools
    </a-button>
    <a-button @click="getPrinters">
      getPrinters
    </a-button>
    <p>选择打印机</p>
    <select>
      <option />
      <div v-for="(printer, index) in printerList" :key="index" :value="printer">
        {{ printer }}
      </div>
    </select>
  </div>
</template>
  
<script setup lang="ts">
import utils from "@utils/renderer";
import { ipcRenderer, WebContentsPrintOptions } from "electron";
import log from "electron-log/renderer";
import { onBeforeUnmount, onMounted } from "vue";
let printerList: Array<string>[] = [];
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).printPreviewWindowAPI;
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
  let list = await getElectronApi().getPrinters();
  log.info(list);
  list.forEach((item: { name: string[]; }) => {
    printerList.push(item.name);
  });
}

function printWindow(){
  const windowTitle = window.document.querySelector(".window-title");
  windowTitle && windowTitle.remove(); // 删除顶部标题关闭按钮
  try {
    getElectronApi().print({ silent: true, deviceName: "导出为WPS PDF", margins: { marginType: "none" }, }); 
  } catch (error){
    console.log(error);
  } finally {
    // getElectronApi().destroyPrintPreviewWindow();// 打印完成销毁新窗口
  // eslint-disable-next-line no-irregular-whitespace
  }  
}

function removeListener(){
  getElectronApi().removeListener();
}

onMounted(async() => {
  await getPrinters();
  printWindow();
});
onBeforeUnmount(() => {  
  removeListener();  
}); 
</script>
  
  <style>
  
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
  