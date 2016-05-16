/// <reference path="../lib/all.d.ts" />
import { Request, SelectedValueRefinement, SelectedRangeRefinement, CustomUrlParam, RestrictNavigation, Sort, MatchStrategy, Biasing } from './request-models';
import { Results, ValueRefinement, RangeRefinement, Navigation } from './response-models';
export declare class CloudBridge {
    private clientKey;
    private customerId;
    private bridgeUrl;
    private bridgeRefinementsUrl;
    private bridgeRefinementsSearchUrl;
    private bridgeClusterUrl;
    constructor(clientKey: string, customerId: string);
    search(query: string | Query | Request, callback?: (Error?, Results?) => void): PromiseLike<Results> | void;
    private generateError(error, callback);
    private fireRequest(url, body, queryParams);
    private convertRecordFields(record);
}
export interface QueryConfiguration {
    userId?: string;
    language?: string;
    collection?: string;
    area?: string;
    biasingProfile?: string;
}
export declare class Query {
    private request;
    private unprocessedNavigations;
    queryParams: any;
    constructor(query?: string);
    withConfiguration(configuration: QueryConfiguration): Query;
    withSelectedRefinements(...refinements: Array<SelectedValueRefinement | SelectedRangeRefinement>): Query;
    withRefinements(navigationName: string, ...refinements: Array<ValueRefinement | RangeRefinement>): Query;
    withNavigations(...navigations: Navigation[]): Query;
    withCustomUrlParams(customUrlParams: CustomUrlParam[] | string): Query;
    private convertParamString(customUrlParams);
    withFields(...fields: string[]): Query;
    withOrFields(...orFields: string[]): Query;
    withSorts(...sorts: Sort[]): Query;
    withIncludedNavigations(...navigationNames: string[]): Query;
    withExcludedNavigations(...navigationNames: string[]): Query;
    withQueryParams(queryParams: any | string): Query;
    private convertQueryString(queryParams);
    refineByValue(navigationName: string, value: string, exclude?: boolean): Query;
    refineByRange(navigationName: string, low: number, high: number, exclude?: boolean): Query;
    restrictNavigation(restrictNavigation: RestrictNavigation): Query;
    skip(skip: number): Query;
    withPageSize(pageSize: number): Query;
    withMatchStrategy(matchStrategy: MatchStrategy): Query;
    withBiasing(biasing: Biasing): Query;
    enableWildcardSearch(): Query;
    disableAutocorrection(): Query;
    disableBinaryPayload(): Query;
    allowPrunedRefinements(): Query;
    build(): Request;
    private clearEmptyArrays(request);
}
