// 微信小程序插件类型声明
declare function requirePlugin(name: string): any

// 微信语音识别插件类型
declare namespace WechatSI {
  interface RecorderManager {
    start(options: RecorderOptions): void
    stop(): void
    onStart(callback: (res: any) => void): void
    onStop(callback: (res: { result: string; tempFilePath: string }) => void): void
    onRecognize(callback: (res: { result: string }) => void): void
    onError(callback: (err: { errMsg: string }) => void): void
  }

  interface RecorderOptions {
    duration: number
    lang: string
    format?: string
    frameSize?: number
  }

  interface WechatSIPlugin {
    getRecorderManager(): RecorderManager
  }
}

// 扩展 Taro 和全局对象
declare global {
  // eslint-disable-next-line no-var
  var requirePlugin: (name: string) => any
}

export {}
