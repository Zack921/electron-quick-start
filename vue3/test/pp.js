const { spawn } = require('child_process');
const electron = require('electron');
const puppeteer = require('puppeteer-core');

const path = require('path');
const appPath = path.join(__dirname, '../../vue3/dist_electron/mac/vue3.app/Contents/MacOS/vue3');

const run = async () => {
  spawn(electron, [appPath, '--remote-debugging-port=9200'], {
    shell: true,
  });
  const startTime = Date.now();
  const timeout = 20000; // Timeout in miliseconds
  let app;
  while (!app) {
    try {
      app = await puppeteer.connect({
        browserURL: 'http://localhost:9200',
      });
      return app;
    } catch (error) {
      if (Date.now() > startTime + timeout) {
        throw error;
      }
    }
  }
};

run()
  .then((app) => {
    // 这里写测试代码
    setTimeout(async () => {
      const [page] = await app.pages();
      console.log(page);
      await page.waitForSelector('body'); //    选中dom元素
      const text = await page.$eval('body', (element) => element.innerText);
      console.log('text:', text);
    }, 3000);
  })
  .catch((err) => {
    console.log('error:', err);
  });