import { rayify } from '../utils';
import { Events, FluxCapacitor } from './capacitor';

export const DETAIL_QUERY_INDICATOR = 'gbiDetailQuery';
export const INDEXED = Symbol();

type Observer = (oldState: any, newState: any) => void;

namespace Observer {
  export type Map = { [key: string]: Observer | Map };
  export type Node = Map | Observer | (Observer & Map);

  export function listen(flux: FluxCapacitor) {
    let oldState;

    return () => {
      const state = flux.store.getState();

      Observer.resolve(oldState, state, Observer.create(flux));

      oldState = state;
    };
  }

  export function shouldObserve(oldState: any, newState: any, observer: Node): observer is Observer {
    // double check this logic
    return typeof observer === 'function'
      && !(INDEXED in observer && oldState.allIds === newState.allIds);
  }

  export function resolve(oldState: any, newState: any, observer: Node) {
    if (oldState !== newState) {
      if (Observer.shouldObserve(oldState, newState, observer)) {
        observer(oldState, newState);
      }

      if (INDEXED in observer && 'allIds' in newState && oldState.allIds === newState.allIds) {
        Object.keys(newState.allIds)
          .forEach((key) => Observer.resolveIndexed(oldState.byId[key], newState.byId[key], observer[INDEXED]));
      }

      Object.keys(observer)
        .forEach((key) => Observer.resolve((oldState || {})[key], (newState || {})[key], observer[key]));
    }
  }

  export function resolveIndexed(oldState: any, newState: any, observer: Observer) {
    if (oldState !== newState) {
      observer(oldState, newState);
    }
  }

  export function create(flux: FluxCapacitor) {
    const emit = (event: string) => (_, newValue) => flux.emit(event, newValue);
    const indexed = (event: string, prefix: string, field: string) =>
      Object.assign(emit(event), {
        INDEXED: (_, newIndexed) => flux.emit(`${prefix}:${newIndexed[field]}`, newIndexed)
      });

    return {
      data: {
        query: Object.assign(emit(Events.QUERY_UPDATED), {
          original: emit(Events.ORIGINAL_QUERY_UPDATED),
          corrected: emit(Events.CORRECTED_QUERY_UPDATED),
          related: emit(Events.RELATED_QUERIES_UPDATED),
          didYouMeans: emit(Events.DID_YOU_MEANS_UPDATED),
          rewrites: emit(Events.QUERY_REWRITES_UPDATED),
        }),

        sorts: emit(Events.SORTS_UPDATED),

        products: emit(Events.PRODUCTS_UPDATED),

        collections: {
          INDEXED: (_, newIndexed) => flux.emit(`${Events.COLLECTION_UPDATED}:${newIndexed.name}`, newIndexed),
          selected: emit(Events.SELECTED_COLLECTION_UPDATED)
        },

        navigations: Object.assign(emit(Events.NAVIGATIONS_UPDATED), {
          INDEXED: (oldNavigation, newNavigation) => {
            if (oldNavigation.selected !== newNavigation.selected) {
              flux.emit(`${Events.SELECTED_REFINEMENTS_UPDATED}:${newNavigation.field}`, newNavigation.selected);
            }
          }
        }),

        autocomplete: Object.assign(emit(Events.AUTOCOMPLETE_UPDATED), {
          query: emit(Events.AUTOCOMPLETE_QUERY_UPDATED),
          products: emit(Events.AUTOCOMPLETE_PRODUCTS_UPDATED)
        }),

        page: Object.assign(emit(Events.PAGE_UPDATED), {
          size: emit(Events.PAGE_SIZE_UPDATED),
          current: emit(Events.CURRENT_PAGE_UPDATED),
        }),

        template: emit(Events.TEMPLATE_UPDATED),

        details: {
          id: emit(Events.DETAILS_ID_UPDATED),
          product: emit(Events.DETAILS_PRODUCT_UPDATED)
        },

        reditect: emit(Events.REDIRECT),
      }
    };
  }
}

export default Observer;
