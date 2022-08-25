import invariant from 'tiny-invariant';

import BaseAnalytics from '../BaseAnalytics';
import { logEnums, WALLET_TYPE, EVENTS, STORAGE } from '../constants';
import { txnRejected } from './utils';
import { addEvent } from '../utils/helpers';
import { notUndefined, isSameAddress, isType } from '../utils/validators';
import { normalizeChainId } from '../utils/formatting';
import { getCookie, setCookie } from '../utils/cookies';

class WalletConnection extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.cacheTxnHash = undefined;
    this.walletProvider = this.walletProvider.bind(this);
    this.logWalletConnection = this.logWalletConnection.bind(this);
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
        this.logWalletConnectionFromEvents(WALLET_TYPE.METAMASK, account[0], chainId, true);
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
      this.log(logEnums.INFO, 'payload eip1193 => ', payload);
      if (notUndefined(payload?.result)) {
        payload.result
          .then((txnHash) => {
            this.logTransaction('submitted', payload.params, txnHash);
          })
          .catch((e) => {
            if (txnRejected(e)) {
              this.logTransaction('rejected', payload.params);
            }
          });
      }
    });

    addEvent(window, EVENTS.LEGACY_TXN_CALLBACK, (payload) => {
      this.log(logEnums.INFO, 'payload legacy => ', payload);
      if (notUndefined(payload)) {
        if (payload.result && payload.params) {
          this.logTransaction('submitted', payload.params, payload.result);
        } else if (payload.error && txnRejected(payload.error)) {
          this.logTransaction('rejected', payload.params);
        }
      }
    });
  }

  logTransaction(status, txnObj, txnHash) {
    const address = this.store.connectedAccount;
    if (status === 'rejected') {
      const data = { address, txnObj };
      //this.request.post('/rejectTransaction', { data });
      //not to set rejectTxn if session already have doneTxn
      if (this.store.doneTxn !== true) {
        this.dispatch({ rejectTxn: true });
      }
      this.log(logEnums.INFO, 'Transaction rejected', data);
    } else if (status === 'submitted' && this.cacheTxnHash !== txnHash) {
      const data = { address, txnObj, txnHash };
      // this.request.post('/submitTransaction', {
      //   data,
      //   callback: () => {
      //     this.cacheTxnHash = txnHash;
      //   },
      // });
      this.cacheTxnHash = txnHash;
      const pageNavigation = this.store.pageNavigation;
      const page = this.store.pageNavigation.find(({ page }) => page === window.location.pathname);
      const index = pageNavigation.indexOf(page);
      if (index >= 0) {
        pageNavigation[index] = { ...page, doneTxn: true };
        this.dispatch({ pageNavigation });
      }
      this.dispatch({ doneTxn: true, rejectTxn: false });
      this.log(logEnums.INFO, 'Transaction hash', data);
    }
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

  logWalletConnectionFromEvents(walletType, account, chainId, overrideRule) {
    if (this.store.provider && !overrideRule) {
      return;
    } else {
      this.logWalletConnection(walletType, account, chainId);
    }
  }

  logWalletConnection(walletType, account, chainId) {
    invariant(isType(walletType, 'string') && isType(account, 'string'), 'Invalid arguments');

    const chain = isType(chainId, 'string') ? normalizeChainId(chainId) : chainId ? chainId : this.connectedChain;

    invariant(notUndefined(chain), 'Invalid chainId');

    // not log already logged conectedWallet with same network
    if (!isSameAddress(this.store.connectedAccount, account) || chain !== this.store.connectedChain) {
      this.dispatch({ connectedAccount: account, connectedChain: chain });

      const userInfo = this.store.userInfo;
      const { device, system, OS, language } = userInfo ? userInfo : {};
      const data = { walletType, address: account, chainId: chain, device, system, OS, language };

      this.log(logEnums.INFO, 'wallet connected', JSON.stringify(data));

      const cacheAddress = getCookie(STORAGE.COOKIES.CACHE_ADDRESS);
      const cacheChain = getCookie(STORAGE.COOKIES.CACHE_CHAIN);

      // return in-case same wallet with same network is already logged on server
      if (!isSameAddress(cacheAddress, account) || Number(cacheChain) !== chain) {
        this.request.post('wallet-connection/create', {
          data,
          withIp: true,
          callback: () => {
            //cache for current date
            setCookie(STORAGE.COOKIES.CACHE_ADDRESS, account);
            setCookie(STORAGE.COOKIES.CACHE_CHAIN, chain);
          },
        });
      }
    }
  }
}

export default WalletConnection;
