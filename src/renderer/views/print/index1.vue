<template>
  <!-- 这里是页面的可见内容 -->  
  <h1>欢迎来到我的网页</h1>  
  <p>这是一个段落。</p>  
  <!-- 可以添加更多的 HTML 元素 -->  
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
onMounted(() => {
  let count = 0;
  let interval = setInterval(() => {
    appendNode(count++);
    if(count > 10){
      clearInterval(interval);
    }
  }, 1000);
  function appendNode(count){
    let node = document.createElement("p");

    node.textContent = "打印 测试： + " + count;
    document.body.appendChild(node);
  }
});
</script>