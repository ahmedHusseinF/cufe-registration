const { handleError, delay, BASE_URL, REG_URL } = require('./utils');

/**
 * @desc This class handles the login logic for the automation
 */
class Login {
  /**
   * @desc Login logic
   * @todo indject puppeteer into the class
   */
  constructor(browser) {
    this.ID = this.PASSWORD = '';
    this.browser = browser;

    if (typeof process.env.ID === 'string') {
      this.ID = process.env.ID;
    }
    if (typeof process.env.PASSWORD === 'string') {
      this.PASSWORD = process.env.PASSWORD;
    }
  }

  async login() {
    try {
      const tab = await this.browser.newPage();
      await tab.goto(BASE_URL, {
        // NEVER TIMEOUT ON ME BOII
        timeout: 0,
        waitUntil: 'domcontentloaded'
      });

      const results = await Promise.all([
        tab.$('#txtUsername'),
        tab.$('#txtPassword'),
        tab.$('#ext-gen24')
      ]);

      const userField = results[0],
        passField = results[1],
        loginButton = results[2];

      await userField.type(this.ID);
      await passField.type(this.PASSWORD);
      await loginButton.click();

      await delay(1500);

      const pageContent = await tab.content();

      await tab.close();

      if (pageContent.includes('incorrect')) {
        console.error('detected incorrect');
        return false;
      }

      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }
}

module.exports = Login;
