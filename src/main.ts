import { ID, PASSWORD } from './env';
import login from './login';
//import {Registeration} from './modules/registeration';

// require to parse json
const courses = require('../courses.json');

/**
 * @desc Main async wrapper for the puppeteer code
 */
async function main() {
  const loggedIn = await login(ID, PASSWORD);
  if (!loggedIn) {
    console.error('failed to login');
    return;
  }

  /* const fetcher = new TableFetcher(page);
  const tables = await fetcher.getTableData(); */

  //const reg = new Registeration(page);
  //await reg.handleReg(PASSWORD, courses);

  // await page.browser().close();
}

process.on('unhandledRejection', (...args) => {
  console.error(...args);
  // ! CHROME HAS TO LIVE
  // * This is done to prevent chrome from closing on any
  // * malfunction on any page
});

main().catch(console.error);
