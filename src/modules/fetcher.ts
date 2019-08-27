import puppeteer from 'puppeteer-core';
// @ts-ignore
import * as t2j from 'tabletojson';
import {navigationDOMWait, COURSES_TABLE_SELECTOR} from './constants';

export class TableFetcher {
  page: puppeteer.Page;
  tableDataUrl = `https://std.eng.cu.edu.eg/SIS/Modules/MetaLoader.aspx?path=~/SIS/Modules/Student/RegistrationStatus/RegistrationStatus.ascx`;
  /**
   *
   */
  constructor(page: puppeteer.Page) {
    this.page = page;
  }

  async getTableData() {
    await this.page.goto(this.tableDataUrl, navigationDOMWait);

    const tableContent = await this.page.$eval(
        COURSES_TABLE_SELECTOR,
        (el) => el.outerHTML
    );

    // console.log(tableContent);
    return this.formatTableDataAsJson(t2j.convert(tableContent));
  }

  formatTableDataAsJson(table: any[]) {
    const keysToBeRenamed = {
      'Code': 'code',
      'From': 'from',
      'Class Size': 'classSize',
      'Date': 'date',
      'Day': 'day',
      'Group': 'group',
      'Name': 'name',
      'To': 'to',
      'Status': 'status',
      'Type': 'type',
      'Waiting': 'waiting',
      'Enrolled': 'enrolled',
      'Location': 'location',
    };
    // @ts-ignore
    return table.flat().map((obj) => {
      const keys = Object.keys(keysToBeRenamed);

      for (const key of keys) {
        // @ts-ignore
        const newKey: string = keysToBeRenamed[key];

        const unFinishedValue = obj[key].replace('_', '');
        obj[newKey] = unFinishedValue;
        delete obj[key];
      }

      return obj;
    });
  }
}
