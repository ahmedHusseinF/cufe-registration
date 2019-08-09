import puppeteer from 'puppeteer';

export const START_MSG_BUTTON_ID = '#ctl08_ButMessageShown';

export const RETRY_PAGE_BUTTON_ID = '#ctl08_ButCheckOpen';

export const PASSWORD_INPUT_ID = '#ctl08_txtPassword';

export const LOGIN_FORM_USERNAME = '#txtUsername';

export const LOGIN_FORM_PASSWORD = '#txtPassword';

export const LOGIN_FORM_SUBMIT_BTN = '#ext-gen24';

export const CAPTCH_PAGE_SUBMIT_BTN = '#ctl08_ButAccept';

export const COURSES_TABLE_SELECTOR = `div > #ctl08_GridView1`;

export const CAPTCHA_INPUT_SELECTOR = `input[name="ctl08$CaptchaControl1"]`;

export const SECOND_PAGE_NEXT_BUTTON_ID = '#ctl08_nextPage';

export const CLOSED_REG_STRING = 'closed';

export const INCORRECT_LOGIN_CREDS = 'incorrect';

export const navigationDOMWait: puppeteer.NavigationOptions = {
  timeout: 0, // means infinte timeout
  waitUntil: 'domcontentloaded',
};

export const navigationIdleWait: puppeteer.NavigationOptions = {
  timeout: 0, // means infinte timeout
  waitUntil: 'networkidle2',
};

export const typingDelayOptions = {
  delay: 50, // in ms
};
