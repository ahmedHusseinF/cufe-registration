import { getPage, clickLink } from './puppeteer';
import {
  INCORRECT_LOGIN_CREDS,
  LOGIN_FORM_PASSWORD,
  LOGIN_FORM_SUBMIT_BTN,
  LOGIN_FORM_USERNAME,
  navigationIdleWait,
  STD_URL,
  typingDelayOptions,
} from './constants';

export enum LoginStatus {
  INCORRECT_CREDS = 'INCORRECT_CREDS',
  SUCCESS = 'SUCCESS',
}

export default async function login(username: string, password: string) {
  const page = await getPage();
  await page.goto(STD_URL, navigationIdleWait);

  await page.type(LOGIN_FORM_USERNAME, username, typingDelayOptions);
  await page.type(LOGIN_FORM_PASSWORD, password, typingDelayOptions);

  await clickLink(page, LOGIN_FORM_SUBMIT_BTN);

  const pageContent = await page.content();
  if (pageContent.includes(INCORRECT_LOGIN_CREDS)) {
    // TODO: send notification for bad username/password
    console.error('detected incorrect login credentials');
    return LoginStatus.INCORRECT_CREDS;
  }

  return LoginStatus.SUCCESS;
}
