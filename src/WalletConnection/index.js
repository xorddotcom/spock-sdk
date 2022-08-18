import invariant from 'tiny-invariant';

import BaseAnalytics from '../BaseAnalytics';
import { logEnums, WALLET_TYPE, EVENTS } from '../constants';
import { txnRejected } from './utils';
import { addEvent } from '../utils/helpers';
import { notUndefined, isSameAddress } from '../utils/validators';
import { normalizeChainId } from '../utils/formatting';

class WalletConnection extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.walletProvider = this.walletProvider.bind(this);
  }

  initialize() {
    this.walletConnectionEvents();
    this.transactionEvents();
  }

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
        this.logWalletConnectionFromEvents(WALLET_TYPE.METAMASK, account[0], chainId);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.log(logEnums.INFO, 'chain changed', chainId);
      });
    }

    //listen localstorage activity for walletconnect and coinbase
    addEvent(window, EVENTS.STORAGE_SET_ITEM, (event) => this.handleWalletLSSetItem.bind(this)(event));
    addEvent(window, EVENTS.STORAGET_GET_ITEM, (event) => this.handleWalletLSGetItem.bind(this)(event));
  }

  transactionEvents() {
    addEvent(window, EVENTS.SEND_TXN, (payload) => {
      console.log('payload eip1193 => ', payload);
      if (notUndefined(payload?.result)) {
        payload.result
          .then((txnHas) => {
            this.log(logEnums.INFO, 'Transaction hash', txnHas);
          })
          .catch((e) => {
            if (txnRejected(e)) {
              this.log(logEnums.INFO, 'Transaction rejected', e);
            }
          });
      }
    });

    addEvent(window, EVENTS.LEGACY_TXN_CALLBACK, (payload) => {
      console.log('payload legacy => ', payload);
      if (notUndefined(payload)) {
        if (payload.result && payload.params) {
          this.log(logEnums.INFO, 'Transaction hash', payload.result);
        } else if (payload.error && txnRejected(payload.error)) {
          this.log(logEnums.INFO, 'Transaction rejected', payload.error);
        }
      }
    });
  }

  customizeProvider(proivder, walletType) {
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
        const arg = arguments[0];

        //console.log('arguments => ', arguments);

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
              event.params = arg?.params;
              allowLog(error, result, arg?.method) && window.dispatchEvent(event);
              originalCallback.apply(this, arguments);
            };
          }
        }

        const result = originalMethod.apply(this, arguments);

        if (arg?.method === 'eth_sendTransaction') {
          const event = new Event(EVENTS.SEND_TXN);
          event.params = arg?.params;
          event.result = result;
          window.dispatchEvent(event);
        }
        return result;
      };
    }

    //for eip1193 providers
    if (notUndefined(proivder.request)) {
      const originalReqMethod = proivder.request;
      proivder.request = attachEvent(originalReqMethod);
    } else if (notUndefined(proivder.sendAsync)) {
      const originalSendAsyncMethod = proivder.sendAsync;
      proivder.sendAsync = attachEvent(originalSendAsyncMethod, true);
    } else if (notUndefined(proivder.send)) {
      const originalSendMethod = proivder.send;
      proivder.send = attachEvent(originalSendMethod);
    }
  }

  getWalletTypeFromProvider(provider) {
    if (provider.isMetaMask && !provider.overrideIsMetaMask) return WALLET_TYPE.METAMASK;
    else if (provider.isWalletConnect) return WALLET_TYPE.WALLETCONNECT;
    else if (provider.isCoinbaseWallet || provider.overrideIsMetaMask) return WALLET_TYPE.COINBASE;
    else if (provider.isFortmatic) return WALLET_TYPE.FORTMATIC;
    else if (provider.isPortis) return WALLET_TYPE.PORTIS;
    else return WALLET_TYPE.OTHER;
  }

  walletProvider(provider) {
    invariant(notUndefined(provider), 'Provider cannot be undefined');
    this.dispatch({ provider });
    const walletType = this.getWalletTypeFromProvider(provider);
    this.customizeProvider(provider, walletType);
    if (notUndefined(provider.request)) {
      this.eip1193StandardMethods(provider, walletType);
    } else if (notUndefined(provider.send)) {
      this.legacyMethods(provider, walletType);
    }
  }

  legacyMethods(provider, walletType) {
    Promise.all([provider.send('eth_accounts'), provider.send('eth_chainId')])
      .then(([accounts, chainId]) => {
        if (notUndefined(accounts) && notUndefined(chainId)) {
          this.logWalletConnection(walletType, accounts[0], chainId);
        }
      })
      .catch((e) => {
        this.log(logEnums.ERROR, 'Failed to extract wallet connection detail from provider', e);
      });
  }

  eip1193StandardMethods(provider, walletType) {
    Promise.all([provider.request({ method: 'eth_accounts' }), provider.request({ method: 'eth_chainId' })])
      .then(([accounts, chainId]) => {
        if (notUndefined(accounts) && notUndefined(chainId)) {
          this.logWalletConnection(walletType, accounts[0], chainId);
        }
      })
      .catch((e) => {
        this.log(logEnums.ERROR, 'Failed to extract wallet connection detail from provider', e);
      });
  }

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

  handleWalletLSSetItem(event) {
    if (notUndefined(event.value)) {
      this.lsWalletHandler(event.key, event.value);
    }
  }

  handleWalletLSGetItem(event) {
    const value = localStorage.getItem(event.key, 'noLog');
    let parsedValue;
    if (value) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }

      this.lsWalletHandler(event.key, parsedValue);
    }
  }

  logWalletConnectionFromEvents(walletName, account, chainId) {
    if (this.store.provider) {
      return;
    } else {
      this.logWalletConnection(walletName, account, chainId);
    }
  }

  logWalletConnection(walletName, account, chainId) {
    if (typeof walletName === 'string' && typeof account === 'string') {
      const chain = typeof chainId === 'string' ? normalizeChainId(chainId) : chainId ? chainId : this.connectedChain;
      if (!isSameAddress(this.store.connectedWallet, account) || chain !== this.store.connectedChain) {
        this.dispatch({ connectedAccount: account, connectedChain: chain });
        const userInfo = this.store.userInfo;
        const data = { walletName, account, chain, userInfo };
        this.log(logEnums.INFO, 'wallet connected', JSON.stringify(data));
      }
    }
  }
}

export default WalletConnection;
