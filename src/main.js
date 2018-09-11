require('dotenv').config();
const puppeteer = require('puppeteer-core');
const Login = require('./login');
const Registeration = require('./reg');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.PATH_TO_CHROME
    });

    const login = new Login(browser);

    const isLogged = await login.login();

    if (isLogged) {
      const reg = new Registeration(browser);

      await reg.handleReg();
    } else {
      console.error(`Something went wrong`);
      process.exit(1);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
