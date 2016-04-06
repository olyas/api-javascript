export interface Results {

  query: string;
  originalQuery: string;
  correctedQuery: string;

  area: string;
  biasingProfile: string;
  redirect: string;

  template: Template;
  pageInfo: PageInfo;

  totalRecordCount: number;
  records: Array<Record>;

  availableNavigation: Array<Navigation>;
  selectedNavigation: Array<Navigation>;
  didYouMean: Array<string>;
  relatedQueries: Array<string>;
  rewrites: Array<string>;

  errors: string;
  debugInfo: DebugInfo;
}

export interface Template {
  name: string;
  ruleName: string;
  zones: Object;
}

export interface PageInfo {
  recordStart: number;
  recordEnd: number;
}

export interface DebugInfo {
  rawRequest: Object;
  rawResponse: Object;
  rawAggregationsRequest: Object;
  rawAggregationsResponse: Object;
}

export interface Record {
  id: string;
  url: string;
  title: string;
  snippet?: string;
  allMeta: Object;
}

export interface Navigation {
  name: string;
  refinements: Array<ValueRefinement | RangeRefinement>;
}

export type RefinementType = 'Value' | 'Range';

export interface Refinement {
  exclude?: boolean;
  type: RefinementType;
}

export interface ValueRefinement extends Refinement {
  value: string;
}

export interface RangeRefinement extends Refinement {
  low: number;
  high: number;
}