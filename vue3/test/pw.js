// playwright
const { _electron: electron } = require('playwright');
const path = require('path');

(async () => {
  var appPath = path.join(__dirname, '../../vue3/dist_electron/mac/vue3.app/Contents/MacOS/vue3');
  const electronApp = await electron.launch({ executablePath: appPath });

  const mainWindow = await electronApp.firstWindow();
  console.log(await mainWindow.title());
  await mainWindow.click('#newPage');
  setTimeout(async ()=>{
    const windows = await electronApp.windows();
    console.log('windowCount: ', windows.length);
    const secondWindow = windows[1];
    console.log(await secondWindow.title());
    await electronApp.close();
  }, 1000);
})();