import AnalyticsStorage from '../AnalyticsStorage';
import { log } from '../utils/logs';
import { getConfig } from '../utils/helpers';
import Request from '../utils/request';
import { configrationDefaultValue } from '../constants';

class BaseAnalytics {
  constructor(config) {
    this.appKey = config.appKey;
    this.debug = getConfig(config.debug, false);
    this.inactivityTimeout=getConfig(config.inactivityCounter,configrationDefaultValue.INACTIVITY_TIMEOUT);
    this.log = (message, ...extraArguments) => log(this.debug, message, ...extraArguments);
    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.request = new Request(this.appKey, this.log);
  }
}

export default BaseAnalytics;
