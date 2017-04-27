import { Query } from '../../../src/core/query';
import { SelectedValueRefinement } from '../../../src/models/request';
import { COMBINED_REFINEMENTS, COMPLEX_REQUEST, CUSTOM_PARAMS_FROM_STRING } from '../../fixtures';
import suite from '../_suite';

suite('Query', ({ expect }) => {
  let query: Query;

  beforeEach(() => {
    query = new Query('test');
  });

  afterEach(() => {
    query = null;
  });

  it('should be defined', () => {
    expect(query).to.be.ok;
  });

  it('should build a simple request with defaults', () => {
    const request = query.build();
    expect(request).to.eql({
      pruneRefinements: true,
      query: 'test',
      wildcardSearchEnabled: false,
    });
  });

  it('should build a complex request', () => {
    const request = new Query('complex')
      .withConfiguration({
        area: 'Development',
        biasingProfile: 'boost top brands',
        collection: 'dev',
        language: 'en',
        userId: '13afasd',
      })
      .withCustomUrlParams([{ key: 'banner', value: 'nike_landing' }, { key: 'style', value: 'branded' }])
      .withFields('title', 'description')
      .withOrFields('brand', 'colour')
      .withIncludedNavigations('brand', 'size')
      .withExcludedNavigations('_meta', 'originalPrice')
      .withQueryParams({
        attrs: 'size,brand',
        id: '',
      })
      .withSorts({ field: 'price', order: 'Ascending' }, { field: 'boost', order: 'Descending' })
      .withPageSize(300)
      .skip(40)
      .restrictNavigation({
        count: 10,
        name: 'brand',
      })
      .withMatchStrategy({
        rules: [{ terms: 5, termsGreaterThan: 7 }],
      })
      .withBiasing({
        augmentBiases: true,
        biases: [{ name: 'popularity', strength: 'Strong_Decrease' }],
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
        properties: 'are these',
        some: 'invalid',
      }).build();
      expect(request).to.eql({
        properties: 'are these',
        pruneRefinements: true,
        query: 'test',
        some: 'invalid',
        wildcardSearchEnabled: false,
      });
    });

    it('should allow a custom mask', () => {
      const request = query.withConfiguration(<any>{
        properties: 'are these',
        some: 'invalid',
      }, '{query,other}').build();
      expect(request).to.not.have.keys('some', 'properties');
    });
  });

  it('should allow multiple methods of setting refinements', () => {
    const request = new Query('refinements')
      .withSelectedRefinements(
      {
        exclude: false,
        high: 13,
        low: 1,
        navigationName: 'size',
        type: 'Range',
      }, {
        exclude: true,
        navigationName: 'brand',
        type: 'Value',
        value: 'Nike',
      })
      .withRefinements('material', <any>{
        type: 'Value',
        value: 'wool',
      })
      .withRefinements('year', <any>{
        exclude: false,
        high: 2009,
        low: 2000,
        type: 'Range',
      }, <any>{
        high: 2011,
        low: 2010,
        type: 'Range',
      })
      .withNavigations(<any>{
        name: 'rating',
        refinements: [{ type: 'Value', value: '***' }],
      }, <any>{
        name: 'price',
        refinements: [
          { type: 'Range', low: 31, high: 44 },
          { type: 'Range', low: 89, high: 100 },
        ],
      })
      .refineByValue('rating', '****', true)
      .refineByRange('price', 122, 413)
      .build();

    expect(request.refinements).to.eql(COMBINED_REFINEMENTS);
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

  it('should convert custom URL params', () => {
    const request = new Query('parameters')
      .withCustomUrlParams('banner=nike_landing&style=branded')
      .withCustomUrlParams('defaults')
      .withCustomUrlParams('others=&something=as_well')
      .build();

    expect(request.customUrlParams).to.eql(CUSTOM_PARAMS_FROM_STRING);
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
      .withSorts({ field: 'this', order: 'Ascending' }, { field: 'that', order: 'Descending' });
    expect(query.raw.sort.length).to.eq(2);
    query.withoutSorts({ field: 'that', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(1);
    expect(query.raw.sort[0].field).to.eq('this');
    query.withoutSorts({ field: 'this', order: 'Ascending' });
    expect(query.raw.sort.length).to.eq(0);
  });
});
