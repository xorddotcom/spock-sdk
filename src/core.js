import invariant from 'tiny-invariant';

import BaseAnalytics from './BaseAnalytics';
import WalletConnection from './WalletConnection';
import UserInfo from './UserInfo';
import Tracking from './Tracking';
import { logEnums } from './constants';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.userInfo = new UserInfo(config);
    this.wallet = new WalletConnection(config);
    this.tracking = new Tracking(config);
  }

  initialize() {
    this.log(logEnums.INFO, 'Web3 Analytics initialized');
    this.userInfo.getUserInfo();
    this.wallet.initialize();
    this.tracking.initialize();
  }

  valueContribution(label, valueInUSD) {
    invariant(typeof label !== 'string' || typeof valueInUSD !== 'number', 'Invalid arguments');
    this.log(logEnums.INFO, 'Value Contributed', label, valueInUSD);
  }
}

export default Web3Analytics;
