const { _electron: electron } = require('playwright');
const path = require('path');

(async () => {
  // Launch Electron app.
  // const appPath2 = path.join(__dirname, '../../vue3/dist_electron/bundled/background.js');
  var appPath2 = path.join(__dirname, '../../vue3/dist_electron/win-unpacked/vue3.exe');
  // var appPath2 = path.join(__dirname, '../../vue3/dist_electron/mac/vue3.app/Contents/MacOS/vue3');
  const electronApp = await electron.launch({ executablePath: appPath2 });

  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.getAppPath();
  });
  console.log(appPath);

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();
  // Print the title.
  console.log(await window.title());
  // Capture a screenshot.
  await window.screenshot({ path: 'intro.png' });
  // Direct Electron console to Node terminal.
  window.on('console', console.log);
  // Click button.
  await window.click('text=Click me');
  // Exit app.
  await electronApp.close();
})();