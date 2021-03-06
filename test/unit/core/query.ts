import { Query } from '../../../src/core/query';
import { SelectedValueRefinement } from '../../../src/models/request';
import suite from '../_suite';
import { COMBINED_REFINEMENTS, COMPLEX_REQUEST, CUSTOM_PARAMS_FROM_STRING } from '../fixtures';

suite('Query', ({ expect }) => {
  let query: Query;

  beforeEach(() => query = new Query('test'));

  it('should be defined', () => {
    expect(query).to.be.ok;
  });

  it('should build a simple request with defaults', () => {
    const request = query.build();
    expect(request).to.eql({
      query: 'test',
      wildcardSearchEnabled: false,
      pruneRefinements: true
    });
  });

  it('should build a complex request', () => {
    const request = new Query('complex')
      .withConfiguration({
        userId: '13afasd',
        language: 'en',
        collection: 'dev',
        area: 'Development',
        biasingProfile: 'boost top brands'
      })
      .withCustomUrlParams([{ key: 'banner', value: 'nike_landing' }, { key: 'style', value: 'branded' }])
      .withFields('title', 'description')
      .withOrFields('brand', 'colour')
      .withIncludedNavigations('brand', 'size')
      .withExcludedNavigations('_meta', 'originalPrice')
      .withQueryParams({
        attrs: 'size,brand',
        id: ''
      })
      .withQueryParams('?what=unused')
      .withSorts({ type: 'Field', field: 'price', order: 'Ascending' },
      { type: 'Field', field: 'boost', order: 'Descending' })
      .withPageSize(300)
      .skip(40)
      .restrictNavigation({
        name: 'brand',
        count: 10
      })
      .withMatchStrategy({
        rules: [{ terms: 5, termsGreaterThan: 7 }]
      })
      .withBiasing({
        augmentBiases: true,
        biases: [{ name: 'popularity', strength: 'Strong_Decrease' }]
      })
      .enableWildcardSearch()
      .disableAutocorrection()
      .allowPrunedRefinements()
      .disableBinaryPayload()
      .build();

    expect(request).to.eql(COMPLEX_REQUEST);
  });

  describe('withConfiguration() behaviour', () => {
    it('should allow all properties through', () => {
      const request = query.withConfiguration(<any>{
        some: 'invalid',
        properties: 'are these'
      }).build();
      expect(request).to.eql({
        query: 'test',
        wildcardSearchEnabled: false,
        pruneRefinements: true,
        some: 'invalid',
        properties: 'are these'
      });
    });

    it('should allow a custom mask', () => {
      const request = query.withConfiguration(<any>{
        some: 'invalid',
        properties: 'are these'
      }, '{query,other}').build();
      expect(request).to.not.have.keys('some', 'properties');
    });
  });

  it('should allow multiple methods of setting refinements', () => {
    const request = new Query('refinements')
      .withSelectedRefinements(
      {
        navigationName: 'size',
        type: 'Range',
        low: 1,
        high: 13,
        exclude: false
      }, {
        navigationName: 'brand',
        type: 'Value',
        value: 'Nike',
        exclude: true
      })
      .withRefinements('material', <any>{
        type: 'Value',
        value: 'wool'
      })
      .withRefinements('year', <any>{
        type: 'Range',
        low: 2000,
        high: 2009,
        exclude: false
      }, <any>{
        type: 'Range',
        low: 2010,
        high: 2011
      })
      .withNavigations(<any>{
        name: 'rating',
        refinements: [{ type: 'Value', value: '***' }]
      }, <any>{
        name: 'price',
        refinements: [
          { type: 'Range', low: 31, high: 44 },
          { type: 'Range', low: 89, high: 100 }
        ]
      })
      .refineByValue('rating', '****', true)
      .refineByRange('price', 122, 413)
      .build();

    expect(request.refinements).to.eql(COMBINED_REFINEMENTS);
  });

  it('should expose getter for withNavigations', () => {
    const navigations = [1,2,3,4];
    query.withNavigations(...<any>navigations);

    const nav = query.rawNavigations;
    for (const key of navigations) {
      expect(nav[key]).to.eql(navigations[key]);
    }
  });

  it('should not allow setting the same refinement multiple times', () => {
    const refinement: SelectedValueRefinement = { type: 'Value', navigationName: 'brand', value: 'DeWalt' };
    query.withQuery('refinements')
      .withSelectedRefinements(refinement, refinement);
    expect(query.build().refinements.length).to.eq(1);
  });

  it('should allow unsetting refinement', () => {
    query.withQuery('refinements')
      .withSelectedRefinements(
      { type: 'Value', navigationName: 'brand', value: 'DeWalt' },
      { type: 'Range', navigationName: 'price', low: 20, high: 40 });
    expect(query.build().refinements.length).to.eq(2);

    query.withoutSelectedRefinements({ type: 'Value', navigationName: 'brand', value: 'DeWalt' });
    const request = query.build();
    expect(request.refinements.length).to.eq(1);
    expect(request.refinements[0].type).to.eq('Range');
  });

  it('should allow unsetting refinement, without removing non-existent refinements', () => {
    const refinements = [{ type: 'Value', navigationName: 'brand', value: 'DeWalt' },
                         { type: 'Range', navigationName: 'price', low: 20, high: 40 }];
    query.withQuery('refinements')
      .withSelectedRefinements(...<any>refinements);
    expect(query.build().refinements.length).to.eq(2);

    query.withoutSelectedRefinements({ type: 'Value', navigationName: 'not-brand', value: 'DeWalt' });
    const request = query.build();
    expect(request.refinements).to.eql(refinements);
  });

  it('should convert custom URL params', () => {
    const request = new Query('parameters')
      .withCustomUrlParams('banner=nike_landing&style=branded')
      .withCustomUrlParams('defaults')
      .withCustomUrlParams('others=&something=as_well')
      .build();

    expect(request.customUrlParams).to.eql(CUSTOM_PARAMS_FROM_STRING);
  });

  it('should not convert custom URL params if invalid param', () => {
    const request = new Query('parameters')
      .withCustomUrlParams(<any>4)
      .build();

    expect(request.customUrlParams).to.be.undefined;
  });

  it('should expose a copy of the raw request', () => {
    query.withQuery('raw request')
      .skip(10)
      .withPageSize(300);
    const rawRequest = query.raw;
    expect(rawRequest.skip).to.eq(10);
    expect(rawRequest.pageSize).to.eq(300);
    rawRequest.skip = 20;
    rawRequest.pageSize = 47;
    expect(query.build().skip).to.eq(10);
    expect(query.build().pageSize).to.eq(300);
  });

  it('should expose a copy of the raw navigations', () => {
    query.withQuery('raw request')
      .skip(10)
      .withPageSize(300);
    const rawRequest = query.raw;
    expect(rawRequest.skip).to.eq(10);
    expect(rawRequest.pageSize).to.eq(300);
    rawRequest.skip = 20;
    rawRequest.pageSize = 47;
    expect(query.build().skip).to.eq(10);
    expect(query.build().pageSize).to.eq(300);
  });

  it('should allow sorts to be unselected', () => {
    query.withQuery('')
      .withSorts({ type: 'Field', field: 'this', order: 'Ascending' },
      { type: 'Field', field: 'that', order: 'Descending' });
    expect(query.raw.sort.length).to.eq(2);
    query.withoutSorts({ type: 'Field', field: 'that', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(1);
    expect(query.raw.sort[0].field).to.eq('this');
    query.withoutSorts({ type: 'Field', field: 'this', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(0);
  });

  it('should default query to empty string', () => {
    const noQuery = new Query();
    query.withSorts({ type: 'Field', field: 'this', order: 'Ascending' },
    { type: 'Field', field: 'that', order: 'Descending' });
    expect(query.raw.sort.length).to.eq(2);
    query.withoutSorts({ type: 'Field', field: 'that', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(1);
    expect(query.raw.sort[0].field).to.eq('this');
    query.withoutSorts({ type: 'Field', field: 'this', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(0);
  });
});
