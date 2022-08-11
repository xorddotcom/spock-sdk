import BaseAnalytics from './BaseAnalytics';
import WalletConnection from './WalletConnection';
import Tracking from './Tracking';
import { logEnums } from './constants';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.wallet = new WalletConnection(config);
    this.tracking = new Tracking(config);
  }

  initialize() {
    this.log(logEnums.INFO, 'Web3 Analytics initialized');
    this.wallet.initialize();
    this.tracking.initialize();
  }

  valueContribution(label, valueInUSD) {
    if (typeof label !== 'string') {
      this.log(logEnums.ERROR, 'Invalid arugument label cannot be type', typeof label);
    } else if (typeof valueInUSD !== 'number') {
      this.log(logEnums.ERROR, 'Invalid arugument valueInUSD cannot be type', typeof label);
    } else {
      this.log(logEnums.INFO, 'Value Contributed', label, valueInUSD);
    }
  }
}

export default Web3Analytics;
