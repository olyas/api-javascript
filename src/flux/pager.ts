import { Results } from '../models/response';
import { Page } from './actions';
import { Events, FluxCapacitor } from './capacitor';
import Store from './store';
import range = require('lodash.range');

const MAX_RECORDS = 10000;

export class Pager {

  constructor(private state: Store.State) { }

  previousPage(currentPage: number) {
    return currentPage > 1 ? currentPage - 1 : null;
  }

  nextPage(currentPage: number, finalPage: number) {
    return (currentPage + 1 <= finalPage) ? currentPage + 1 : null;
  }

  finalPage(pageSize: number, totalRecords: number) {
    return Math.max(this.getPage(pageSize, this.restrictTotalRecords(pageSize, totalRecords)), 1);
  }

  fromResult(currentPage: number, pageSize: number) {
    return currentPage * pageSize + 1;
    // TODO move the default value into reducer setup
    // return this.flux.query.build().skip + 1 || 1;
  }

  toResult(currentPage: number, pageSize: number, totalRecords: number) {
    if ((currentPage * pageSize) > totalRecords) {
      return ((currentPage - 1) * pageSize) + (totalRecords % currentPage);
    } else {
      return currentPage * pageSize;
    }
  }

  build(): Page {
    // TODO move this default into the reducer setup
    const pageSize = this.state.data.page.size || 10;
    const currentPage = this.state.data.page.current;
    const totalRecords = this.state.data.recordCount;
    const last = this.finalPage(pageSize, totalRecords);

    return {
      from: this.fromResult(currentPage, pageSize),
      last,
      next: this.nextPage(currentPage, last),
      previous: this.previousPage(currentPage),
      range: this.pageNumbers(currentPage, last, this.state.data.page.limit),
      to: this.toResult(currentPage, pageSize, totalRecords),
    };
  }

  pageNumbers(currentPage: number, finalPage: number, limit: number) {
    return range(1, Math.min(finalPage + 1, limit + 1))
      .map(this.transformPages(currentPage, finalPage, limit));
  }

  restrictTotalRecords(pageSize: number, totalRecords: number) {
    if (totalRecords > MAX_RECORDS) {
      return MAX_RECORDS - (MAX_RECORDS % pageSize);
    } else if ((totalRecords + pageSize) > MAX_RECORDS) {
      if (MAX_RECORDS % pageSize === 0) {
        return MAX_RECORDS;
      } else {
        return totalRecords - (totalRecords % pageSize);
      }
    } else {
      return totalRecords;
    }
  }

  getPage(pageSize: number, totalRecords: number) {
    return Math.ceil(totalRecords / pageSize);
  }

  transformPages(currentPage: number, finalPage: number, limit: number) {
    const border = Math.ceil(limit / 2);
    return (value: number) => {
      // account for 0-indexed pages
      if (currentPage <= border || limit > finalPage) {
        // pages start at beginning
        return value;
      } else if (currentPage > finalPage - border) {
        // pages start and end in the middle
        return value + finalPage - limit;
      } else {
        // pages end at last page
        return value + currentPage - border;
      }
    };
  }
}
