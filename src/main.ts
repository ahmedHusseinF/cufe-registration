import dotenv from 'dotenv';
import puppeteer from 'puppeteer-core';
import {Registeration} from './modules/registeration';
const courses = require('../courses.json');

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

  if (typeof ID === 'undefined' || typeof PASSWORD === 'undefined') {
    throw new TypeError(`ID and PASSWORD have to both exist in .env file`);
  }

  await reg.handleReg(ID, PASSWORD, courses);
}

process.on('unhandledRejection', (...args) => {
  console.error(...args);
  // ! CHROME HAS TO LIVE
  // * This is done to prevent chrome from closing on any
  // * malfunction on any page
});

main().catch(console.error);
