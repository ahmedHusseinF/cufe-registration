import PuppeteerWrapper from "./puppeteer";

/**
 *
 */
export default class Login {
  puppeteer: PuppeteerWrapper;
  loginUrl = `https://std.eng.cu.edu.eg`;
  /**
   * @desc bind the puppeteer instance
   * @param {!PuppeteerWrapper} puppeteer
   */
  constructor(puppeteer: PuppeteerWrapper) {
    this.puppeteer = puppeteer;
  }

  /**
   * @desc login the user using those creds
   * @param {string} username
   * @param {string} password
   */
  async login(username: string, password: string) {
    if (!this.puppeteer.page) return;

    await this.puppeteer.gotoPage(this.loginUrl);

    await this.puppeteer.typeIntoField("#txtUsername", username);
    await this.puppeteer.typeIntoField("#txtPassword", password);

    await this.puppeteer.clickButtonWithNavigation("#ext-gen24");

    const pageContent = await this.puppeteer.page.content();

    if (pageContent.includes("incorrect")) {
      // TODO: send notification for bad username/password
      console.error("detected incorrect");
      return false;
    }

    return true;
  }
}
