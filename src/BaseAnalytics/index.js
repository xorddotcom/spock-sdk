import AnalyticsStorage from '../AnalyticsStorage';
import { log } from '../utils/logs';
import { getConfig } from '../utils/helpers';
import Request from '../utils/request';

class BaseAnalytics {
  constructor(config) {
    this.appKey = config.appKey;
    this.debug = getConfig(config.debug, false);
    this.testMode = getConfig(config.testMode, false);
    this.log = (message, ...extraArguments) => log(this.debug, message, ...extraArguments);
    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.request = new Request(this.appKey, this.log, this.testMode);
  }
}

export default BaseAnalytics;
