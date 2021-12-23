// spectron: 基于 WebdriverIO
const { Application } = require('spectron');
const path = require('path');

(async () => {
  const appPath = path.join(__dirname, '../../vue3/dist_electron/mac/vue3.app/Contents/MacOS/vue3');
  const app = new Application({ path: appPath });

  try {
    await app.start();
    let title = await app.client.getTitle();
    console.log(title);
    const newPage = await app.client.$('#newPage');
    await newPage.click();
    const windowCount = await app.client.getWindowCount();
    console.log('windowCount: ', windowCount);
    // 如果业务需要多窗口测试，代码会很繁琐
    await app.client.switchWindow('baidu.com');
    title = await app.client.getTitle();
    console.log(title);
  } catch (error) {
    console.error('Test failed', error.message);
  }
  await app.stop();
})();

