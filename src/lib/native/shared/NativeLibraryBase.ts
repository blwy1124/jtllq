interface NativeLibraryBase {

    /**
     * 卸载动态链接库
     */
    unload(): void;
}


export default NativeLibraryBase;