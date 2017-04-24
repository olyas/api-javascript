import { Events } from '../../../src/flux/capacitor';
import Observer, { DETAIL_QUERY_INDICATOR, INDEXED } from '../../../src/flux/observer';
import suite from '../_suite';

suite('Observer', ({ expect, spy, stub }) => {
  describe('listen()', () => {
    it('should return a function', () => {
      const observer = Observer.listen(<any>{});

      expect(observer).to.be.a('function');
    });

    it('should call store.getState()', () => {
      const getState = spy();
      const observer = Observer.listen(<any>{ store: { getState } });

      observer();

      expect(getState).to.be.called;
    });

    it('should call Observer.resolve()', () => {
      const newState = { a: 'b' };
      const flux: any = { store: { getState: () => newState } };
      const resolve = stub(Observer, 'resolve');
      const create = stub(Observer, 'create');
      const observer = Observer.listen(flux);

      observer();

      expect(resolve).to.be.calledWith(undefined, newState);
      expect(create).to.be.calledWith(flux);
    });
  });

  describe.skip('resolve()', () => {
    it('should not call the observer if no changes', () => {
      const observer = spy();

      Observer.resolve(undefined, undefined, observer);

      expect(observer).to.not.be.called;
    });

    it('should not call the observer if not a function', () => {
      expect(() => Observer.resolve(1, 2, {})).to.not.throw();
    });

    it('should call the observer with the updated node', () => {
      const observer = spy();

      Observer.resolve(1, 2, (...args) => observer(...args));

      expect(observer).to.be.calledWith(1, 2);
    });

    it('should call resolve() on subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observer4 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: Object.assign((...args) => observer2(...args), {
          x: (...args) => observer3(...args),
        }),
        b: (...args) => observer4(...args),
      });
      const oldState = { a: { x: 1 } };
      const newState = { b: 2 };

      Observer.resolve(oldState, newState, observers);

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.be.calledWith({ x: 1 }, undefined);
      expect(observer3).to.be.calledWith(1, undefined);
      expect(observer4).to.be.calledWith(undefined, 2);
    });

    it('should not call resolve() on equal subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: (...args) => observer2(...args),
        b: (...args) => observer3(...args),
      });
      const oldState = {};
      const newState = {};

      Observer.resolve(oldState, newState, observers);

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.not.be.called;
      expect(observer3).to.not.be.called;
    });
  });

  describe('create()', () => {
    it('should return an observer tree', () => {
      const observers = Observer.create(<any>{});

      expect(observers).to.be.an('object');
      expect(observers.data).to.be.an('object');
      expect(observers.data.autocomplete).to.be.a('function');
      expect(observers.data.autocomplete.products).to.be.a('function');
      expect(observers.data.autocomplete.query).to.be.a('function');
      expect(observers.data.collections).to.be.an('object');
      expect(observers.data.collections[INDEXED]).to.be.a('function');
      expect(observers.data.collections.selected).to.be.a('function');
      expect(observers.data.details).to.be.an('object');
      expect(observers.data.details.id).to.be.a('function');
      expect(observers.data.details.product).to.be.a('function');
      expect(observers.data.navigations).to.be.a('function');
      // expect(observers.data.navigations[INDEXED]).to.be.a('function');
      expect(observers.data.page).to.be.a('function');
      expect(observers.data.page.current).to.be.a('function');
      expect(observers.data.page.size).to.be.a('function');
      expect(observers.data.products).to.be.a('function');
      expect(observers.data.query).to.be.a('function');
      expect(observers.data.query.corrected).to.be.a('function');
      expect(observers.data.query.didYouMeans).to.be.a('function');
      expect(observers.data.query.original).to.be.a('function');
      expect(observers.data.query.related).to.be.a('function');
      expect(observers.data.query.rewrites).to.be.a('function');
      expect(observers.data.reditect).to.be.a('function');
      expect(observers.data.sorts).to.be.a('function');
      expect(observers.data.template).to.be.a('function');
    });

    // describe('data', () => {
    //   let emit;
    //   let observers;
    //
    //   beforeEach(() => {
    //     emit = spy();
    //     observers = Observer.create(<any>{ emit });
    //   });
    //
    //   describe('query', () => {
    //     observers.data.query(undefined, { a: 'b' });
    //
    //     expect(emit).to.be.calledWith(Events.QUERY_UPDATED, { a: 'b' });
    //   });
    // });
  });

  // describe('search', () => {
  //   let emit;
  //   let observers;
  //
  //   beforeEach(() => {
  //     emit = spy();
  //     observers = Observer.create(<any>{ emit });
  //   });
  //
  //   describe('request', () => {
  //     it('should emit search event', () => {
  //       observers.data.search.request(undefined, { a: 'b' });
  //       expect(emit).to.be.calledWith(Events.SEARCH_REQ_UPDATED, { a: 'b' });
  //       expect(emit).to.be.calledWith(Events.SEARCH, { a: 'b' });
  //     });
  //
  //     it('should emit PAGE_CHANGED event', () => {
  //       observers.data.search.request.skip(undefined, 23);
  //       expect(emit).to.be.calledWith(Events.SEARCH_PAGE_UPDATED, 23);
  //       expect(emit).to.be.calledWith(Events.PAGE_CHANGED, 23);
  //     });
  //
  //     it('should emit COLLECTION_CHANGED event', () => {
  //       observers.data.search.request.collection(undefined, 'somestring');
  //       expect(emit).to.be.calledWith(Events.SEARCH_COLLECTION_UPDATED, 'somestring');
  //       expect(emit).to.be.calledWith(Events.COLLECTION_CHANGED, 'somestring');
  //     });
  //
  //     it('should emit QUERY_CHANGED event', () => {
  //       observers.data.search.request.query(undefined, 'tomatoes');
  //       expect(emit).to.be.calledWith(Events.SEARCH_QUERY_UPDATED, 'tomatoes');
  //       expect(emit).to.be.calledWith(Events.QUERY_CHANGED, 'tomatoes');
  //       expect(emit).to.be.calledWith(Events.REWRITE_QUERY, 'tomatoes');
  //     });
  //
  //     it('should emit REFINEMENTS_CHANGED event', () => {
  //       observers.data.search.request.refinements(undefined, [{ c: 'd' }]);
  //       expect(emit).to.be.calledWith(Events.SEARCH_REFINEMENTS_UPDATED, [{ c: 'd' }]);
  //       expect(emit).to.be.calledWith(Events.REFINEMENTS_CHANGED, [{ c: 'd' }]);
  //     });
  //
  //     it('should emit SORT and SORT_CHANGED event', () => {
  //       observers.data.search.request.sort(undefined, [{ e: 'f' }]);
  //       expect(emit).to.be.calledWith(Events.SEARCH_SORT_UPDATED, [{ e: 'f' }]);
  //       expect(emit).to.be.calledWith(Events.SORT, [{ e: 'f' }]);
  //     });
  //   });
  //
  //   describe('response', () => {
  //     it('should emit REDIRECT event', () => {
  //       observers.data.search.response(undefined, { redirect: '/toys.html' });
  //       expect(emit).to.be.calledWith(Events.SEARCH_REDIRECT, '/toys.html');
  //       expect(emit).to.be.calledWith(Events.REDIRECT, '/toys.html');
  //     });
  //
  //     it('should emit RESULTS event', () => {
  //       observers.data.search.response(undefined, { g: 'h', originalQuery: {} });
  //       expect(emit).to.be.calledWith(Events.SEARCH_RES_UPDATED, { g: 'h', originalQuery: {} });
  //       expect(emit).to.be.calledWith(Events.RESULTS, { g: 'h', originalQuery: {} });
  //       expect(emit).to.be.calledWith(Events.RESET, { g: 'h', originalQuery: {} });
  //     });
  //
  //     it('should emit DETAILS event', () => {
  //       observers.data.search.response(undefined, {
  //         originalQuery: { customUrlParams: [{ key: DETAIL_QUERY_INDICATOR, value: 'yo' }] },
  //         records: [{ i: 'j' }]
  //       });
  //       expect(emit).to.be.calledWith(Events.SEARCH_DETAILS, { i: 'j' });
  //       expect(emit).to.be.calledWith(Events.DETAILS, { i: 'j' });
  //     });
  //   });
  // });

});
