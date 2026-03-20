import path from 'path'
import { app } from 'electron'
import windowManager from './windowManager.js'
import trayManager from'./trayManager.js'
import shortcutManager from './shortcut/shortcutManager.js'
import contextManager from "./context/contextManager.js"
import AutoLaunch from "./utility/autoLaunch.js"

// app.disableHardwareAcceleration();
//app.commandLine.appendSwitch('disable-gpu');

//app.commandLine.appendSwitch('disable-webrtc');
// 1. 设置多个信任源，中间用逗号隔开，不要有空格
const insecureOrigins = [
  'http://47.121.124.140',
  'http://192.168.31.194'
].join(',');

// 2. 将此标志添加到 Chromium 命令行
// 注意：必须在 app 准备就绪（ready）之前调用
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', insecureOrigins);

// 3. (可选但建议) 配合禁用某些安全警告，以便更好地在不安全源上运行
 app.commandLine.appendSwitch('allow-insecure-localhost'); 


app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('ignore-certificate-errors');

app.commandLine.appendSwitch("disable-features", "WebRtcHideLocalIpsWithMdns");
app.commandLine.appendSwitch("force-webrtc-ip-handling-policy", "disable_non_proxied_udp");
app.commandLine.appendSwitch('lang', 'zh-CN');

app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled')
app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process')

if(process.env.PORTABLE_EXECUTABLE_DIR){
  app.setPath('userData', path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'tuboshu-user-data'))
}

app.isQuitting = false;
app.isMac = (process.platform === 'darwin');
app.singleLock = app.requestSingleInstanceLock();

app.whenReady().then(() => {
  if (!app.singleLock) return app.quit();

  windowManager.createWindow();
  trayManager.createTray();
  shortcutManager.initShortcuts();
  contextManager.createContextMenu();
  AutoLaunch.initAutoLaunch();
})


app.on('before-quit', () => {
  app.isQuitting = true;
  const win = windowManager.getWindow();
  if (win && !win.isDestroyed()) {
    win.close();
  }
});
app.on('will-quit', () => {
  shortcutManager.unregisterAll();
  trayManager.destroyTray();
})

app.on('window-all-closed', () => {
  if (app.isMac) app.dock.hide();
  else app.quit();
})

app.on('activate', () => {
  if (!windowManager.getWindow()) {
    windowManager.createWindow();
  }else{
    windowManager.getWindow().show();
  }
})


app.on('second-instance', () => {
  windowManager.getWindow()?.show();
})

app.on('render-process-gone', (event, webContents, details) => {
  if (details.reason === 'crashed') {
    windowManager.getMenuView().webContents.reload();
  }
});

// 添加进程异常处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error)
})

process.on('uncaughtException', (err) => {
  console.error('主进程崩溃:', err);
});