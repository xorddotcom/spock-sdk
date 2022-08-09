import AnalyticsStorage from '../AnalyticsStorage';
import { log, getConfig } from '../utils';

class BaseAnalytics {
  constructor(config) {
    this.debug = getConfig(config.debug, false);
    this.log = (message, ...extraArguments) => log(this.debug, message, ...extraArguments);
    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
  }
}

export default BaseAnalytics;
