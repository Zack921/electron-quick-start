// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// const {ipcRenderer} = require('electron')

// //发送asynchronous-message事件到主进程
// ipcRenderer.send('asynchronous-message', 'ping')

// //接收主进程的asynchronous-reply通知
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log('asynchronous-reply : args:',arg)
//   const message = `Asynchronous message reply: ${arg}`
//   document.getElementById('async-reply').innerHTML = message
// })

window.api.receive("fromMain", (data) => {
  console.log(`Received ${data} from main process`);
});

window.api.send("toMain", "some data");

window.api.sendTo(2, "ping", "some data");