import Login from "./login";
import PuppeteerWrapper from "./puppeteer";

export interface Course {
  code: string;
  lecDay: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | number;
  lecLocation: string;
  lecStart: number;
  tutLocation: string;
  tutStart: number;
}

/**
 * @desc this is for registeration process
 */
export default class Registeration {
  puppeteer: PuppeteerWrapper;
  regUrl = `https://std.eng.cu.edu.eg/SIS/Modules/MetaLoader.aspx?path=~/SIS/Modules/Student/Registration/Registration.ascx`;
  days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4
  };
  /**
   *
   * @param {PuppeteerWrapper} puppeteer
   */
  constructor(puppeteer: PuppeteerWrapper) {
    this.puppeteer = puppeteer;
  }

  /**
   * @desc converts normal day string to an index for window.TimeTable traversal
   * @param {string} day
   * @return {number}
   * @memberof Registeration
   */
  convertDay(
    day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday"
  ): number {
    return this.days[day];
  }

  /**
   * @desc this inits the registeration process by going to the page
   * @memberof Registeration
   */
  async initReg() {
    await this.puppeteer.gotoPage(this.regUrl);

    const pageContent = await this.puppeteer.getPageContent();
    if (pageContent.includes("closed")) {
      // reg hasn't yet opened
      return false;
    }

    await this.puppeteer.clickButtonWithNavigation("#ctl08_ButMessageShown");

    return true;
  }

  /**
   * @desc this is the MAIN entry point to perform all the registeration
   * @param {string} username
   * @param {string} password
   * @param {any[]} courses
   */
  async handleReg(username: string, password: string, courses: Course[]) {
    const isLogged = await this.handleLogin(username, password);
    console.log({ isLogged });
    if (isLogged) {
      let isOk = await this.initReg();

      while (!isOk) {
        isOk = await this.retry();
      }

      courses = courses.map(course => {
        if (typeof course.lecDay !== "number")
          course.lecDay = this.convertDay(course.lecDay);
        return course;
      });

      await this.selectLectures(courses);

      const clickedButton = await this.puppeteer.clickButtonWithNavigation(
        "#ctl08_nextPage"
      );

      if (!clickedButton) {
        return console.log("DRY RUNNNNNN");
      }

      //await this.handleCaptchaPage(password);
    }
  }

  /**
   * @description handles login activity
   * @param {string} username
   * @param {string} password
   */
  async handleLogin(username: string, password: string) {
    const loginHandler = new Login(this.puppeteer);

    return await loginHandler.login(username, password);
  }

  /**
   * @desc inject the courses into the window.TimeTable and
   * UpdateStudentTimeTable to calculate the credits and open the next button
   * @param {any[]} theCourses
   * @memberof Registeration
   */
  async selectLectures(theCourses: Course[]) {
    // @ts-ignore
    await this.puppeteer.evaluate(function(courses) {
      // * BROWSER CONTEXT
      // * too much ts-ignore here because this is browser
      // @ts-ignore
      courses.every(val => {
        const code = val.code;
        const lecDay = val.lecDay;
        const lecLocation = val.lecLocation;
        const lecStart = val.lecStart;
        const tutLocation = val.tutLocation;
        const tutStart = val.tutStart;
        // @ts-ignore
        const lecDayLectures = window.TimeTable[lecDay].Lectures;
        // @ts-ignore
        lecDayLectures.every(lec => {
          if (
            lec.Code.toLowerCase() === code.toLowerCase() &&
            lec.Location.includes(lecLocation.toLowerCase()) &&
            parseInt(lec.Start) === (lecStart + 5) % 12
          ) {
            lec.Selected = true;
            if (lec.Group !== "" && lec.Group !== ",") {
              // this lecture has tutorials
              // @ts-ignore
              const tutsArray = GetLecturesFromID(lec.Group);
              // @ts-ignore
              tutsArray.every(tut => {
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
      UpdateStudentTimeTable();
      // @ts-ignore
    }, theCourses);
  }

  /**
   * @desc it keeps refreshing the page until the registeration opens
   * @return {boolean}
   * @memberof Registeration
   */
  async retry() {
    await this.puppeteer.clickButtonWithNavigation("#ctl08_ButCheckOpen");

    const tabContent = await this.puppeteer.getPageContent();

    return !tabContent.includes("closed");
  }

  /**
   * @desc this handles the form of the captcha page
   * @param {string} password
   * @memberof Registeration
   */
  async handleCaptchaPage(password: string) {
    await this.puppeteer.typeIntoField("#ctl08_txtPassword", password);

    // focus on the captcha
    /* await this.puppeteer.typeIntoField(
        'input[name="ctl08$CaptchaControl1"]',
        ''
    ); */

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
