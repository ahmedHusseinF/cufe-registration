import { Page } from 'puppeteer';
import { clickLink, getPage } from './puppeteer';
import {
  CAPTCHA_INPUT_SELECTOR,
  CLOSED_REG_STRING,
  PASSWORD_INPUT_ID,
  REG_URL,
  RETRY_PAGE_BUTTON_ID,
  SECOND_PAGE_NEXT_BUTTON_ID,
  START_MSG_BUTTON_ID,
  typingDelayOptions,
} from './constants';
import { PASSWORD } from './env';

export interface Course {
  code: string;
  lecDay: Day | number;
  lecLocation: string;
  lecStart: number;
  tutLocation: string;
  tutStart: number;
}

const daysToIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
};

function _dayToIndex(day: Day) {
  return daysToIndex[day];
}

/**
 * @desc this will only resolve when the registeration is open
 */
async function _holdRegisterationUntilOpen(page: Page) {
  let open = false;

  await page.goto(REG_URL);
  const pageContent = await page.content();
  open = !pageContent.includes(CLOSED_REG_STRING);

  while (!open) {
    await clickLink(page, RETRY_PAGE_BUTTON_ID);
    const pageContent = await page.content();
    open = !pageContent.includes(CLOSED_REG_STRING);
  }

  await clickLink(page, START_MSG_BUTTON_ID);
}

async function _fillLastForm(page: Page, password: string) {
  await page.type(PASSWORD_INPUT_ID, password, typingDelayOptions);
  await page.focus(CAPTCHA_INPUT_SELECTOR);
}

async function injectCourseSelectorInBrowser(page: Page, courses: Course[]) {
  // @ts-ignore
  await page.evaluate(function (courses) {
    // * BROWSER CONTEXT
    // * too much ts-ignore here because this is browser
    // * and typescript complains a lot
    // @ts-ignore
    courses.every((course) => {
      const { code, lecDay, lecLocation, lecStart, tutLocation, tutStart } = course;
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
  }, courses);
}

export async function registerCourses(courses: Course[]) {
  const page = await getPage();
  await _holdRegisterationUntilOpen(page);

  courses = courses.map((course) => {
    if (typeof course.lecDay !== 'number') {
      course.lecDay = _dayToIndex(course.lecDay);
    }
    return course;
  });

  injectCourseSelectorInBrowser(page, courses);

  const nextButton = await page.$(SECOND_PAGE_NEXT_BUTTON_ID);

  if (!nextButton) {
    return console.log('DRY RUNNNNNN');
  }

  await clickLink(page, SECOND_PAGE_NEXT_BUTTON_ID);

  await _fillLastForm(page, PASSWORD);
}
