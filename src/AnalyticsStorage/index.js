import { notUndefined } from '../utils/validators';

const initialState = {
  connectedAccount: undefined,
  connectedChain: undefined,
  provider: undefined,
};

class AnalyticsStorage {
  static store = initialState;

  //payload : {[key:string]:value:any
  static dispatch(payload) {
    if (notUndefined(payload)) {
      Object.keys(payload).map((key) => {
        if (Object.keys(AnalyticsStorage.store).includes(key)) {
          const value = payload[key];
          AnalyticsStorage.store[key] =
            typeof value === 'object' ? (Array.isArray(value) ? [...value] : { ...value }) : value;
        }
      });
    }
  }
}

export default AnalyticsStorage;
