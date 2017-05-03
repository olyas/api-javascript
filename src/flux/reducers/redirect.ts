import { Actions } from '../others';
import Store from '../store';

export type State = string;

export default function updateRedirect(state: State = null, action): State {
  switch (action.type) {
    case Actions.RECEIVE_REDIRECT: return action.redirect;
    default: return state;
  }
}
