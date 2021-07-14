const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      preload: 'preloader.js'
    }
  })

  let url;
  if(process.env.NODE_ENV === 'DEV') {
    url = 'http://localhost:8080/';
    win.loadURL(url);
    win.webContents.openDevTools();

  } else {
    url = `dist/index.html`;
    win.loadFile(url);
  }

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})