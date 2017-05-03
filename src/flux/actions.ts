import { Dispatch } from 'redux';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig, Sayt } from 'sayt';
import { BridgeQuery, BrowserBridge } from '../core/bridge';
import { FluxCapacitor } from '../flux/capacitor';
import { Request } from '../models/request';
import { RefinementResults, Results } from '../models/response';
import { rayify } from '../utils';
import ResponseAdapter from './adapters/response';
import Selectors from './selectors';
import Store from './store';
import { conditional, LinkMapper, thunk } from './utils';

export class Actions {
  private linkMapper: (value: string) => Store.Linkable;

  constructor(private flux: FluxCapacitor, paths: Paths) {
    this.linkMapper = LinkMapper(paths.search);
  }

  // fetch action creators
  fetchMoreRefinements = (navigationId: string) =>
    (dispatch: Dispatch<any>, getStore: () => Store.State) => {
      const state = getStore();
      if (Selectors.hasMoreRefinements(state, navigationId)) {
        return this.flux.bridge.refinements(Selectors.searchRequest(state), navigationId)
          .then(({ navigation: { name, refinements } }) => {
            const remapped = refinements.map(ResponseAdapter.extractRefinement);
            return dispatch(this.receiveMoreRefinements(name, remapped));
          });
      }
    }

  fetchProducts = (request: Request) => (dispatch: Dispatch<any>) =>
    this.flux.bridge.search(request)
      .then((res) => dispatch(this.receiveSearchResponse(res)))

  fetchAutocompleteSuggestions = (query: string, config: QueryTimeAutocompleteConfig) =>
    (dispatch: Dispatch<any>) => this.flux.sayt.autocomplete(query, config)
      .then((res) => {
        const { suggestions, categoryValues } = ResponseAdapter.extractAutocompleteSuggestions(res);
        dispatch(this.receiveAutocompleteSuggestions(suggestions, categoryValues));
      })

  fetchAutocompleteProducts = (query: string, config: QueryTimeProductSearchConfig) =>
    (dispatch: Dispatch<any>) => this.flux.sayt.productSearch(query, config)
      .then((res) => {
        const products = ResponseAdapter.extractAutocompleteProducts(res);
        dispatch(this.receiveAutocompleteProducts(products));
      })

  fetchCollectionCount = (collection: string) => (dispatch: Dispatch<any>, getStore: () => Store.State) => {
    const state = getStore();
    this.flux.bridge.search({ ...Selectors.searchRequest(state), collection })
      .then((res) => dispatch(this.receiveCollectionCount(collection, res.totalRecordCount)));
  }

  // request action creators
  updateSearch = (search: Search) =>
    thunk(Actions.UPDATE_SEARCH, search)

  selectRefinement = (navigationId: string, index: number) =>
    conditional<Actions.Navigation.SelectRefinement>((state) =>
      Selectors.isRefinementDeselected(state, navigationId, index),
      Actions.SELECT_REFINEMENT, { navigationId, index })

  deselectRefinement = (navigationId: string, index: number) =>
    conditional<Actions.Navigation.DeselectRefinement>((state) =>
      Selectors.isRefinementSelected(state, navigationId, index),
      Actions.DESELECT_REFINEMENT, { navigationId, index })

  selectCollection = (id: string) =>
    conditional<Actions.Collections.SelectCollection>((state) =>
      state.data.collections.selected !== id,
      Actions.SELECT_COLLECTION, { id })

  selectSort = (id: string) =>
    conditional<Actions.Sort.UpdateSelected>((state) =>
      state.data.sorts.selected !== id,
      Actions.SELECT_SORT, { id })

  updatePageSize = (size: number) =>
    conditional<Actions.Page.UpdateSize>((state) =>
      state.data.page.size !== size,
      Actions.UPDATE_PAGE_SIZE, { size })

  updateCurrentPage = (page: number) =>
    conditional<Actions.Page.UpdateCurrent>((state) =>
      state.data.page.current !== page,
      Actions.UPDATE_CURRENT_PAGE, { page })

