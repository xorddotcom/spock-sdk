import AnalyticsStorage from '../AnalyticsStorage';
import { DEFAULT_CONFIG } from '../constants';
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
}

export default BaseAnalytics;
