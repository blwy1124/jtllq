import path from "path";
import { BrowserWindow, WebContentsPrintOptions, ipcMain } from "electron";
import WindowBase from "../window-base";
import appState from "../../app-state";
import print from "../../../lib/print/main";
class SilentPrintWindow extends WindowBase{
  private router:string;
  private options:WebContentsPrintOptions;
  private isHandle:boolean = false;
  constructor(router : string, options: WebContentsPrintOptions, isHandle: boolean){
    // 调用WindowBase构造函数创建窗口
    super({
      width: 800,  
      height: 1000,  
      show: true, // 可以先隐藏窗口，打印后再显示  
      webPreferences: {  
        nodeIntegration: false, // 根据你的需求启用或禁用  
        contextIsolation: true, // 推荐启用  
        webviewTag: true, // 允许使用<webview>标签
        // 可以在这里添加 preload 脚本以安全地暴露 ipcRenderer API  
        preload: path.join(__dirname, "preload.js"),
        webSecurity: false
      }
    });
    this.router = router;
    this.options = options;
    this.isHandle = isHandle;
    // this.openNetworkRouter("https://www.runoob.com/vue3/vue3-directives.html");
    // eslint-disable-next-line max-len
    // this.openNetworkRouter("http://39.99.237.1:9091/ydwriter/ydwriter/ydwriter.jsp?s=c547b2fdc097d1913db3c2126f913cbece4d7b804c8070c72f17a6c99ffb297730ea9b4b99101ba34812a05bbcc72027f7658d7587aa440367557a35bb9119324e0c6228dd0e7670d6a017ebe646ffc8645b52b043b65e3630315f44ae01ffbabcabcf4ca9108c4d312290b9ec4665762637a366130abe707c5e322928be01fd&p=c25d029f3c81134c58e9b39f312cbf3aa9c2603a6bcf4f24d16005f7d5024343a4c9ba78c14e1b79cb8b16cac85396297c99b3d2145aef0edc50466579d4fc387ce0264d15dfc89d13d219e568e18bba06f8d8975b6c18dfcc4ff8eeba0d33cd8d9e4d1f86ff9ad1ee7484d3c603796274a839bfcd0d292d9abf9e632b9215fb069db6860a3e937f09266859c3c8ac8bba13a89ad6f90de5cbb384f4a2c2e99a1b7da3932533d87ac2f53b711cfb3c4e83de8584fc73ec220ba96bfd7c9f9fd9f5a5ee0152b0b245116a329f548a436a41b5a23c61df054f3a92c00b76b9cc180bcd8f354efeee0ec5add5b98d43e5919b3ef17451557bf18501f05563ce04d8c816006e3da6d18acb75e2a7d9fcc4b75af2c3a124b93f31cff7d509c75a486114e4cac097b441b59c9cb3e57e9495769730331cd1c7dc8ad15d3d899db34abe868a77ab4dc55ced9188e90dcbaad7d6851fcba66d7d55df99b457340d62af9d11c8f1a7971ecbc439d5d53b234cec40ee9019edb2ad311c0edc7f36f4581e4ad194ffda0c7bbde643ff37ec4c9a0df449980afa29a133193cb4b5f2f3edb4f0b769a58666a0d951661faf2d0632cfd2b1d656f73f576bd284aba3bbe78d07c92cd3f07092cc90b70a2328aec4cd2d6a7b9704b7d60d3ffd898ef439d2c62208a687c4b60b22a7a777f2961657a0d2deb17568b430f329befe3a15d67adad46d010178962d4b4583c5e3ef3541efbd0db90cf0e62786af3626a128291a153b752cb13ed3ab4c701682f046ccf323424e2a20122ad6eaf93b0e679140a2aeacc826ee7c7c5cf1795a185e8647184a497c3e6c19a78e977b489881fe86b94fcae46ec834a4ef1cfef4774e289e3d57452e60a94f1b5d891965f35996f65493bb8b5f1eb54ad970eed66990c9bd6576b1177b11e66b19d47c314e4ade1b6c7bab27d8875d612fb72689ed410d60337b3cec4ba91386b863c6151035b9831eef8f53688e63be8e19ef19007c34a36fc09f704ac9cd7e67713acd284903b423fec8779f320b5c46db12eab70cab75755bd9e7c381ed294d4df30de15225d4225d8abdd46d11ef3f29d605bf8dcdef01ee76382ddb964ae5d725518989a73ece858f69f1160069e0b5e80bcba6df92c9a3b3c1391668b934966af6216b7ec6e3c66b4126aa0ccadd56539800e5957e39f51329da310c2ba4c6b74591816de605b387a52cff6d2679c88724e84c34a657e24feafc6b802b46a9b87d00f3517e55dd21ab4a6e79b1b7918aa62923a97615a3f0179d85538a8127e03ccca7f44321950706d153b61e6fb0adc38cf9b83e5d5a5cdb6b36024ac74ef58f39e68dd575806b5c99a9d1d859974f51438d881676c9efe49c5129070b2bd7e5c5f148249418282d7f45c3d187ca70ab7a86c78ebd23ef8269757d15059f2281a511e2f0d8ef53d2b844349ef65d047674c5afd473d230c126858234637a513dda90cc1809cc73626c56e63acad360335750aaa8df41aec1544d68c7253a74a9e49135e5498a586697dc8cd2c87a42d409e0cbbbfe826a63f547a07333adc219cac48b599adc9b1f37ed28192f22f151a5f617d3dbb60acf1697507503c8b7afb698a0e184d41e2af732258227e62c56eb3d1822054525809eb8bcdc88b2438f6e772deeac5a8d08bef8e2d523961f408ce3a5f17bcf023d01afdd73378c40439fc2a00dacfde4f8779fde8369ae7ef4bc8ecdb8dc1845033e18e620af00cb0859ce9bf69f1ea72fa87a804d16263e53256585bb7df52d7144ae798786ddad324122e45e8ea8f7b727ebd5836f041b4e342e1fbbe9785adb8bad3f0936de7c92d225f01f870e7da498f7e8e2909c36d80224d83a06407a652a7515de6830ccb2f19062e726d3d4218c97586c8a2ac4a87806ec62b8ba6e62f401eb684c0afb73bc6a1a76d7b986fa6ba1bd96daaee58ba7826086a166301d595ebdfd6bd57daf88318f1d62e13bf531cd4a819adc938f39c6b49e12cb82a0&o=2c54bca2be5272549eae11b5d1ceb7003a5916f9969b4bd6571b8dc76febebf4e7879cc5ff144417386d7aacca0f6d992ef506abc245a5d264774e390b530640");
    // this.openNetworkRouter("http://39.99.237.1:9091/webhis/");
    console.log(this.router);
    this.openRouter(this.router);
  }

  protected registerIpcMainHandler(): void{ 
    this._browserWindow?.webContents.on("did-finish-load", (event) => {
    //   this._browserWindow?.webContents.executeJavaScript(`
    //   console.log('Hello from executeJavaScript!');
    //   window.silentWindowAPI.printSilentWindow();
    //   console.log('Hello from 已执行!1111');
    // `);
      console.log(appState.silentPrintWindow?.options);
      event.sender.openDevTools();
      if(!this.isHandle){
        this.printWindow(event, this.options);
      }
    });

    ipcMain.on("print-silent-window", (event) => {  
      this.printWindow(event, this.options);
    });
  }
  private printWindow(event, options){
    const parent = this.browserWindow?.getParentWindow();
    event.sender.print(options, (success, failureReason) => {
      parent?.webContents.send("print-result", { "result": success, "failureReason": failureReason });
      // if(this.browserWindow){
      //   this.browserWindow.destroy();
      // }
    });
  }
}
export default SilentPrintWindow;