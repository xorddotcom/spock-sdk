import invariant from 'tiny-invariant';

import { LOG, WALLET_TYPE, EVENTS, TRACKING_EVENTS } from '../constants';
import BaseAnalytics from '../BaseAnalytics';
import { txnRejected } from './utils';
import { JSON_Formatter, normalizeChainId } from '../utils/formatting';
import { addEvent } from '../utils/helpers';
import { notUndefined, isSameAddress, isType } from '../utils/validators';

class WalletConnection extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.cacheTxnHash = undefined;
    this.walletProvider = this.walletProvider.bind(this);
    this.trackWalletConnection = this.trackWalletConnection.bind(this);
  }

  initialize() {
    this.walletConnectionEvents();
    this.transactionEvents();
  }

  /**
   *  Setup wallet event listeners
   */
  walletConnectionEvents() {
    if (notUndefined(window.ethereum) && window.ethereum.isMetaMask) {
      //incase when metamask is already coonected on load
      window.ethereum.on('connect', () => {
        setTimeout(() => {
          const chainId = window.ethereum.chainId;
          const account = window.ethereum.selectedAddress;
          this.logWalletConnectionFromEvents(WALLET_TYPE.METAMASK, account, chainId);
        }, 1000 * 5);
      });

      window.ethereum.on('accountsChanged', (account) => {
        const chainId = window.ethereum.chainId;
        this.logWalletConnectionFromEvents(WALLET_TYPE.METAMASK, account[0], chainId, true);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.log(LOG.INFO, 'chain changed', chainId);
      });
    }

    //listen localstorage activity for walletconnect and coinbase
    addEvent(window, EVENTS.STORAGE_SET_ITEM, this.handleWalletLSSetItem.bind(this));
    addEvent(window, EVENTS.STORAGET_GET_ITEM, this.handleWalletLSGetItem.bind(this));
  }

  /**
   *  Setup transaction event listeners
   */
  transactionEvents() {
    //eip1193 wallet txn listener
    addEvent(window, EVENTS.SEND_TXN, (payload) => {
      if (notUndefined(payload?.result)) {
        payload.result
          .then((txnHash) => {
            this.logTransaction('submitted', payload.params[0], txnHash);
          })
          .catch((e) => {
            if (txnRejected(e)) {
              this.logTransaction('rejected', payload.params[0]);
            }
          });
      }
    });

    //legacy wallet txn listener
    addEvent(window, EVENTS.LEGACY_TXN_CALLBACK, (payload) => {
      if (notUndefined(payload)) {
        if (payload.result && payload.params) {
          this.logTransaction('submitted', payload.params[0], payload.result);
        } else if (payload.error && txnRejected(payload.error)) {
          this.logTransaction('rejected', payload.params[0]);
        }
      }
    });
  }

  /**
   *  Log txn to the server
   *  @param {'rejected' | 'submitted'} status - transaction status
   *  @param {*} txnObj - transaction object
   *  @param {String | undefined} txnHash - hash of submitted transaction
   */
  logTransaction(status, txnObj, txnHash) {
    if (status === 'rejected') {
      const properties = { ...txnObj, status: 0 };
      this.trackEvent({ event: TRACKING_EVENTS.TRANSACTION, properties, logMessage: 'Transaction rejected' });
      this.dispatch({ txnReject: this.store.txnReject + 1 });
    } else if (status === 'submitted' && this.cacheTxnHash !== txnHash) {
      const properties = { ...txnObj, hash: txnHash, status: 1 };
      this.trackEvent({ event: TRACKING_EVENTS.TRANSACTION, properties, logMessage: 'Transaction submitted' });
      this.cacheTxnHash = txnHash;
      this.dispatch({ txnSubmit: this.store.txnSubmit + 1 });
    }
  }

  /**
   *  Customize user given provider
   *  @param {Web3Provider} provider - wallet provider
   *  @param {String} walletType - type of connected wallet
   */
  customizeProvider(provider, walletType) {
    const isFortmatic = walletType === WALLET_TYPE.FORTMATIC;

    //log only relevant eth method
    function allowLog(error, result, argMethod) {
      const methods = ['eth_sendRawTransaction', 'eth_sendTransaction'];

      if (error && notUndefined(error.code)) {
        return true;
      } else if (result && methods.includes(argMethod)) {
        return true;
      }
    }

    function attachEvent(originalMethod, isLegacy) {
      return function () {
        const rpcMethod = arguments[0]?.method ?? arguments[0];
        const rpcMethodParams = arguments[0]?.params ?? arguments[1];

        //add event in callback of send txn method for legacy provider
        if (isLegacy) {
          const originalCallback = arguments[1];
          if (originalCallback) {
            arguments[1] = function () {
              const error = isFortmatic ? arguments[0] : arguments[1]?.error;
              const result = arguments[1]?.result;
              const event = new Event(EVENTS.LEGACY_TXN_CALLBACK);
              event.error = error;
              event.result = result;
              event.params = rpcMethodParams;
              allowLog(error, result, rpcMethod) && window.dispatchEvent(event);
              originalCallback.apply(this, arguments);
            };
          }
        }

        const result = originalMethod.apply(this, arguments);

        if (rpcMethod === 'eth_sendTransaction') {
          const event = new Event(EVENTS.SEND_TXN);
          event.params = rpcMethodParams;
          event.result = result;
          window.dispatchEvent(event);
        }
        return result;
      };
    }

    //for eip1193 providers
    if (notUndefined(provider.request)) {
      const originalReqMethod = provider.request;
      provider.request = attachEvent(originalReqMethod);
      provider.attachEventRequest = true;
    } else if (notUndefined(provider.sendAsync)) {
      const originalSendAsyncMethod = provider.sendAsync;
      provider.sendAsync = attachEvent(originalSendAsyncMethod, true);
      provider.attachEventSendAsync = true;
    } else if (notUndefined(provider.send)) {
      const originalSendMethod = provider.send;
      provider.send = attachEvent(originalSendMethod);
      provider.attachEventSend = true;
    }
  }

  /**
   *  Find wallet type from provider
   *  @param {Web3Provider} provider - wallet provider
   *  @returns {String} type of connected wallet
   */
  getWalletTypeFromProvider(provider) {
    //in-case metamask and coinbase both are connected
    if (provider.overrideIsMetaMask) {
      if (provider.selectedProvider) {
        return provider.selectedProvider.isMetaMask ? WALLET_TYPE.METAMASK : WALLET_TYPE.COINBASE;
      }
    }

    if (provider.isMetaMask || provider.connection?.url === 'metamask') return WALLET_TYPE.METAMASK;
    else if (provider.isWalletConnect) return WALLET_TYPE.WALLETCONNECT;
    else if (provider.isCoinbaseWallet) return WALLET_TYPE.COINBASE;
    else if (provider.isFortmatic) return WALLET_TYPE.FORTMATIC;
    else if (provider.isPortis) return WALLET_TYPE.PORTIS;
    else return WALLET_TYPE.OTHER;
  }

  /**
   *  Get provider from user
   *  @param {Web3Provider} provider - wallet provider
   */
  walletProvider(provider) {
    invariant(notUndefined(provider), 'Provider cannot be undefined');
    const walletType = this.getWalletTypeFromProvider(provider);
    if (!this.isSameProvider(provider)) {
      this.customizeProvider(provider, walletType);
    }
    this.dispatch({ provider });
    if (notUndefined(provider.request)) {
      this.eip1193StandardMethods(provider, walletType);
    } else if (notUndefined(provider.send)) {
      this.legacyMethods(provider, walletType);
    }
  }

  /**
   *  Check event already attached in provider or not
   *  @param {Web3Provider} provider - wallet provider
   */
  isSameProvider(provider) {
    if (provider.request && provider.attachEventRequest) return true;
    else if (provider.sendAsync && provider.attachEventSendAsync) return true;
    else if (provider.send && provider.attachEventSend) return true;
    else return false;
  }

  /**
   *  Get account and chain fron legacy wallet providers
   *  @param {Web3Provider} provider - wallet provider
   */
  legacyMethods(provider, walletType) {
    Promise.all([provider.send('eth_accounts'), provider.send('eth_chainId')])
      .then(([accounts, chainId]) => {
        if (notUndefined(accounts) && notUndefined(chainId)) {
          this.trackWalletConnection(walletType, accounts[0], chainId);
        }
      })
      .catch((e) => {
        this.log(LOG.ERROR, 'Failed to extract wallet connection detail from provider', e);
      });
  }

  /**
   *  Get account and chain fron eip1193 wallet providers
   *  @param {Web3Provider} provider - wallet provider
   */
  eip1193StandardMethods(provider, walletType) {
    Promise.all([provider.request({ method: 'eth_accounts' }), provider.request({ method: 'eth_chainId' })])
      .then(([accounts, chainId]) => {
        if (notUndefined(accounts) && notUndefined(chainId)) {
          this.trackWalletConnection(walletType, accounts[0], chainId);
        }
      })
      .catch((e) => {
        this.log(LOG.ERROR, 'Failed to extract wallet connection detail from provider', e);
      });
  }

  /**
   *  Handle wallet connect and coinbase wallet status by local storage
   *  @param {String} key - stored data key
   *  @param {*} value - stored data
   */
  lsWalletHandler(key, value) {
    if (key === 'walletconnect') {
      const account = value.accounts ? value.accounts[0] : undefined;
      this.logWalletConnectionFromEvents(WALLET_TYPE.WALLETCONNECT, account, value.chainId);
    } else if (key.includes('walletlink')) {
      if (key.includes('DefaultChainId')) {
        this.store.connectedChain = value;
      } else if (key.includes('Addresses')) {
        this.logWalletConnectionFromEvents(WALLET_TYPE.COINBASE, value, this.store.connectedChain);
      }
    }
  }

  /**
   *  Local storage set item event listener
   *  @param {*} event
   */
  handleWalletLSSetItem(event) {
    const parsedValue = JSON_Formatter.parse(event.value);
    parsedValue && this.lsWalletHandler(event.key, parsedValue);
  }

  /**
   *  Local storage get item event listener
   *  @param {*} event
   */
  handleWalletLSGetItem(event) {
    const value = localStorage.getItem(event.key, 'noLog');
    const parsedValue = JSON_Formatter.parse(value);
    parsedValue && this.lsWalletHandler(event.key, parsedValue);
  }

  /**
   *  Log wallet connection data on server fired from events
   *  @param {String} walletType - type of connected wallet
   *  @param {String | undefined} account - user coonected wallet address
   *  @param {String | number | undefined} chainId - user connected network
   *  @param {boolean | undefined} overrideRule - override provider existance rule of storing data
   */
  logWalletConnectionFromEvents(walletType, account, chainId, overrideRule) {
    if (this.store.provider && !overrideRule) {
      return;
      //to avoid exception while using trackWalletConnection internally
    } else if (account && (chainId || this.connectedChain)) {
      this.trackWalletConnection(walletType, account, chainId);
    }
  }

  /**
   *  Fire an event on new wallet connected and chain changed
   *  @param {String | undefined} account - user coonected wallet address
   *  @param {String | undefined} chainId - user connected network
   */
  fireWalletConnectionEvent(account, chainId) {
    if (notUndefined(account) && notUndefined(chainId)) {
      const event = new Event(EVENTS.WALLET_CONNECTION);
      event.account = account;
      event.chainId = chainId;
      window.dispatchEvent(event);
    }
  }

  /**
   *  Log wallet connection data on server fired from events
   *  @param {String} walletType - type of connected wallet
   *  @param {String} account - user coonected wallet address
   *  @param {String} chainId - user connected network
   */
  trackWalletConnection(walletType, account, chainId) {
    //throw exception in-case trackWalletConnection is used with invalid parameters bu end-user
    invariant(isType(walletType, 'string') && isType(account, 'string'), 'Invalid arguments');

    const chain = isType(chainId, 'string') ? normalizeChainId(chainId) : chainId ? chainId : this.connectedChain;

    invariant(notUndefined(chain), 'Invalid chainId');

    // not log already logged conectedWallet with same network
    if (!isSameAddress(this.store.connectedAccount, account) || chain !== this.store.connectedChain) {
      this.fireWalletConnectionEvent(this.store.connectedAccount, this.store.connectedChain);

      this.dispatch({ connectedAccount: account, connectedChain: chain });

      const properties = { walletType, walletAddress: account };

      this.trackEvent({ event: TRACKING_EVENTS.WALLET_CONNECTION, properties, logMessage: 'Wallet connect' });
    }
  }
}

export default WalletConnection;
