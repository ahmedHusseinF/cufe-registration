const { handleError, delay, BASE_URL, REG_URL } = require('./utils');

class Registeration {
  constructor(browser) {
    this.browser = browser;
    this.courses = [
      {
        code: 'elcn304',
        lecDay: 0,
        lecLocation: '18102',
        lecStart: 1,
        tutLocation: '18102',
        tutStart: 4
      },
      {
        code: 'elcn306',
        lecDay: 3,
        lecLocation: '20505',
        lecStart: 1,
        tutLocation: '20510',
        tutStart: 11
      },
      {
        code: 'genn201',
        lecDay: 0,
        lecLocation: '20505',
        lecStart: 9
      },
      {
        code: 'genn221',
        lecDay: 2,
        lecLocation: '18202',
        lecStart: 9
      },
      {
        code: 'ccen280',
        lecDay: 2,
        lecLocation: '1520',
        lecStart: 8
      },
      {
        code: 'cmpn205',
        lecDay: 3,
        lecLocation: '20503',
        lecStart: 9,
        tutLocation: '3201',
        tutStart: 2
      },
      {
        code: 'cmpn302',
        lecDay: 4,
        lecLocation: '3704',
        lecStart: 9,
        tutLocation: '3706',
        tutStart: 1
      },
      {
        code: 'cmpn303',
        lecDay: 4,
        lecLocation: '3704',
        lecStart: 11,
        tutLocation: '3708',
        tutStart: 4
      }
    ];
  }

  async initReg() {
    this.tab = await this.browser.newPage();

    const page = await this.tab.goto(`${BASE_URL}${REG_URL}`);

    const pageContent = await this.tab.content();

    // TODO: get the closed reg status
    if (pageContent.includes('closed')) {
      return false;
    }

    const nextButton = await this.tab.$('#ctl08_ButMessageShown');
    const navigationPromise = this.tab.waitForNavigation();

    await nextButton.click();

    // the next button will cause navigation, wait for end of it
    await navigationPromise;

    return true;
  }

  async handleReg() {
    let isOk = await this.initReg();

    while (!isOk) {
      isOk = await this.retry();
    }

    //TODO: fix reInit on retries
    //await this.initReg();

    // guranteed opened
    await this.selectLectures();

    // get the nextButton then click on it
    const nextButton = await this.tab.$('ctl08_nextPage');
    if (nextButton !== null) {
      const navigationPromise = this.tab.waitForNavigation();
      await nextButton.click();
      await navigationPromise;
    } else {
      // it is dry run, don't do anything
      console.log('WAITINGGGG');
    }
  }

  async selectLectures() {
    await this.tab.evaluate(function(courses) {
      // BROWSER CONTEXT
      courses.every(val => {
        const code = val.code;
        const lecDay = val.lecDay;
        const lecLocation = val.lecLocation;
        const lecStart = val.lecStart;
        const tutLocation = val.tutLocation;
        const tutStart = val.tutStart;

        const lecDayLectures = window.TimeTable[lecDay].Lectures;

        lecDayLectures.every(lec => {
          if (
            lec.Code.toLowerCase() === code.toLowerCase() &&
            lec.Location.includes(lecLocation.toLowerCase()) &&
            parseInt(lec.Start) === (lecStart + 5) % 12
          ) {
            lec.Selected = true;
            if (lec.Group !== '' && lec.Group !== ',') {
              // this lecture has tutorials
              const tutsArray = GetLecturesFromID(lec.Group);
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
            // abort we selected
            return false;
          } else {
            return true;
          }
        });
        return true;
      });
      UpdateStudentTimeTable();
    }, this.courses);
  }

  async retry() {
    // TODO: get the retry button ID
    const retryButton = await this.tab.$('#retryButton');

    const navigationPromise = this.tab.waitForNavigation();

    await retryButton.click();

    // TODO: look into the retry page for random delays
    // await delay(3000);
    await navigationPromise;
  }

  // ksm el 7z
  // bysgl kol 7aga w 5b5555555555555555555555555555555555555555555555555555555555555555555555555555
  // the power of automation in chrome
  //3ayzeen nehost automation fashee5 bkaza senario maslan kaza gadwal
  //we n5aleeh dynamic fel id we elpassword wala maynfa3sh??
  // enta bttklm m3 7awy ?

  // b3ml loading ll id w el pass mn enviroment variables f file dynamic
  // bnsba l dynamic courses da yb2a lazm yfetch el gdwl w da knt 3aml f 7ta tanya

  async selectCourse(timeTableLec, myLec) {}
}

module.exports = Registeration;

// bos da b2a, be amazed
//tb howa e7na leh bn5aleh yebtedy mn elog in e7na 3ayzeeno yebted mn elretry l7ad ma yefta7 eltasgeel we ye5osh y7ot elmawad 3ala too.__dirname............
// w8 h3mlk 7aga

// ft7 3ady s7 ?

// wlad el ws5a 7aten delays 3shan ys3bo el automation
// bs 3eb 3lek el power of chrome and google is big

//plus kman 3rft leh el retry bya5d w2t
// 3shan mt3rfsh t3mlo automation bs bto3 chrome 3amlen trick hma bystno on page navigation w ydony signal
// ana hatesl beek teshra7ly aktar 3ashan eltasgeel  bokra ya3m //ba3d bokra a msh 12?
