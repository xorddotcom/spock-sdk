import AnalyticsStorage from '../AnalyticsStorage';
import { configrationDefaultValue } from '../constants';
import { log } from '../utils/logs';
import { getConfig } from '../utils/helpers';
import Request from '../utils/request';

class BaseAnalytics {
  constructor(config) {
    this.appKey = config.appKey;
    this.debug = getConfig(config.debug, configrationDefaultValue.DEBUG);
    this.testMode = getConfig(config.testMode, configrationDefaultValue.TEST_MODE);
    this.log = (message, ...extraArguments) => log(this.debug, message, ...extraArguments);
    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.request = new Request({ appKey: this.appKey, log: this.log, testMode: this.testMode, store: this.store });
  }
}

export default BaseAnalytics;
