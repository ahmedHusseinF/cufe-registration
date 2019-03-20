import { ID, PASSWORD } from "./modules/config";
import Registeration from "./modules/registeration";
import Puppeteer from "./modules/puppeteer";

process.on("unhandledRejection", (...args) => {
  console.error(...args);
  // ! CHROME HAS TO LIVE
  // * This is done to prevent chrome from closing on any
  // * malfunction on any page
  //// process.exit(0);
});

(async () => {
  const p = await Puppeteer.build();
  const reg = new Registeration(p);

  ["ID", "PASSWORD"].map(varr => {
    if (process.env[varr])
      throw new TypeError(
        `${varr} doesn't exist at runtime in the .env file, please add it`
      );
  });

  await reg.handleReg(ID as string, PASSWORD as string, []);
})();

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
