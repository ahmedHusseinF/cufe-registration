import puppeteer from 'puppeteer';
import { navigationIdleWait } from './constants';

let _browser: Maybe<puppeteer.Browser> = undefined;

async function getBrowser() {
  if (_browser) {
    return _browser;
  }

  return (_browser = await puppeteer.launch({
    headless: process.env.DEBUG_MODE !== '1',
  }));
}

export async function getPage() {
  const browser = await getBrowser();
  const pages = await browser.pages();
  if (pages.length === 0) {
    return await browser.newPage();
  }
  return pages[0];
}

export async function clickLink(page: puppeteer.Page, selector: string) {
  await Promise.all([page.waitForNavigation(navigationIdleWait), page.click(selector)]);
}
