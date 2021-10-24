var Application = require('spectron').Application
const path = require('path');
var assert = require('assert')

// var appPath = path.join(__dirname, '../../vue3/dist_electron/win-unpacked/vue3.exe');
var appPath = path.join(__dirname, '../../vue3/dist_electron/mac/vue3.app/Contents/MacOS/vue3');
console.log('appPath: ', appPath);

var app = new Application({
  path: appPath
})

const verifyWindowIsVisibleWithTitle = async (app) => {
  await app.start()
  try {
    // let clippings = await app.client.$('#title');
    // console.log('clippings: ', clippings);

    // Check if the window is visible
    const isVisible = await app.browserWindow.isVisible()
    // Verify the window is visible
    assert.strictEqual(isVisible, true)
    // Get the window's title
    const title = await app.client.getTitle()
    // Verify the window's title
    assert.strictEqual(title, 'My App')
  } catch (error) {
    // Log any failures
    console.error('Test failed', error.message)
  }
  // Stop the application
  await app.stop()
}

verifyWindowIsVisibleWithTitle(app)

