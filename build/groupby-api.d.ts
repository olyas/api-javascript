// Generated by dts-bundle v0.3.0

declare module 'groupby-api' {
    export * from '__groupby-api/core/query';
    export * from '__groupby-api/core/bridge';
    export * from '__groupby-api/request-models';
    export * from '__groupby-api/response-models';
    export * from '__groupby-api/util';
}

declare module '__groupby-api/core/query' {
    import { Request, SelectedValueRefinement, SelectedRangeRefinement, CustomUrlParam, RestrictNavigation, Sort, MatchStrategy, Biasing } from '__groupby-api/request-models';
    import { ValueRefinement, RangeRefinement, Navigation } from '__groupby-api/response-models';
    export interface QueryConfiguration {
        userId?: string;
        language?: string;
        collection?: string;
        area?: string;
        biasingProfile?: string;
    }
    export class Query {
        queryParams: any;
        constructor(query?: string);
        withConfiguration(configuration: QueryConfiguration): Query;
        withSelectedRefinements(...refinements: Array<SelectedValueRefinement | SelectedRangeRefinement>): Query;
        withRefinements(navigationName: string, ...refinements: Array<ValueRefinement | RangeRefinement>): Query;
        withNavigations(...navigations: Navigation[]): Query;
        withCustomUrlParams(customUrlParams: CustomUrlParam[] | string): Query;
        withFields(...fields: string[]): Query;
        withOrFields(...orFields: string[]): Query;
        withSorts(...sorts: Sort[]): Query;
        withIncludedNavigations(...navigationNames: string[]): Query;
        withExcludedNavigations(...navigationNames: string[]): Query;
        withQueryParams(queryParams: any | string): Query;
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
    }
}

declare module '__groupby-api/core/bridge' {
    import { Request } from '__groupby-api/request-models';
    import { Results, Record } from '__groupby-api/response-models';
    import { Query } from '__groupby-api/core/query';
    export interface RawRecord extends Record {
        _id: string;
        _u: string;
        _t: string;
        _snippet?: string;
    }
    export abstract class AbstractBridge {
        protected bridgeUrl: string;
        protected abstract augmentRequest(request: any): any;
        search(query: string | Query | Request, callback?: (Error?, Results?) => void): PromiseLike<Results> | void;
    }
    export class CloudBridge extends AbstractBridge {
        constructor(clientKey: string, customerId: string);
        protected augmentRequest(request: any): any;
    }
    export class BrowserBridge extends AbstractBridge {
        constructor(customerId: string);
        protected augmentRequest(request: any): any;
    }
}

declare module '__groupby-api/request-models' {
    import { Refinement, ValueRefinement, RangeRefinement } from '__groupby-api/response-models';
    export class Request {
        query: string;
        fields: string[];
        orFields: string[];
        includedNavigations: string[];
        excludedNavigations: string[];
        sort: Sort[];
        customUrlParams: CustomUrlParam[];
        refinements: SelectedRefinement[];
        restrictNavigation: RestrictNavigation;
        biasing: Biasing;
        matchStrategy: MatchStrategy;
        userId: string;
        language: string;
        collection: string;
        area: string;
        biasingProfile: string;
        skip: number;
        pageSize: number;
        returnBinary: boolean;
        pruneRefinements: boolean;
        disableAutocorrection: boolean;
        wildcardSearchEnabled: boolean;
    }
    export type SortOrder = 'Ascending' | 'Descending';
    export interface Sort {
        field: string;
        order: SortOrder;
    }
    export interface CustomUrlParam {
        key: string;
        value: string;
    }
    export interface SelectedRefinement extends Refinement {
        navigationName: string;
    }
    export interface SelectedRangeRefinement extends SelectedRefinement, RangeRefinement {
    }
    export interface SelectedValueRefinement extends SelectedRefinement, ValueRefinement {
    }
    export interface RestrictNavigation {
        name: string;
        count: number;
    }
    export type BiasStrength = 'Absolute_Increase' | 'Strong_Increase' | 'Medium_Increase' | 'Weak_Increase' | 'Leave_Unchanged' | 'Weak_Decrease' | 'Medium_Decrease' | 'Strong_Decrease' | 'Absolute_Decrease';
    export interface Bias {
        name: string;
        content?: string;
        strength: BiasStrength;
    }
    export interface Biasing {
        bringToTop?: string[];
        augmentBiases: boolean;
        biases: Bias[];
        influence?: number;
    }
    export interface PartialMatchRule {
        terms?: number;
        termsGreaterThan?: number;
        mustMatch?: number;
        percentage?: boolean;
    }
    export interface MatchStrategy {
        rules: PartialMatchRule[];
    }
}

declare module '__groupby-api/response-models' {
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
        records: Record[];
        availableNavigation: Navigation[];
        selectedNavigation: Navigation[];
        didYouMean: string[];
        relatedQueries: string[];
        rewrites: string[];
        errors: string;
        warnings: string[];
        debugInfo: DebugInfo;
    }
    export interface Template {
        name: string;
        ruleName: string;
        zones: any;
    }
    export interface PageInfo {
        recordStart: number;
        recordEnd: number;
    }
    export interface DebugInfo {
        rawRequest: any;
        rawResponse: any;
        rawAggregationsRequest: any;
        rawAggregationsResponse: any;
    }
    export interface Record {
        id: string;
        url: string;
        title: string;
        snippet?: string;
        allMeta: any;
    }
    export interface Navigation {
        name: string;
        refinements: Array<ValueRefinement | RangeRefinement>;
        ignored?: boolean;
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
}

declare module '__groupby-api/util' {
    import { SelectedRefinement } from '__groupby-api/request-models';
    import { Navigation } from '__groupby-api/response-models';
    export class NavigationConverter {
        static convert(navigations: Array<Navigation>): Array<SelectedRefinement>;
    }
}
