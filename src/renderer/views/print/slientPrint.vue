<template>
  <!-- <div>
    <iframe :src="url" width="100%" height="100%" />
  </div>  -->
  <webview id="foo" src="https://www.baidu.com" style="display:inline-flex; width:640px; height:480px" /> 
</template>
<script setup lang="ts">
import Webview from "@views/webview.vue";
import { webContents } from "electron";
import { ref } from "vue";

// 要加载的网页地址
const url = ref("https://www.baidu.com");

</script>