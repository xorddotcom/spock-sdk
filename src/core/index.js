import invariant from 'tiny-invariant';

import BaseAnalytics from '../BaseAnalytics';
import WalletConnection from '../WalletConnection';
import UserInfo from '../UserInfo';
import Tracking from '../Tracking';
import { logEnums } from '../constants';
import { isType, notUndefined } from '../utils/validators';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.userInfo = new UserInfo(config);
    this.wallet = new WalletConnection(config);
    this.tracking = new Tracking(config);
    this.valueContribution = this.valueContribution.bind(this);
  }

  initialize() {
    this.log(logEnums.INFO, 'Web3 Analytics initialized');
    this.userInfo.getUserInfo();
    this.wallet.initialize();
    this.tracking.initialize();
  }

  valueContribution(label, valueInUSD) {
    invariant(isType(label, 'string') && isType(valueInUSD, 'number'), 'Invalid arguments');
    if (notUndefined(this.store.connectedAccount) && notUndefined(this.store.connectedChain)) {
      this.log(logEnums.INFO, 'Value Contributed', { label, valueInUSD });
      const data = { label, valueInUSD, address: this.store.connectedAccount, chainId: this.store.connectedChain };
      this.request.post('value-contribution/create', { data });
    } else {
      this.log(logEnums.ERROR, 'Wallet or chain connot undefined');
    }
  }
}

export default Web3Analytics;