  updateDetailsId = (id: string) =>
    thunk<Actions.Details.UpdateId>(Actions.UPDATE_DETAILS_ID, { id })

  updateAutocompleteQuery = (query: string) =>
    conditional<Actions.Autocomplete.UpdateQuery>((state) =>
      state.data.autocomplete.query !== query,
      Actions.UPDATE_AUTOCOMPLETE_QUERY, { query })

  // response action creators
  receiveSearchResponse = (results: Results) =>
    (dispatch: Dispatch<any>, getStore: () => Store.State) => {
      const state = getStore();
      dispatch(this.receiveRedirect(results.redirect));
      dispatch(this.receiveQuery(ResponseAdapter.extractQuery(results, this.linkMapper)));
      dispatch(this.receiveProducts(results.records.map(ResponseAdapter.extractProduct)));
      // tslint:disable-next-line max-line-length
      dispatch(this.receiveNavigations(ResponseAdapter.combineNavigations(results.availableNavigation, results.selectedNavigation)));
      dispatch(this.receiveRecordCount(results.totalRecordCount));
      dispatch(this.receiveCollectionCount(state.data.collections.selected, results.totalRecordCount));
      dispatch(this.receivePage(ResponseAdapter.extractPage(state)));
      dispatch(this.receiveTemplate(ResponseAdapter.extractTemplate(results.template)));
    }

  receiveQuery = (query: Query) =>
    thunk<Actions.Query.ReceiveQuery>(Actions.RECEIVE_QUERY, query)

  receiveProducts = (products: Store.Product[]) =>
    thunk(Actions.RECEIVE_PRODUCTS, { products })

  receiveCollectionCount = (collection: string, count: number) =>
    thunk<Actions.Collections.ReceiveCount>(
      Actions.RECEIVE_COLLECTION_COUNT, { collection, count })

  receiveNavigations = (navigations: Store.Navigation[]) =>
    thunk<Actions.Navigation.ReceiveNavigations>(
      Actions.RECEIVE_NAVIGATIONS, { navigations })

  receivePage = (page: Page) =>
    thunk<Actions.Page.ReceivePage>(
      Actions.RECEIVE_PAGE, page)

  receiveTemplate = (template: Store.Template) =>
    thunk(Actions.RECEIVE_TEMPLATE, { template })

  receiveRecordCount = (recordCount: number) =>
    thunk(Actions.RECEIVE_RECORD_COUNT, { recordCount })

  receiveRedirect = (redirect: string) =>
    thunk(Actions.RECEIVE_REDIRECT, { redirect })

  receiveMoreRefinements = (navigationId: string, refinements: any) =>
    thunk<Actions.Navigation.ReceiveMoreRefinements>(
      Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements })

  receiveAutocompleteSuggestions = (suggestions: string[], categoryValues: string[]) =>
    thunk<Actions.Autocomplete.ReceiveSuggestions>(
      Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, { suggestions, categoryValues })

  receiveAutocompleteProducts = (products: Store.Product[]) =>
    thunk(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, { products })

  receiveDetailsProduct = (product: Store.Product) =>
    thunk<Actions.Details.ReceiveProduct>(Actions.RECEIVE_DETAILS_PRODUCT, { product })
}

export namespace Actions {
  // request actions
  export const UPDATE_AUTOCOMPLETE_QUERY = 'UPDATE_AUTOCOMPLETE_QUERY';
  export const UPDATE_DETAILS_ID = 'UPDATE_DETAILS_ID';
  export const UPDATE_SEARCH = 'UPDATE_SEARCH';
  export const SELECT_REFINEMENT = 'SELECT_REFINEMENT';
  export const DESELECT_REFINEMENT = 'DESELECT_REFINEMENT';
  export const SELECT_COLLECTION = 'SELECT_COLLECTION';
  export const SELECT_SORT = 'UPDATE_SORTS';
  export const UPDATE_PAGE_SIZE = 'UPDATE_PAGE_SIZE';
  export const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE';

