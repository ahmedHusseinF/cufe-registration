import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import {Registeration} from './modules/registeration';

dotenv.config();

const ID = process.env.ID;
const PASSWORD = process.env.PASSWORD;

/**
 * @desc Main async wrapper for the puppeteer code
 */
async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.PATH_TO_CHROME,
  });

  const currentTabs = await browser.pages();

  const reg = new Registeration(currentTabs[0]);

  if (typeof ID === 'undefined') {
    return;
  }
  if (typeof PASSWORD === 'undefined') {
    return;
  }

  await reg.handleReg(ID, PASSWORD, []);
}

main().catch(console.error);

(async () => {})();

/*
  {
    code: 'cmpn402',
    lecDay: 'Wednesday',
    lecLocation: '3704',
    lecStart: 11,
    tutLocation: '18303',
    tutStart: 8,
  }
 */

process.on('unhandledRejection', (...args) => {
  console.error(...args);
  // ! CHROME HAS TO LIVE
  // * This is done to prevent chrome from closing on any
  // * malfunction on any page
});
