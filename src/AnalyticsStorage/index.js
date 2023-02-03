import { notUndefined } from '../utils/validators';

/**
 * @typedef UserInfo
 * @type {object}
 * @property {String|undefined} system - user browser
 * @property {String|undefined} OS - user operating sustem
 * @property {String|undefined} device - user device e.g. (pc,mobile)
 * @property {String|undefined} language - user browser language e.g.(en-US)
 */

/**
 * @typedef PageNavigation
 * @type {object}
 * @property {String} page - page path
 * @property {boolean} doneTxn - is user submitted txn in that page
 */

/**
 * @typedef AnalyticsStore
 * @type {object}
 * @property {String|undefined} connectedAccount - user wallet address
 * @property {number|undefined} connectedChain - user connected network
 * @property {Web3Provider|undefined} provider - wallet provider
 * @property {String|undefined} userId - user unique device provider
 * @property {UserInfo|undefined} userInfo - user metadata
 * @property {PageNavigation[]} pageNavigation - user navigation in current session
 * @property {boolean} doneTxn - is user submitted txn in current session
 * @property {boolean} rejectTxn - is user rejected txn in current session
 * @property {number} submitTxnCount - total txn rejected in current session
 * @property {number} rejectTxnCount - total txn submitted txn in current session
 * @property {String|undefined} ip - user ip address
 */

/** @type {AnalyticsStore} */
const initialState = {
  connectedAccount: undefined,
  connectedChain: undefined,
  provider: undefined,
  userId: undefined,
  userInfo: undefined,
  pageNavigation: [],
  doneTxn: false,
  rejectTxn: false,
  submitTxnCount: 0,
  rejectTxnCount: 0,
  ip: undefined,
};

class AnalyticsStorage {
  static store = initialState;

  /**
   *  Diaptch payload into analytics store
   *  @param {Object<string,any>} payload - data to be added into store
   */
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