  // response actions
  export const RECEIVE_MORE_REFINEMENTS = 'RECEIVE_MORE_REFINEMENTS';
  export const RECEIVE_AUTOCOMPLETE_SUGGESTIONS = 'RECEIVE_AUTOCOMPLETE_SUGGESTIONS';
  export const RECEIVE_AUTOCOMPLETE_PRODUCTS = 'RECEIVE_AUTOCOMPLETE_PRODUCTS';
  export const RECEIVE_DETAILS_PRODUCT = 'RECEIVE_DETAILS_PRODUCT';
  export const RECEIVE_QUERY = 'RECEIVE_QUERY';
  export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS';
  export const RECEIVE_COLLECTION_COUNT = 'RECEIVE_COLLECTION_COUNT';
  // TODO
  export const RECEIVE_NAVIGATIONS = 'RECEIVE_NAVIGATIONS';
  export const RECEIVE_PAGE = 'RECEIVE_PAGE';
  export const RECEIVE_RECORD_COUNT = 'RECEIVE_RECORD_COUNT';
  export const RECEIVE_TEMPLATE = 'RECEIVE_TEMPLATE';
  export const RECEIVE_REDIRECT = 'RECEIVE_REDIRECT';

  export interface Action { type: string; }
  export namespace Autocomplete {
    export interface UpdateQuery extends Action {
      query: string;
    }
    export interface ReceiveSuggestions extends Action {
      suggestions: string[];
      categoryValues: string[];
    }
  }
  export namespace Collections {
    export interface SelectCollection extends Action {
      id: string;
    }
    export interface ReceiveCount extends Action {
      collection: string;
      count: number;
    }
  }
  export namespace Details {
    export interface UpdateId extends Action {
      id: string;
    }
    export interface ReceiveProduct extends Action {
      product: Store.Product;
    }
  }
  export namespace Navigation {
    export interface RefinementAction extends Action {
      navigationId: string;
      index: number;
    }
    export type SelectRefinement = RefinementAction;
    export type DeselectRefinement = RefinementAction;
    export interface UpdateSearch extends Partial<RefinementAction> {
      clear?: boolean;
    }
    export interface ReceiveNavigations extends Action {
      navigations: Store.Navigation[];
    }
    export interface ReceiveMoreRefinements extends Action {
      navigationId: string;
      refinements: Store.Refinement[];
    }
  }
  export namespace Page {
    export interface UpdateCurrent extends Action {
      page: number;
    }
    export interface UpdateSize extends Action {
      size: number;
    }
    export interface ReceivePage extends Action {
      from: number;
      to: number;
      last: number;
      next: number;
      previous: number;
      range: number[];
    }
  }
  export namespace Query {
    export interface UpdateOriginal extends Action {
      query: string;
    }
    export interface ReceiveQuery extends Action {
      corrected?: string;
      rewrites: string[];
      didYouMean: Store.Linkable[];
      related: Store.Linkable[];
    }
  }
  export namespace Sort {
    export interface UpdateSelected extends Action {
      id: string;
    }
  }
}

import _Actions = Actions;
export default _Actions;

export interface Query {
  corrected?: string;
  related: Store.Query.Related[];
  didYouMean: Store.Query.DidYouMean[];
  rewrites: string[];
}

export interface Search {
  query?: string;
  navigationId?: string;
  index?: number;

  /**
   * only for refinements
   * if true, replace refinements with the provided ones
   * if false, add the provided refinements
   */
  clear?: boolean;
}

export namespace Search {
  export type Refinement = ValueRefinement | RangeRefinement;

  export interface BaseRefinement {
    field: string;
  }

  export interface ValueRefinement extends BaseRefinement {
    value: string;
  }

  export interface RangeRefinement extends BaseRefinement {
    low?: number;
    high?: number;
  }
}

export interface Page {
  previous: number;
  next: number;
  last: number;
  from: number;
  to: number;
  range: number[];
}

export interface Paths {
  search: string;
  // details: string;
}