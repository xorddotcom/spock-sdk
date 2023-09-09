import { notUndefined } from '../utils/validators';

/**
 * @typedef UserInfo
 * @type {object}
 * @property {String|undefined} browser - browser name
 * @property {number|undefined} browserVersion - version of browser
 * @property {String|undefined} device - device category e.g. (pc,mobile)
 * @property {String|undefined} os - operating system
 * @property {String|undefined} referrer - last visited web url
 * @property {String|undefined} referringDomain - last visited web domain
 * @property {String|undefined} searchEngine - browser search engine name
 * @property {number|undefined} screenHeight - height of screen in px
 * @property {number|undefined} screenWidth - width of screen in px
 * @property {String} libVersion - library version
 */

/**
 * @typedef AnalyticsStore
 * @type {object}
 * @property {String|undefined} connectedAccount - user wallet address
 * @property {number|undefined} connectedChain - user connected network
 * @property {string|undefined} distinctId - unique device id
 * @property {object[]} flow - session flow
 * @property {boolean} initialized - boolean to check the init of sdk is complete
 * @property {String|undefined} ip - user ip address
 * @property {Boolean|undefined} optOut - is user opted Out him from tracking
 * @property {Web3Provider|undefined} provider - wallet provider
 * @property {String|undefined} sessionId - uniqueId of session
 * @property {object[]} trackingQueue - pending events fired before sdk init
 * @property {number} txnReject - total txn rejected in current session
 * @property {number} txnSubmit - total txn submitted txn in current session
 * @property {UserInfo|undefined} userInfo - user metadata
 * @property {()=>number} sessionDuration - method to calculate current session duration
 */

/** @type {AnalyticsStore} */
const initialState = {
  connectedAccount: undefined,
  connectedChain: undefined,
  distinctId: undefined,
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
  sessionDuration: () => 0,
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
