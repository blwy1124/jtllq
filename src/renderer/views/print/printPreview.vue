<template>
  <div class="webview">
    <webview />
    <div class="indicator" />
  </div>
</template>

<script setup lang="ts">
import utils from "@utils/renderer";
import ptint from "@print/renderer";


</script>
    <style>
    @media (min-width: 1024px) {
      .webview {
        min-height: 100vh;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }
    
      .webview webview{
        width: 100%;
        height: 100vh;
      }
      
    }
    </style>
    