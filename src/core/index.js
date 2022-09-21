import invariant from 'tiny-invariant';

import BaseAnalytics from '../BaseAnalytics';
import WalletConnection from '../WalletConnection';
import UserInfo from '../UserInfo';
import Tracking from '../Tracking';
import { SERVER_ROUTES, LOG } from '../constants';
import { isType, notUndefined } from '../utils/validators';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.userInfo = new UserInfo(config);
    this.wallet = new WalletConnection(config);
    this.tracking = new Tracking(config);
    this.valueContribution = this.valueContribution.bind(this);
    this.valueExtraction = this.valueExtraction.bind(this);
  }

  initialize() {
    this.log(LOG.INFO, 'Web3 Analytics initialized');
    this.userInfo.getUserInfo();
    this.wallet.initialize();
    this.tracking.initialize();
  }

  protocolValue(label, valueInUSD, extraction) {
    invariant(isType(label, 'string') && isType(valueInUSD, 'number'), 'Invalid arguments');
    if (notUndefined(this.store.connectedAccount) && notUndefined(this.store.connectedChain)) {
      const data = {
        label,
        valueInUSD,
        extraction,
        address: this.store.connectedAccount,
        chainId: this.store.connectedChain,
      };
      this.log(LOG.INFO, 'Value Contributed', data);
      this.request.post(SERVER_ROUTES.VALUE_CONTRIBUTION, { data });
    } else {
      this.log(LOG.ERROR, 'Wallet or chain connot undefined');
    }
  }

  valueContribution(label, valueInUSD) {
    this.protocolValue(label, valueInUSD, false);
  }

  valueExtraction(label, valueInUSD) {
    this.protocolValue(label, valueInUSD, true);
  }
}

export default Web3Analytics;
