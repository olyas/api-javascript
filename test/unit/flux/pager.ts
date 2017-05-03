import Pager from '../../../src/flux/pager';
import { Events, FluxCapacitor, Query } from '../../../src/index';
import suite from '../_suite';

suite('Pager', ({ expect, stub }) => {
  const STATE = {};

  describe('previousPage()', () => {
    it('should return previous page', () => {
      expect(Pager.previousPage(2)).to.eq(1);
      expect(Pager.previousPage(309)).to.eq(308);
    });

    it('should return null', () => {
      expect(Pager.previousPage(1)).to.be.null;
    });
  });

  describe('nextPage()', () => {
    it('should return next page', () => {
      expect(Pager.nextPage(2, 3)).to.eq(3);
      expect(Pager.nextPage(18, 40)).to.eq(19);
    });

    it('should return null', () => {
      expect(Pager.nextPage(2, 2)).to.be.null;
    });
  });

  describe('finalPage()', () => {
    it('should return final page', () => {
      const totalRecords = 423;
      const restrictedTotal = 300;
      const pageSize = 20;
      const page = 7;
      const getPage = stub(Pager, 'getPage').returns(page);
      const restrictTotalRecords = stub(Pager, 'restrictTotalRecords').returns(restrictedTotal);

      const finalPage = Pager.finalPage(pageSize, totalRecords);

      expect(finalPage).to.eq(page);
      expect(restrictTotalRecords).to.be.calledWith(pageSize, totalRecords);
      expect(getPage).to.be.calledWith(pageSize, restrictedTotal);
    });

    it('should return at least 1', () => {
      const getPage = stub(Pager, 'getPage').returns(0);
      stub(Pager, 'restrictTotalRecords');

      expect(Pager.finalPage(1, 0)).to.eq(1);
    });
  });

  describe('fromResult()', () => {
    it('should return first record index on page', () => {
      expect(Pager.fromResult(14, 8)).to.eq(113);
    });
  });

  describe('toResult()', () => {
    it('should return last record index on page', () => {
      expect(Pager.toResult(14, 7, 400)).to.eq(98);
    });

    it.skip('should clip the last page based on total records', () => {
      expect(Pager.toResult(14, 7, 87)).to.eq(87);
    });
  });

  describe('build()', () => {
    it('should build page object', () => {
      const last = 30;
      const from = 13;
      const to = 29;
      const next = 4;
      const previous = 2;
      const range = [1, 2, 3, 4, 5];
      const current = 3;
      const size = 14;
      const recordCount = 410;
      const limit = 7;
      const finalPage = stub(Pager, 'finalPage').returns(last);
      const fromResult = stub(Pager, 'fromResult').returns(from);
      const nextPage = stub(Pager, 'nextPage').returns(next);
      const previousPage = stub(Pager, 'previousPage').returns(previous);
      const pageNumbers = stub(Pager, 'pageNumbers').returns(range);
      const toResult = stub(Pager, 'toResult').returns(to);

      const page = Pager.build(<any>{
        data: {
          page: { size, current, limit },
          recordCount,
        },
      });

      expect(page).to.eql({
        from,
        to,
        previous,
        next,
        last,
        range,
      });
      expect(finalPage).to.be.calledWith(size, recordCount);
      expect(fromResult).to.be.calledWith(current, size);
      expect(nextPage).to.be.calledWith(current, last);
      expect(previousPage).to.be.calledWith(current);
      expect(pageNumbers).to.be.calledWith(current, last, limit);
      expect(toResult).to.be.calledWith(current, size, recordCount);
    });
  });

  describe('pageNumbers', () => {
    it('should return an array of beginning at 1', () => {
      expect(Pager.pageNumbers(1, 10, 5)).to.eql([1, 2, 3, 4, 5]);
      expect(Pager.pageNumbers(2, 10, 5)).to.eql([1, 2, 3, 4, 5]);
      expect(Pager.pageNumbers(3, 10, 5)).to.eql([1, 2, 3, 4, 5]);
    });

    it('should start shifting the page range up', () => {
      expect(Pager.pageNumbers(4, 10, 5)).to.eql([2, 3, 4, 5, 6]);
    });

    it('should return an array of pages', () => {
      expect(Pager.pageNumbers(6, 10, 5)).to.eql([4, 5, 6, 7, 8]);
    });

    it('should return array ending at 10', () => {
      expect(Pager.pageNumbers(10, 10, 5)).to.eql([6, 7, 8, 9, 10]);
      expect(Pager.pageNumbers(9, 10, 5)).to.eql([6, 7, 8, 9, 10]);
      expect(Pager.pageNumbers(8, 10, 5)).to.eql([6, 7, 8, 9, 10]);
    });

    it('should start shifting the page range down', () => {
      expect(Pager.pageNumbers(7, 10, 5)).to.eql([5, 6, 7, 8, 9]);
    });

    it('should handle limit higher than available pages', () => {
      expect(Pager.pageNumbers(11, 12, 13)).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should restrict ranges by last page', () => {
      expect(Pager.pageNumbers(1, 5, 5)).to.eql([1, 2, 3, 4, 5]);
      expect(Pager.pageNumbers(1, 4, 5)).to.eql([1, 2, 3, 4]);
      expect(Pager.pageNumbers(1, 3, 5)).to.eql([1, 2, 3]);
      expect(Pager.pageNumbers(1, 2, 5)).to.eql([1, 2]);
      expect(Pager.pageNumbers(1, 1, 5)).to.eql([1]);
    });
  });

  describe('restrictTotalRecords()', () => {
    it('should return total records with max of MAX_RECORDS', () => {
      expect(Pager.restrictTotalRecords(10, 20000)).to.eq(10000);
      expect(Pager.restrictTotalRecords(12, 20000)).to.eq(9996);
      expect(Pager.restrictTotalRecords(24, 20000)).to.eq(9984);
      expect(Pager.restrictTotalRecords(50, 20000)).to.eq(10000);
      expect(Pager.restrictTotalRecords(13, 9999)).to.eq(9997);
      expect(Pager.restrictTotalRecords(50, 9960)).to.eq(10000);
      expect(Pager.restrictTotalRecords(20, 100)).to.eq(100);
    });
  });

  describe('getPage()', () => {
    it('should get the number of the specified page', () => {
      expect(Pager.getPage(4, 9)).to.eq(3);
    });
  });

  describe('transformPages()', () => {
    it('should return page transformer', () => {
      expect(Pager.transformPages(1, 2, 3)).to.be.a('function');
    });

    it('should return current page value', () => {
      expect(Pager.transformPages(1, 2, 3)(8)).to.eq(8);
      expect(Pager.transformPages(3, 2, 3)(8)).to.eq(8);
    });
  });
});