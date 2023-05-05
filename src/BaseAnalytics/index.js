import AnalyticsStorage from '../AnalyticsStorage';
import { DEFAULT_CONFIG, LOG, TRACKING_EVENTS, UTM_KEYS } from '../constants';
import { cheapGuid, getQueryParams, parseFlowProperties, transformUTMKey } from './utils';
import { setCookie } from '../utils/cookies';
import { getConfig } from '../utils/helpers';
import { log } from '../utils/logs';
import Request from '../utils/request';

/**
 * @typedef Config
 * @type {object}
 * @property {String} appKey - application unique key
 * @property {boolean} debug - sdk in debug mode
 * @property {boolean} testENV - sdk in test environment
 * @property {boolean} testMode - sdk in test mode
 */

/**
 * Base class for analytics configuration
 */
class BaseAnalytics {
  /**
   * Base class constructor
   * @param {Config} config - SDK configuration.
   */
  constructor(config) {
    this.appKey = config.appKey;
    this.inActivityTimeout = getConfig(config.inactivityTimeout, DEFAULT_CONFIG.INACTIVITY_TIMEOUT);
    this.debug = getConfig(config.debug, DEFAULT_CONFIG.DEBUG);
    this.trackGeolocation = getConfig(config.geolocation, DEFAULT_CONFIG.GEOLOCATION);
    this.testENV = getConfig(config.testENV, DEFAULT_CONFIG.TEST_ENV);
    this.testMode = getConfig(config.testMode, DEFAULT_CONFIG.TEST_MODE);
    this.defaultOptOut = getConfig(config.optOut, DEFAULT_CONFIG.OPT_OUT);

    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.log = (message, ...extraArguments) => log(this.debug && !this.store.optOut, message, ...extraArguments);
    this.request = new Request({
      appKey: this.appKey,
      log: this.log,
      testMode: this.testMode,
      testENV: this.testENV,
      store: this.store,
    });
  }

  setConsetCookie(cName, cValue, expiry) {
    this.store.optOut && setCookie(cName, cValue, expiry);
  }

  trackEvent({ event, properties, logMessage, callback }) {
    const utmParams = UTM_KEYS.reduce((accum, key) => {
      const param = getQueryParams(document.URL, key);
      if (param) {
        accum[transformUTMKey(key)] = param;
      }
      return accum;
    }, {});

    const data = {
      ...this.store.userInfo,
      ...utmParams,
      chain: this.store.connectedChain,
      currentUrl: window.location.href,
      insertId: cheapGuid(),
      sessionId: this.store.sessionId,
      time: Date.now() / 1000,
      ...(properties ?? {}),
    };

    if (![TRACKING_EVENTS.SESSION, TRACKING_EVENTS.PAUSE_SESSION].includes(event)) {
      this.dispatch({
        flow: [...this.store.flow, { event, properties: parseFlowProperties(event, properties) }],
      });
    }

    this.request.post(`track/${event}`, { data, callback });

    logMessage && this.log(LOG.INFO, logMessage, data);
  }
}

export default BaseAnalytics;
