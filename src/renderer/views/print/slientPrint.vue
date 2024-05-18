<template>
  <div>
    <webview ref="webview" :src="webviewUrl" style="width: 100%; height: 600px;" />
  </div>
</template>
<script setup lang="ts">
import { webContents } from "electron";
import { onMounted, ref } from "vue";

// 要加载的网页地址
const webviewUrl = ref("https://www.baidu.com");
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).silentWindowAPI;
}
onMounted(() => {
  // 等待页面加载完成后再执行打印功能
  printWebview();
});
const printWebview = () => {
  // 获取 webview 实例
  const webview = document.querySelector("webview");
  if(!webview) return;

  // 获取 webview 的 HTML 内容
  const htmlContent = webview.outerHTML;
  getElectronApi().printSilentWindow(htmlContent);
};


</script>