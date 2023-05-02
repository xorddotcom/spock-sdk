import AnalyticsStorage from '../AnalyticsStorage';
import { DEFAULT_CONFIG, LOG, TRACKING_EVENTS, UTM_KEYS } from '../constants';
import { getConfig } from '../utils/helpers';
import { log } from '../utils/logs';
import Request from '../utils/request';
import { cheapGuid, getQueryParams, transformUTMKey } from './utils';

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
    this.debug = getConfig(config.debug, DEFAULT_CONFIG.DEBUG);
    this.testENV = getConfig(config.testENV, DEFAULT_CONFIG.TEST_ENV);
    this.testMode = getConfig(config.testMode, DEFAULT_CONFIG.TEST_MODE);
    this.log = (message, ...extraArguments) => log(this.debug, message, ...extraArguments);
    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.request = new Request({
      appKey: this.appKey,
      log: this.log,
      testMode: this.testMode,
      testENV: this.testENV,
      store: this.store,
    });
  }

  parseFlowProperties(eventName, properties) {
    if (eventName === TRACKING_EVENTS.TRANSACTION) {
      return { from: properties.from, to: properties.to };
    } else {
      return properties;
    }
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
        flow: [...this.store.flow, { event, properties: this.parseFlowProperties(event, properties) }],
      });
    }

    this.request.post(`track/${event}`, { data, callback });

    logMessage && this.log(LOG.INFO, logMessage, data);
  }
}

export default BaseAnalytics;
