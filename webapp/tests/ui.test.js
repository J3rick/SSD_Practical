const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Search webapp - UI test (Selenium, over HTTP)', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('submits a valid search term and shows the result page', async () => {
    await driver.get(BASE_URL + '/');
    await driver.findElement(By.id('q')).sendKeys('selenium123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('selenium123'));
    assert.ok(body.includes('Back to Home'));
  });
});
