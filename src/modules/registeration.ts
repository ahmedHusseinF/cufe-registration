import puppeteer from 'puppeteer-core';
// @ts-ignore
import {TesseractWorker} from 'tesseract.js';
import {resolve} from 'path';
import {Login} from './login';
import {
  CLOSED_REG_STRING,
  START_MSG_BUTTON_ID,
  SECOND_PAGE_NEXT_BUTTON_ID,
  navigationDOMWait,
  RETRY_PAGE_BUTTON_ID,
  navigationIdleWait,
  PASSWORD_INPUT_ID,
  CAPTCHA_INPUT_SELECTOR,
} from './constants';
import {truncate} from 'fs';

export interface Course {
  code: string;
  lecDay: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | number;
  lecLocation: string;
  lecStart: number;
  tutLocation: string;
  tutStart: number;
}

const worker = new TesseractWorker();

/**
 * @desc this is for registeration process top to bottom
 */
export class Registeration {
  regUrl = `https://std.eng.cu.edu.eg/SIS/Modules/MetaLoader.aspx?path=~/SIS/Modules/Student/Registration/Registration.ascx`;
  page: puppeteer.Page;
  days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
  };

  /**
   * @param {puppeteer.Page} page
   */
  constructor(page: puppeteer.Page) {
    this.page = page;
  }

  /**
   * @desc converts normal day string to an index for window.TimeTable traversal
   * @param {'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'} day
   * @return {number}
   */
  convertDay(day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday') {
    return this.days[day];
  }

  /**
   * @desc this inits the registeration process by going to the page
   */
  async initReg() {
    await this.page.goto(this.regUrl);

    const pageContent = await this.page.content();
    if (pageContent.includes(CLOSED_REG_STRING)) {
      // reg hasn't opened yet
      return false;
    }

    await Promise.all([
      this.page.waitForNavigation(navigationDOMWait),
      this.page.click(START_MSG_BUTTON_ID),
    ]);

    return true;
  }

  /**
   * @desc this is the MAIN entry point to perform all the registeration
   * @param {string} username
   * @param {string} password
   * @param {Course[]} courses
   */
  async handleReg(username: string, password: string, courses: Course[]) {
    const isLogged = await this.handleLogin(username, password);

    console.log({isLogged});

    if (isLogged) {
      let isOk = await this.initReg();

      while (!isOk) {
        isOk = await this.retry();
      }

      // all days should be indexed from 0 to 5
      courses = courses.map((course) => {
        if (typeof course.lecDay !== 'number') {
          course.lecDay = this.convertDay(course.lecDay);
        }
        return course;
      });

      await this.selectLectures(courses);

      const nextButton = await this.page.$(SECOND_PAGE_NEXT_BUTTON_ID);

      if (!nextButton) {
        return console.log('DRY RUNNNNNN');
      }

      await Promise.all([
        this.page.waitForNavigation(navigationDOMWait),
        this.page.click(SECOND_PAGE_NEXT_BUTTON_ID),
      ]);

      await this.handleCaptchaPage(password);
    }
  }

  /**
   * @description handles login activity
   * @param {string} username
   * @param {string} password
   */
  async handleLogin(username: string, password: string) {
    return await new Login(this.page).login(username, password);
  }

  /**
   * @desc inject the courses into the window.TimeTable and
   * UpdateStudentTimeTable to calculate the credits and open the next button
   * @param {Course[]} theCourses
   */
  async selectLectures(theCourses: Course[]) {
    // @ts-ignore
    await this.page.evaluate(function(courses) {
      // * BROWSER CONTEXT
      // * too much ts-ignore here because this is browser
      // * and typescripts complains a lot
      // @ts-ignore
      courses.every((course) => {
        const {
          code,
          lecDay,
          lecLocation,
          lecStart,
          tutLocation,
          tutStart,
        } = course;
        // @ts-ignore
        const lecDayLectures = window.TimeTable[lecDay].Lectures;
        // @ts-ignore
        lecDayLectures.every((lec) => {
          if (
            lec.Code.toLowerCase() === code.toLowerCase() &&
            lec.Location.includes(lecLocation.toLowerCase()) &&
            parseInt(lec.Start) === (lecStart + 5) % 12
          ) {
            lec.Selected = true;
            if (lec.Group !== '' && lec.Group !== ',') {
              // this lecture has tutorials
              // @ts-ignore
              const tutsArray = GetLecturesFromID(lec.Group);
              // @ts-ignore
              tutsArray.every((tut) => {
                if (
                  tut.Code.toLowerCase() === code.toLowerCase() &&
                  tut.Location.includes(tutLocation.toLowerCase()) &&
                  parseInt(tut.Start) === (tutStart + 5) % 12
                ) {
                  // select then abort the rest of the tuts
                  tut.Selected = true;
                  return false;
                }
                return true;
              });
            }
            // abort looping on lectures we selected
            return false;
          } else {
            return true;
          }
        });
        return true;
      });
      // @ts-ignore
      // need to call this function because it unlocks the next button
      UpdateStudentTimeTable();
      // @ts-ignore
    }, theCourses);
  }

  /**
   * @desc it keeps refreshing the page until the registeration opens
   * @return {boolean}
   */
  async retry() {
    await Promise.all([
      this.page.waitForNavigation(navigationIdleWait),
      this.page.click(RETRY_PAGE_BUTTON_ID),
    ]);

    const tabContent = await this.page.content();

    return !tabContent.includes(CLOSED_REG_STRING);
  }

  /**
   * @desc this handles the form of the captcha page
   * @param {string} password
   */
  async handleCaptchaPage(password: string) {
    await this.page.type(PASSWORD_INPUT_ID, password);
    await this.page.focus(CAPTCHA_INPUT_SELECTOR);

    const el = await this.page.$('img');

    if (!el) {
      console.error(`Captcha image somehow doesn't exist`);
      return;
    }

    // TODO: path.resolve
    const imagePath = resolve(
        __dirname,
        `../../tmp/${Math.floor(Math.random() * 100000)}.png`
    );

    await el.screenshot({
      path: imagePath,
      omitBackground: true,
    });

    worker
        .recognize(imagePath, 'eng')
        .progress((message: any) => console.log(message))
        .catch((err: Error) => console.error(err))
        .then((result: any) => {
          this.page
              .type(CAPTCHA_INPUT_SELECTOR, result.text.replace(/\n|\s/g, ''))
              .then((_) => {});
        });

    /* const imageBuffer = await this.puppeteer.getImage("img");

    const res = await tess.recognize(imageBuffer);
    console.log(res);

    okra.decodeBuffer(imageBuffer, (...res) => {
      console.log(...res);
    }); */
    // await this.puppeteer.typeIntoField(
    //    `input[name="ctl08$CaptchaControl1"]`,
    //    result.text.toLowerCase()
    // );
    // await this.puppeteer.clickButtonWithNavigation('#ctl08_ButAccept');
  }
}
