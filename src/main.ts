import dotenv from 'dotenv';
import {Pptr} from './modules/pptr';
import {Login} from './modules/login';
// import {TableFetcher} from './modules/fetcher';
import {Registeration} from './modules/registeration';
// require to parse json
const courses = require('../courses.json');

dotenv.config();

const ID = process.env.ID;
const PASSWORD = process.env.PASSWORD;

/**
 * @desc Main async wrapper for the puppeteer code
 */
async function main() {
  if (typeof ID === 'undefined' || typeof PASSWORD === 'undefined') {
    throw new TypeError(`ID and PASSWORD have to both exist in .env file`);
  }

  const page = await Pptr.bootstrap();

  const login = new Login(page);
  await login.login(ID, PASSWORD);

  /* const fetcher = new TableFetcher(page);
  const tables = await fetcher.getTableData(); */

  const reg = new Registeration(page);
  await reg.handleReg(PASSWORD, courses);

  // await page.browser().close();
}

process.on('unhandledRejection', (...args) => {
  console.error(...args);
  // ! CHROME HAS TO LIVE
  // * This is done to prevent chrome from closing on any
  // * malfunction on any page
});

main().catch(console.error);
