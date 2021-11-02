/**
 * @jest-environment node
 */
 const spectron = require('spectron');
 const { testWithSpectron } = require('vue-cli-plugin-electron-builder');
 (async () => {
   try {
    // Wait for dev server to start
    const { app, stopServe } = await testWithSpectron(spectron);
    const win = app.browserWindow;
    const { client } = app;
  
    //   // Window was created
    //   expect(await client.getWindowCount()).toBe(1);
    const c = await client.getWindowCount();
    console.log('c: ', c);
    //   // It is not minimized
    //   expect(await win.isMinimized()).toBe(false);
    //   // Window is visible
    //   expect(await win.isVisible()).toBe(true);
    //   // Size is correct
      const { width, height } = await win.getBounds();
      console.log('width, height: ', width, height);
    //   expect(width).toBeGreaterThan(0);
    //   expect(height).toBeGreaterThan(0);
    //   // App is loaded properly
    //   expect(/Welcome to Your Vue\.js (\+ TypeScript )?App/.test(await (await app.client.$('#app')).getHTML())).toBe(true);
  
    await stopServe();
   } catch (error) {
     console.log('error: ', error);
   }
 })();
 