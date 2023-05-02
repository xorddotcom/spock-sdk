import { notUndefined } from '../utils/validators';

/**
 * @typedef UserInfo
 * @type {object}
 * @property {String|undefined} browser - user browser
 * @property {number|undefined} browserVersion - user browser version
 * @property {String|undefined} device - user device e.g. (pc,mobile)
 * @property {String|undefined} os - user operating system
 * @property {String|undefined} referrer -
 * @property {String|undefined} referringDomain -
 * @property {String|undefined} searchEngine -
 * @property {number|undefined} screenHeight -
 * @property {number|undefined} screenWidth -
 * @property {String} libVersion -
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
 * @property {String|undefined} sessionId -
 */

/** @type {AnalyticsStore} */
const initialState = {
  connectedAccount: undefined,
  connectedChain: undefined,
  provider: undefined,
  userInfo: undefined,
  flow: [],
  txnReject: 0,
  txnSubmit: 0,
  ip: undefined,
  sessionId: undefined,
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
