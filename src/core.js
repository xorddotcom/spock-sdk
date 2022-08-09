import BaseAnalytics from './BaseAnalytics';
import WalletConnection from './WalletConnection';
import { logEnums } from './constants';
import { addEvent, getStoredIdOrGenerateId, getCoordinates, getMetaData } from './utils';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    this.debug = config.debug ?? false;
    this.log = config.logging;
    this.connectedWallet = undefined;
    this.connectedChain = undefined;
  }

  initialize() {
    this.wallet.initialize();
  }

  initializeEvents() {
    this.handleWalletConnection();
  }

  handleWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (account) => {
        this.connectedWallet = account;
        this.log(logEnums.INFO, 'accountsChanged event', account);
      });
    }

    addEvent(window, 'w3a_lsItemInserted', (res) => {
      this.log(logEnums.INFO, 'lsSetFired', res);
    });
  }
}

export default Web3Analytics;
