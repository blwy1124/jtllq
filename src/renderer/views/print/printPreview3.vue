<template> 
  <div>  
    <!-- 其他组件内容 -->  
    <!-- <webview id="myWebview" src="https://example.com" style="width: 640px; height: 480px;" />   -->
    <button @click="printWebview">
      打印 Webview
    </button>  
  </div>  
</template>  
  
<script lang="ts">  
import { defineComponent, ref } from "vue";  
import { ipcRenderer } from "electron";  
  
export default defineComponent({  
  name: "MyComponent",  
  setup(){  
    const printWebview = () => {  
      // 发送 IPC 消息到主进程请求打印  
      ipcRenderer.send("webview-print", "myWebview", {  
        silent: false, // 是否静默打印  
        printBackground: true // 是否打印背景  
        // ... 其他选项 ...  
      });  
    };  
  
    return {  
      printWebview  
    };  
  }  
}); 


</script>  
  
<style scoped>  
/* 样式 */  
</style>