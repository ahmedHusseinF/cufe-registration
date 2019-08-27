import puppeteer from 'puppeteer-core';

export class Pptr {
  constructor() {}

  static async bootstrap() {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.PATH_TO_CHROME,
    });

    const pages = await browser.pages();
    return pages[0];
  }
}
