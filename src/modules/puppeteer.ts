import puppeteer from "puppeteer";

let instance: PuppeteerWrapper | undefined = undefined;
/**
 *  @desc The main Wrapper for puppeteer APIs
 */
class PuppeteerWrapper {
  browser: puppeteer.Browser | null = null;
  private _page: puppeteer.Page | null = null;
  /**
   * @desc Create a browser instance to use in all modules
   * @param {{browser: puppeteer.Browser, page: puppeteer.Page}} BrowserStuff
   */
  constructor({
    browser,
    page
  }: {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
  }) {
    this.browser = browser;
    this._page = page;
    instance = this;
  }

  get page() {
    if (!this._page) return null;

    return this._page;
  }

  /**
   * @desc this static method follows builder pattern to get the browser
   * and the current tab async then create the Puppeteer object
   * @return {Puppeteer}
   */
  static async build(): Promise<PuppeteerWrapper> {
    if (instance) return instance;

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.PATH_TO_CHROME
    });

    const tabs = await browser.pages();

    return new PuppeteerWrapper({
      browser,
      page: tabs[0]
    });
  }

  /**
   * @desc clicks on a <button> or <a> and next for potential navigation
   * @param {string} selector
   * @throws
   */
  async clickButtonWithNavigation(selector: string) {
    if (!this._page) return false;

    const navigationPromise = this._page.waitForNavigation({
      timeout: 0,
      waitUntil: "domcontentloaded"
    });

    const returnValue = await this._page.evaluate(selector => {
      const $el = document.querySelector(selector);
      if (!$el) {
        return false;
      }
      $el.click();
      return true;
    }, selector);

    if (!returnValue) return false;

    await navigationPromise;

    return returnValue;
  }

  /**
   * @desc just make sure to reload the page
   *
   * @memberof PuppeteerWrapper
   */
  reload() {}

  /**
   * @desc just a wrapper around page.on
   * @param {string} eventType
   * @param {Function} callback
   * @memberof PuppeteerWrapper
   */
  async hookEventOnPage(
    eventType: any,
    callback: (e: any, ...args: any[]) => {}
  ) {
    if (!this._page) return;
    this._page.on(eventType, callback);
  }

  /**
   * @desc clicks on any element
   * @param {string} selector
   * @memberof PuppeteerWrapper
   * @throws
   */
  async clickElementWithoutNavigation(selector: string) {
    if (!this._page) return false;
    return await this._page.evaluate(selector => {
      const $el = document.querySelector(selector);
      if (!$el) {
        return false;
      }
      $el.click();
      return true;
    }, selector);
  }

  /**
   * @desc type a text into a certain input field
   * @param {string} selector
   * @param {string} text
   * @throws
   */
  async typeIntoField(selector: string, text: string) {
    if (!this._page) return false;

    return await this._page.evaluate(
      (selector, text) => {
        const $el = document.querySelector(selector);
        if (!$el) {
          return false;
        }
        $el.value = text;
        return true;
      },
      selector,
      text
    );
  }

  /**
   * @desc navigates the current tab to a new url
   * @param {string} url
   * @throws
   */
  async gotoPage(url: string) {
    if (!this._page) return;

    const resp = await this._page.goto(url);
    return resp;
  }

  /**
   * @desc this is a wrapper around page.evaluate
   * @param {Function} callback
   * @param {any[]} args
   * @memberof PuppeteerWrapper
   */
  async evaluate(callback: any, ...args: puppeteer.SerializableOrJSHandle[]) {
    if (!this._page) return;
    return await this._page.evaluate(callback, ...args);
  }

  /**
   * @desc get the html content of the current page
   * @return {string}
   * @memberof PuppeteerWrapper
   */
  async getPageContent() {
    if (!this._page) return "";
    const pageContent = await this._page.content();
    return pageContent;
  }

  /**
   * @desc download a certain image (captcha)
   *
   * @param {string} imageSelector
   * @return {Buffer}
   * @memberof PuppeteerWrapper
   */
  async getImage(imageSelector: string) {
    if (!this._page) return;
    const image = await this._page.$(imageSelector);

    if (!image) return;

    let buffer = await image.screenshot({
      omitBackground: true
    });

    return buffer;
  }
}

export default PuppeteerWrapper;
