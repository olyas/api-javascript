import Store from './store';

export const thunk = (type: string, data: any) => (dispatch) => dispatch({ type, ...data });

export const conditional = (predicate: (state: Store.State) => boolean, type: string, data: any) =>
  (dispatch, getStore) => {
    if (predicate(getStore())) {
      dispatch({ type, ...data });
  }
};

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

export const LinkMapper = (baseUrl: string) => (value: string) => ({ value, url: `${baseUrl}/${value}` });