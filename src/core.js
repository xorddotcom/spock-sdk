import { logEnums } from './constants';
import {
  addEvent,
  getStoredIdOrGenerateId,
  getCoordinates,
  getMetaData,
  getConfig,
  notUndefined,
  isSameAddress,
} from './utils';

class Web3Analytics {
  constructor(config) {
    this.self = this;
    this.debug = getConfig(config.debug, false);
    this.log = config.logging;
    this.connectedWallet = undefined;
    this.connectedChain = undefined;
  }

  initialize() {
    this.log(logEnums.INFO, 'Web3Analytics initialized');
    this.initializeEvents();
  }

  initializeEvents() {
    this.handleWalletConnection();
  }

  lsWalletHandler(key, value, self) {
    if (key === 'walletconnect') {
      const account = value.accounts ? value.accounts[0] : undefined;
      self.connectedChain = value.chainId;
      self.logWalletConnection('WalletConnect', account, self.connectedChain);
    } else if (key.includes('walletlink')) {
      if (key.includes('DefaultChainId')) {
        self.connectedChain = value;
      } else if (key.includes('Addresses')) {
        self.logWalletConnection('Coinbase', value, self.connectedChain);
      }
    }
  }

  handleWalletLSSetItem(event, self) {
    if (notUndefined(event.value)) {
      this.lsWalletHandler(event.key, event.value, self);
    }
  }

  handleWalletLSGetItem(event, self) {
    const value = localStorage.getItem(event.key, 'noLog');
    let parsedValue;
    if (value) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }

      this.lsWalletHandler(event.key, parsedValue, self);
    }
  }

  handleWalletConnection() {
    if (notUndefined(window.ethereum)) {
      window.ethereum.on('accountsChanged', (account) => {
        console.log('account fire => ', account);
        this.logWalletConnection('Metamask', account[0], this.connectedChain);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.connectedChain = chainId;
        this.log(logEnums.INFO, 'chain changed', chainId);
      });
    }

    addEvent(window, 'w3a_lsItemInserted', (event) => this.handleWalletLSSetItem(event, this.self));
    addEvent(window, 'w3a_lsItemRetrieve', (event) => this.handleWalletLSGetItem(event, this.self));
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

  logWalletConnection(walletName, account, chainId) {
    if (typeof walletName === 'string' && typeof account === 'string') {
      if (!isSameAddress(this.connectedWallet, account)) {
        this.connectedWallet = account;
        const data = { walletName, account, chainId };
        this.log(logEnums.INFO, 'wallet connected', JSON.stringify(data));
      }
    }
  }
}

export default Web3Analytics;
