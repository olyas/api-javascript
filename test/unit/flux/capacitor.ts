import * as mock from 'xhr-mock';
import Actions from '../../../src/flux/actions';
import Observer from '../../../src/flux/observer';
import Store from '../../../src/flux/store';
import { Events, FluxCapacitor, Results, SelectedValueRefinement, Sort } from '../../../src/index';
import suite from '../_suite';

const CUSTOMER_ID = 'services';
const SEARCH_URL = `http://${CUSTOMER_ID}-cors.groupbycloud.com/api/v1/search`;
const REFINEMENTS_URL = `${SEARCH_URL}/refinements`;
const SELECTED_REFINEMENT: SelectedValueRefinement = { type: 'Value', navigationName: 'brand', value: 'DeWalt' };
const REFINEMENT_RESULT = { availableNavigation: 'a', selectedNavigation: 'b' };
const DETAILS_RESULT = { records: [{}] };

suite('FluxCapacitor', ({ expect, spy, stub }) => {
  const LISTENER = () => null;
  let create: Sinon.SinonStub;
  let listen: Sinon.SinonStub;
  let subscribe: Sinon.SinonSpy;
  let flux: FluxCapacitor;

  beforeEach(() => {
    mock.setup();
    subscribe = spy();
    create = stub(Store, 'create').returns({ subscribe });
    listen = stub(Observer, 'listen').returns(LISTENER);
    flux = new FluxCapacitor(CUSTOMER_ID);
  });

  afterEach(() => {
    mock.teardown();
    flux = null;
  });

  describe('constructor()', () => {
    it('should be defined', () => {
      expect(flux).to.be.ok;
      expect(flux.bridge).to.be.ok;
      expect(flux.query).to.be.ok;
      expect(flux.results).to.not.be.ok;
    });

    it('should set up store and observer', () => {
      expect(listen).to.be.calledWith(flux);
      expect(subscribe).to.be.calledWith(LISTENER);
      expect(create).to.be.called;
    });

    it('should accept a mask for configuration', () => {
      const config: any = { a: 'something', b: 'Ascending' };

      flux = new FluxCapacitor(CUSTOMER_ID, config);

      expect(flux.query.raw).to.contain.keys('a', 'b');

      flux = new FluxCapacitor(CUSTOMER_ID, config, '{refinements,area}');

      expect(flux.query.raw).to.not.contain.keys('a', 'b');
    });

    it('should strip fields from configuration', () => {
      flux = new FluxCapacitor(CUSTOMER_ID, <any>{
        a: 'something',
        b: 'Ascending',
        bridge: {
          headers: { c: 'd' },
          https: true,
        },
      });

      expect(flux.query.raw).to.not.contain.keys('bridge');
    });

    it('should set headers on bridge', () => {
      const headers = { c: 'd' };
      flux = new FluxCapacitor(CUSTOMER_ID, { bridge: { headers } });

      expect(flux.bridge.headers).to.eq(headers);
    });

    it('should set HTTPS on bridge', () => {
      flux = new FluxCapacitor(CUSTOMER_ID, { bridge: { https: true } });

      expect(flux.bridge.baseUrl).to.eq('https://services-cors.groupbycloud.com:443/api/v1');
    });

    it('should add default event listener', (done) => {
      const error: any = { a: 'b' };
      flux = new FluxCapacitor(CUSTOMER_ID);
      flux.on(Events.ERROR_BRIDGE, (err) => {
        expect(err).to.eq(error);
        done();
      });

      expect(flux.bridge.errorHandler).to.be.a('function');

      flux.bridge.errorHandler(error);
    });

    it('should set configured errorHandler on bridge', () => {
      const errorHandler = spy();
      flux = new FluxCapacitor(CUSTOMER_ID, { bridge: { errorHandler } });
      const error: any = { a: 'b' };

      flux.bridge.errorHandler(error);

      expect(errorHandler.calledWith(error)).to.be.true;
    });

    it('should not override default errorHandler on bridge', (done) => {
      flux = new FluxCapacitor(CUSTOMER_ID, { bridge: { errorHandler: () => null } });
      flux.on(Events.ERROR_BRIDGE, () => done());

      flux.bridge.errorHandler(<any>{});
    });
  });

  describe('actions', () => {
    let dispatch: Sinon.SinonSpy;

    beforeEach(() => {
      dispatch = spy();
      flux.store = <any>{ dispatch };
    });

    describe('search()', () => {
      it('should dispatch updateSearch()', () => {
        const query = 'half moon';
        const updateSearch = stub(flux.actions, 'updateSearch');

        flux.search(query);

        expect(updateSearch).to.be.calledWith({ query });
      });

      it('should fallback to previous query', () => {
        const query = flux.originalQuery = 'half moon';
        const updateSearch = stub(flux.actions, 'updateSearch');

        flux.search();

        expect(updateSearch).to.be.calledWith({ query });
      });
    });

    describe('reset()', () => {
      it('should dispatch updateSearch()', () => {
        const query = 'half moon';
        const field = 'brand';
        const index = 8;
        const refinements = [{ a: 'b' }, { c: 'd' }];
        const updateSearch = stub(flux.actions, 'updateSearch');

        flux.reset(query, { field, index });

        expect(updateSearch).to.be.calledWith({ query, field, index, clear: true });
      });

      it('should fallback to null query and empty refinements', () => {
        const updateSearch = stub(flux.actions, 'updateSearch');

        flux.reset();

        expect(updateSearch).to.be.calledWith({ query: null, refinements: [], clear: true });
      });
    });

    describe('resize()', () => {
      it('should dispatch updatePageSize()', () => {
        const updatePageSize = stub(flux.actions, 'updatePageSize');

        flux.resize(24);

        expect(updatePageSize).to.be.calledWith(24);
      });
    });

    describe('sort()', () => {
      it('should dispatch updateSorts()', () => {
        const sort = { field: 'price', descending: true };
        const updateSorts = stub(flux.actions, 'updateSorts');

        flux.sort(sort);

        expect(updateSorts).to.be.calledWith(sort);
      });

      it('should accept multiple sorts', () => {
        const sorts = [{ field: 'price', descending: true }, { field: 'popularity' }];
        const updateSorts = stub(flux.actions, 'updateSorts');

        flux.sort(sorts);

        expect(updateSorts).to.be.calledWith(sorts);
      });
    });

    describe('refine()', () => {
      it('should dispatch selectRefinement()', () => {
        const selectRefinement = stub(flux.actions, 'selectRefinement');

        flux.refine('brand', 3);

        expect(selectRefinement).to.be.calledWith('brand', 3);
      });
    });

    describe('unrefine()', () => {
      it('should dispatch deselectRefinement()', () => {
        const deselectRefinement = stub(flux.actions, 'deselectRefinement');

        flux.unrefine('brand', 3);

        expect(deselectRefinement).to.be.calledWith('brand', 3);
      });
    });

    describe('details()', () => {
      it('should dispatch updateDetailsId()', () => {
        const id = '123123';
        const updateDetailsId = stub(flux.actions, 'updateDetailsId');

        flux.details(id);

        expect(updateDetailsId).to.be.calledWith(id);
      });
    });

    describe('switchCollection()', () => {
      it('should dispatch selectCollection()', () => {
        const selectCollection = stub(flux.actions, 'selectCollection');

        flux.switchCollection('products');

        expect(selectCollection).to.be.calledWith('products');
      });
    });
  });

  // describe('search()', () => {
  //   it('should make a search request', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).query).to.eq('testing');
  //       done();
  //     });
  //
  //     flux.search('testing');
  //   });
  //
  //   describe('events', () => {
  //     it('should emit a search event before searching', (done) => {
  //       flux.bridge.search = (): any => expect.fail();
  //       flux.on(Events.SEARCH, (query) => {
  //         expect(query.query).to.eq('danish');
  //         done();
  //       });
  //
  //       flux.search('danish');
  //     });
  //
  //     it('should emit a results event', (done) => {
  //       flux.bridge.search = (): any => Promise.resolve('ok');
  //       // mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //       flux.on(Events.RESULTS, () => done());
  //
  //       flux.search('');
  //     });
  //
  //     it('should not emit a redirect event', (done) => {
  //       flux.bridge.search = (): any => ({ then: (cb) => cb({}) });
  //       flux.on(Events.REDIRECT, () => expect.fail());
  //
  //       flux.search('');
  //       done();
  //     });
  //
  //     it('should emit a redirect event', (done) => {
  //       const redirect = 'something.html';
  //       flux.bridge.search = (): any => ({ then: (cb) => cb({ redirect }) });
  //       flux.on(Events.REDIRECT, (url) => expect(url).to.eq(redirect));
  //
  //       flux.search('');
  //       done();
  //     });
  //
  //     it('should not emit a query_changed event on subsequent equivalent requests', (done) => {
  //       flux.bridge.search = (): any => Promise.resolve('ok');
  //
  //       flux.search('apple')
  //         .then(() => flux.on(Events.QUERY_CHANGED, () => expect.fail()))
  //         .then(() => flux.search('apple'))
  //         .then(() => done());
  //     });
  //
  //     it('should emit a query_changed event on changing the query', (done) => {
  //       flux.bridge.search = (): any => Promise.resolve('ok');
  //
  //       flux.search('shoes')
  //         .then(() => flux.on(Events.QUERY_CHANGED, (query) => {
  //           expect(query).to.eq('other');
  //           done();
  //         }))
  //         .then(() => flux.search('other'));
  //     });
  //
  //     it('should emit a query_changed with case insensitivity', (done) => {
  //       flux.bridge.search = (): any => Promise.resolve('ok');
  //
  //       flux.search('apple')
  //         .then(() => flux.on(Events.QUERY_CHANGED, () => expect.fail()))
  //         .then(() => flux.search('ApPle'))
  //         .then(() => done());
  //     });
  //   });
  // });
  //
  // describe('refinements()', () => {
  //   it('should make a refinements request', (done) => {
  //     mock.post(REFINEMENTS_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).navigationName).to.eq('brand');
  //       done();
  //     });
  //
  //     flux.refinements('brand');
  //   });
  //
  //   describe('events', () => {
  //     it('should emit a refinement_results event', (done) => {
  //       mock.post(REFINEMENTS_URL, (req, res) => res.body('ok'));
  //       flux.on(Events.REFINEMENT_RESULTS, () => done());
  //
  //       flux.refinements('');
  //     });
  //   });
  // });
  //
  // describe('refine()', () => {
  //   it('should make a request on refinement', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).refinements.length).to.eq(1);
  //       done();
  //     });
  //
  //     flux.refine(SELECTED_REFINEMENT);
  //   });
  //
  //   it('should reset paging on refinement', (done) => {
  //     flux.query.skip(20);
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(flux.query.build().skip).to.eq(0);
  //       done();
  //     });
  //
  //     flux.refine(SELECTED_REFINEMENT);
  //   });
  //
  //   it('should skip reset paging on refinement', (done) => {
  //     flux.query.skip(20);
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //
  //     flux.refine(SELECTED_REFINEMENT, { reset: false })
  //       .then(() => {
  //         expect(flux.query.build().skip).to.eq(20);
  //         done();
  //       });
  //   });
  // });
  //
  // describe('events', () => {
  //   it('should emit refinements_changed event on refinement', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => res.body(JSON.stringify(REFINEMENT_RESULT)));
  //     flux.on(Events.REFINEMENTS_CHANGED, (data) => {
  //       expect(data.available).to.eq('a');
  //       expect(data.selected).to.eq('b');
  //       done();
  //     });
  //
  //     flux.refine(SELECTED_REFINEMENT);
  //   });
  // });
  //
  // describe('unrefine()', () => {
  //   it('should make a request on un-refinement', (done) => {
  //     flux.query.withSelectedRefinements(SELECTED_REFINEMENT);
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).refinements).to.not.be.ok;
  //       done();
  //     });
  //
  //     flux.unrefine(SELECTED_REFINEMENT);
  //   });
  //
  //   it('should un-refine with deep equality', (done) => {
  //     flux.query.withSelectedRefinements(SELECTED_REFINEMENT);
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).refinements).to.not.be.ok;
  //       done();
  //     });
  //
  //     // intentionally not using SELECTED_REFINEMENT
  //     flux.unrefine({ type: 'Value', navigationName: 'brand', value: 'DeWalt' });
  //   });
  //
  //   it('should reset paging on un-refinement', (done) => {
  //     flux.query.skip(20);
  //     flux.query.withSelectedRefinements(SELECTED_REFINEMENT);
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //
  //     flux.unrefine(SELECTED_REFINEMENT)
  //       .then(() => {
  //         expect(flux.query.build().skip).to.eq(0);
  //         done();
  //       });
  //   });
  //
  //   describe('events', () => {
  //     it('should emit refinements_changed event on un-refinement', (done) => {
  //       flux.query.withSelectedRefinements(SELECTED_REFINEMENT);
  //       mock.post(SEARCH_URL, (req, res) => res.body(JSON.stringify(REFINEMENT_RESULT)));
  //       flux.on(Events.REFINEMENTS_CHANGED, (data) => {
  //         expect(data.available).to.eq('a');
  //         expect(data.selected).to.eq('b');
  //         done();
  //       });
  //
  //       flux.unrefine(SELECTED_REFINEMENT);
  //     });
  //   });
  // });
  //
  // describe('paging behaviour', () => {
  //   beforeEach(() => {
  //     flux.query.skip(20);
  //     flux.results = <Results>{ totalRecordCount: 300 };
  //   });
  //
  //   it('should reset paging', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(0);
  //       done();
  //     });
  //
  //     flux.page.reset();
  //   });
  //
  //   it('should page forward', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(30);
  //       done();
  //     });
  //
  //     flux.page.next();
  //   });
  //
  //   it('should page backward', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(10);
  //       done();
  //     });
  //     flux.page.prev();
  //   });
  //
  //   it('should advance to last page', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(290);
  //       done();
  //     });
  //
  //     flux.page.last();
  //   });
  // });
  //
  // describe('resizing behaviour', () => {
  //   it('should resize the page and keep skip', (done) => {
  //     flux.query.withPageSize(10);
  //     flux.query.skip(20);
  //     flux.page.pageExists = () => true;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(20);
  //       expect(JSON.parse(req.body()).pageSize).to.eq(20);
  //       done();
  //     });
  //
  //     flux.resize(20, false);
  //   });
  //
  //   it('should resize the page and keep skip on the same page', (done) => {
  //     flux.query.withPageSize(10);
  //     flux.query.skip(30);
  //     flux.page.pageExists = () => true;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(20);
  //       expect(JSON.parse(req.body()).pageSize).to.eq(20);
  //       done();
  //     });
  //
  //     flux.resize(20, false);
  //   });
  //
  //   it('should resize the page and bring skip to 0', (done) => {
  //     flux.query.withPageSize(10);
  //     flux.query.skip(20);
  //     flux.page.pageExists = () => true;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(0);
  //       expect(JSON.parse(req.body()).pageSize).to.eq(30);
  //       done();
  //     });
  //
  //     flux.resize(30, true);
  //   });
  //
  //   it('should resize from smaller to larger and keep skip when total near max', (done) => {
  //     flux.query.withPageSize(12);
  //     flux.query.skip(9984);
  //     flux.page.pageExists = () => true;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(9960);
  //       expect(JSON.parse(req.body()).pageSize).to.eq(24);
  //       done();
  //     });
  //
  //     flux.resize(24, false);
  //   });
  //
  //   it('should resize from larger to smaller and keep skip when total near max', (done) => {
  //     flux.query.withPageSize(50);
  //     flux.query.skip(9950);
  //     flux.page.pageExists = () => true;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).skip).to.eq(9947);
  //       expect(JSON.parse(req.body()).pageSize).to.eq(49);
  //       done();
  //     });
  //
  //     flux.resize(49, false);
  //   });
  // });
  //
  // describe('rewrite()', () => {
  //   it('should rewrite the query', (done) => {
  //     const newQuery = 'montana';
  //     flux.query.withQuery('alabama');
  //     flux.search = (query): any => Promise.resolve(expect(query).to.eq(newQuery));
  //
  //     flux.rewrite(newQuery)
  //       .then(() => done());
  //   });
  //
  //   it('should rewrite the query but not perform a search', () => {
  //     const newQuery = 'montana';
  //     flux.query.withQuery('alabama');
  //     flux.search = (query): any => expect.fail();
  //
  //     flux.rewrite(newQuery, { skipSearch: true });
  //
  //     expect(flux.query.raw.query).to.eq(newQuery);
  //   });
  //
  //   it('should emit events on search', (done) => {
  //     const newQuery = 'montana';
  //     flux.query.withQuery('alabama');
  //
  //     flux.search = (query): any => ({ then: (cb) => cb() });
  //     flux.emit = (event, data): any => {
  //       expect(data).to.eq(newQuery);
  //       done();
  //     };
  //
  //     flux.rewrite(newQuery);
  //   });
  //
  //   it('should emit events when not searching', () => {
  //     const newQuery = 'montana';
  //     flux.query.withQuery('alabama');
  //     flux.emit = (event, data): any => {
  //       switch (event) {
  //         case Events.REWRITE_QUERY:
  //           return expect(data).to.eq(newQuery);
  //         case Events.QUERY_CHANGED:
  //           break;
  //         default:
  //           expect.fail();
  //       }
  //     };
  //
  //     flux.rewrite(newQuery, { skipSearch: true });
  //   });
  // });
  //
  // describe('reset behaviour', () => {
  //   it('should reset the query', (done) => {
  //     flux.query.withQuery('alabama');
  //     flux.resetRecall = () => null;
  //     mock.post(SEARCH_URL, (req, res) => {
  //       const body = JSON.parse(req.body());
  //       expect(body.query).to.eq('');
  //       done();
  //     });
  //
  //     flux.reset();
  //   });
  //
  //   it('should accept a new query on reset', (done) => {
  //     flux.query.withQuery('alabama');
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).query).to.eq('texas');
  //       done();
  //     });
  //
  //     flux.reset('texas');
  //   });
  //
  //   describe('events', () => {
  //     it('should emit events', (done) => {
  //       mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //
  //       let count = 0;
  //       const checkComplete = () => {
  //         if (++count === 2) {
  //           done();
  //         }
  //       };
  //       flux.on(Events.RESET, checkComplete);
  //       flux.on(Events.PAGE_CHANGED, checkComplete);
  //       flux.reset();
  //     });
  //   });
  // });
  //
  // describe('sort()', () => {
  //   it('should reset paging but not refinements', (done) => {
  //     const refinement: SelectedValueRefinement = { navigationName: 'brand', type: 'Value', value: 'DeWalt' };
  //     flux.query.skip(30)
  //       .withSelectedRefinements(refinement);
  //     mock.post(SEARCH_URL, (req, res) => {
  //       const body = JSON.parse(req.body());
  //       expect(body.skip).to.eq(0);
  //       expect(body.sort).to.eql([{ field: 'price', order: 'Ascending' }]);
  //       expect(body.refinements).to.eql([refinement]);
  //       done();
  //     });
  //
  //     flux.sort({ field: 'price', order: 'Ascending' });
  //   });
  //
  //   it('should add sorts', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).sort).to.eql([{ field: 'price', order: 'Ascending' }]);
  //       done();
  //     });
  //
  //     flux.sort({ field: 'price', order: 'Ascending' });
  //   });
  //
  //   it('should add more sorts', (done) => {
  //     flux.query.withSorts({ field: 'title', order: 'Descending' });
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).sort.length).to.eq(2);
  //       done();
  //     });
  //
  //     flux.sort({ field: 'price', order: 'Ascending' });
  //   });
  //
  //   it('should remove sorts', (done) => {
  //     flux.query.withSorts({ field: 'price', order: 'Descending' });
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).sort).to.eql([{ field: 'price', order: 'Ascending' }]);
  //       done();
  //     });
  //
  //     flux.sort({ field: 'price', order: 'Ascending' });
  //   });
  //
  //   it('should remove all sorts', (done) => {
  //     const sorts: Sort[] = [
  //       { field: 'price', order: 'Descending' },
  //       { field: 'other', order: 'Ascending' },
  //       { field: 'type', order: 'Descending' },
  //     ];
  //     flux.query.withSorts(...sorts);
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).sort).to.eql([{ field: 'price', order: 'Ascending' }]);
  //       done();
  //     });
  //
  //     flux.sort({ field: 'price', order: 'Ascending' }, sorts);
  //   });
  //
  //   it('should emit sort event', (done) => {
  //     const sort: any = { field: 'price', order: 'Ascending' };
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //     flux.on(Events.SORT, (newSort) => {
  //       expect(newSort).to.be.ok;
  //       done();
  //     });
  //
  //     flux.sort(sort);
  //   });
  // });
  //
  // describe('details()', () => {
  //   it('should refine by id', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).refinements).to.eql([{ navigationName: 'id', type: 'Value', value: '14830' }]);
  //       done();
  //     });
  //
  //     flux.details('14830');
  //   });
  //
  //   it('should refine by specified field', (done) => {
  //     const navigationName = 'variants.id';
  //     mock.post(SEARCH_URL, (req, res) => {
  //       expect(JSON.parse(req.body()).refinements).to.eql([{ navigationName, type: 'Value', value: '14830' }]);
  //       done();
  //     });
  //
  //     flux.details('14830', navigationName);
  //   });
  //
  //   it('should persist area, collection, language, fields', (done) => {
  //     flux.query.withConfiguration({
  //       area: 'nonProd',
  //       collection: 'offbrand',
  //       fields: ['title', 'price'],
  //       language: 'zh',
  //     });
  //     mock.post(SEARCH_URL, (req, res) => {
  //       const body = JSON.parse(req.body());
  //       expect(body.area).to.eq('nonProd');
  //       expect(body.collection).to.eq('offbrand');
  //       expect(body.language).to.eq('zh');
  //       expect(body.pageSize).to.eq(1);
  //       expect(body.fields).to.eql(['title', 'price']);
  //       done();
  //     });
  //
  //     flux.details('14830');
  //   });
  //
  //   it('should emit details event', (done) => {
  //     mock.post(SEARCH_URL, (req, res) => res.body(JSON.stringify(DETAILS_RESULT)));
  //     flux.on(Events.DETAILS, (data) => {
  //       expect(data).to.be.ok;
  //       done();
  //     });
  //
  //     flux.details('14830');
  //   });
  // });
  //
  // describe('switchCollection()', () => {
  //   it('should switch collection', (done) => {
  //     const collection = 'other';
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //     flux.query.withConfiguration({ collection: 'something' });
  //
  //     flux.switchCollection(collection)
  //       .then(() => {
  //         expect(flux.query.raw.collection).to.eq(collection);
  //         done();
  //       });
  //   });
  //
  //   it('should reset paging, sort and refinements on switch collection', (done) => {
  //     const collection = 'other';
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //
  //     flux.query.withConfiguration({ collection: 'something' })
  //       .withSelectedRefinements({ navigationName: 'brand', type: 'Value', value: 'Nike' })
  //       .withSorts({ field: 'price', order: 'Descending' })
  //       .skip(30);
  //
  //     flux.switchCollection(collection)
  //       .then(() => {
  //         const rawQuery = flux.query.raw;
  //         expect(rawQuery.collection).to.eq(collection);
  //         expect(rawQuery.skip).to.eq(0);
  //         expect(rawQuery.sort).to.be.empty;
  //         expect(rawQuery.refinements).to.be.empty;
  //         done();
  //       });
  //   });
  //
  //   it('should emit collection_changed event', (done) => {
  //     const collection = 'support';
  //     mock.post(SEARCH_URL, (req, res) => res.body('ok'));
  //     flux.on(Events.COLLECTION_CHANGED, (coll) => {
  //       expect(coll).to.eq(collection);
  //       done();
  //     });
  //
  //     flux.switchCollection(collection);
  //   });
  // });
  //
  // it('should reset recall', () => {
  //   flux.query
  //     .withQuery('alabama')
  //     .withPageSize(20)
  //     .skip(34)
  //     .withSelectedRefinements({ navigationName: 'a', value: 'b', type: 'Value' })
  //     .withOrFields('boots', 'hats');
  //
  //   flux.resetRecall();
  //
  //   const request = flux.query.raw;
  //   expect(request.pageSize).to.be.ok;
  //   expect(request.orFields).to.be.ok;
  //   expect(request.refinements).to.eql([]);
  //   expect(request.skip).to.not.be.ok;
  //   expect(request.query).to.eq('');
  // });
});