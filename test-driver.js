const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function testDriver() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        console.log("Testing driver with Google...");
        await driver.get('https://www.google.com');
        console.log("Title:", await driver.getTitle());
    } catch (e) {
        console.error("Driver test failed:", e.message);
    } finally {
        await driver.quit();
    }
})();
