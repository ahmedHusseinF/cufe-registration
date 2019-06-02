import puppeteer from 'puppeteer-core';
import {
  navigationIdleWait,
  LOGIN_FORM_USERNAME,
  typingDelayOptions,
  LOGIN_FORM_PASSWORD,
  INCORRECT_LOGIN_CREDS,
  LOGIN_FORM_SUBMIT_BTN,
} from './constants';

/**
 * @desc This class handles logging to the portal ONLY
 */
export class Login {
  page: puppeteer.Page;
  loginUrl = `https://std.eng.cu.edu.eg`;
  /**
   * @desc bind the puppeteer instance
   * @param {puppeteer.Page} puppeteer
   */
  constructor(page: puppeteer.Page) {
    this.page = page;
  }

  /**
   * @desc login the user using those creds
   * @param {string} username
   * @param {string} password
   */
  async login(username: string, password: string) {
    await this.page.goto(this.loginUrl, navigationIdleWait);

    await this.page.type(LOGIN_FORM_USERNAME, username, typingDelayOptions);
    await this.page.type(LOGIN_FORM_PASSWORD, password, typingDelayOptions);

    await Promise.all([
      this.page.waitForNavigation(navigationIdleWait),
      this.page.click(LOGIN_FORM_SUBMIT_BTN),
    ]);

    const pageContent = await this.page.content();

    if (pageContent.includes(INCORRECT_LOGIN_CREDS)) {
      // TODO: send notification for bad username/password
      console.error('detected incorrect login credentials');
      return false;
    }

    return true;
  }
}
