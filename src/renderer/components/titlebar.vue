<template>
  <div class="titlebar">
    <span class="title black">{{ title }}</span>
    <div class="buttons">
      <div class="button" @click="onOpenDevTools">
        <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" class="black" />
      </div>
      <div class="button" @click="onMinimizeWindow">
        <font-awesome-icon icon="fa-solid fa-minus" class="black" />
      </div>
      <div class="button" @click="onRestoreWindow">
        <font-awesome-icon icon="fa-solid fa-window-restore" class="black" />
      </div>
      <div class="button close" @click="onCloseWindow">
        <font-awesome-icon icon="fa-solid fa-xmark" class="black" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import utils from "@utils/renderer";

defineProps({
  title: { type: String, default: "" },
});

function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).primaryWindowAPI;
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
  console.log("open dev tools");
  utils.openDevTools();
}

</script>

<style scoped>
  .titlebar {
    -webkit-app-region: drag;
    height: 36px;
    background-color: #eff4f9;
  
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0px 0 10px;
  }

  .title {
    font-size: 14px;
    font-weight: 10px;
  }
  
  .buttons {
    -webkit-app-region: no-drag;

    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .button {
    width: 38px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button:hover {
    background-color: #e5e5e5;
  }

  .close:hover {
    background-color: #e81123;
  }

  .black{
    color: black;
  }
</style>
