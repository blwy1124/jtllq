<template>
  <div class="webview">
    <webview />
    <div class="indicator" />
  </div>
</template>
<script>
  
  
export default {
  name: "WebView",
  data(){
    return {
        
    };
  },
  created(){
    // 1. Before the DOM has been set up
    this.initialize();
  },
  mounted(){
    // 2. The DOM is ready to go now
    this.ready();
  },
  methods: {
    initialize(){
      // ...
      console.log("Before the DOM has been set up");
    },
    ready(){
      // ...
      console.log("The DOM is ready to go now");
      const webview = document.querySelector("webview");
      const indicator = document.querySelector(".indicator");
  
      const loadstart = () => {
        indicator.innerText = "loading...";
      };
  
      const loadstop = () => {
        indicator.innerText = "";
      };
  
      const domReady = () => {
        webview.openDevTools();
      };
        
  
      webview.addEventListener("did-start-loading", loadstart);
      webview.addEventListener("did-stop-loading", loadstop);
      webview.addEventListener("dom-ready", domReady);
  
      this.loadpreload();
  
      webview.setAttribute("src", "http://127.0.0.1:8080/");
      webview.setAttribute("preload", "../preload.js");
    },
    destroy(){
      // ...
      console.log("The DOM is destroy to go now");
    },
  
    async loadpreload(){
  
    },
  },
};
  
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
  