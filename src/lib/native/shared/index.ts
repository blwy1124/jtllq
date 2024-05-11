/* eslint-disable @typescript-eslint/no-explicit-any */
/*
* This code can be used in both renderer and main process.
*/

class NativeLibraryError extends Error{}

enum NativeLibraryName{
  SimpleDll = "SimpleDll",
}

interface Result{
  value: any;
  error: string;
}

interface ProgressCallback {
  (...args): void;
}

export {
  NativeLibraryName,
  NativeLibraryError,
  type Result,
  type ProgressCallback,
};