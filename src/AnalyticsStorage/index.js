import { notUndefined } from '../utils/validators';

/**
 * @typedef UserInfo
 * @type {object}
 * @property {String|undefined} browser - user browser
 * @property {number|undefined} browserVersion - user browser version
 * @property {String|undefined} device - user device e.g. (pc,mobile)
 * @property {String|undefined} os - user operating system
 * @property {String|undefined} referrer - url fr
 * @property {String|undefined} referringDomain -
 * @property {String|undefined} searchEngine -
 * @property {number|undefined} screenHeight -
 * @property {number|undefined} screenWidth -
 * @property {String} libVersion -
 */

/**
 * @typedef AnalyticsStore
 * @type {object}
 * @property {String|undefined} connectedAccount - user wallet address
 * @property {number|undefined} connectedChain - user connected network
 * @property {object[]} flow -
 * @property {boolean} initialized -
 * @property {String|undefined} ip - user ip address
 * @property {Boolean|undefined} optOut -
 * @property {Web3Provider|undefined} provider - wallet provider
 * @property {String|undefined} sessionId -
 * @property {object[]} trackingQueue -
 * @property {number} txnReject - total txn rejected in current session
 * @property {number} txnSubmit - total txn submitted txn in current session
 * @property {UserInfo|undefined} userInfo - user metadata
 */

/** @type {AnalyticsStore} */
const initialState = {
  connectedAccount: undefined,
  connectedChain: undefined,
  flow: [],
  initialized: false,
  ip: undefined,
  optOut: undefined,
  provider: undefined,
  sessionId: undefined,
  trackingQueue: [],
  txnReject: 0,
  txnSubmit: 0,
  userInfo: undefined,
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
