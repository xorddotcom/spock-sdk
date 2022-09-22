import invariant from 'tiny-invariant';

import BaseAnalytics from '../BaseAnalytics';
import { LOG, WALLET_TYPE, EVENTS, STORAGE, SERVER_ROUTES } from '../constants';
import { txnRejected } from './utils';
import { addEvent } from '../utils/helpers';
import { notUndefined, isSameAddress, isType } from '../utils/validators';
import { JSON_Formatter, normalizeChainId } from '../utils/formatting';
import { getCookie, setCookie } from '../utils/cookies';

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
    const chainId = this.store.connectedChain;
    if (status === 'rejected') {
      const userInfo = this.store.userInfo;
      const { device, system, OS, language } = userInfo ? userInfo : {};
      const data = { ...txnObj, chainId, device, system, OS, language };
      this.request.post(SERVER_ROUTES.TRANSACTION, { data, withIp: true });
      //not to set rejectTxn if session already have doneTxn
      if (this.store.doneTxn !== true) {
        this.dispatch({ rejectTxn: true });
      }
      this.log(LOG.INFO, 'Transaction rejected', data);
    } else if (status === 'submitted' && this.cacheTxnHash !== txnHash) {
      const userInfo = this.store.userInfo;
      const { device, system, OS, language } = userInfo ? userInfo : {};
      const data = { ...txnObj, txHash: txnHash, chainId, device, system, OS, language };
      this.request.post(SERVER_ROUTES.TRANSACTION, {
        data,
        withIp: true,
        callback: () => {
          this.cacheTxnHash = txnHash;
        },
      });
      this.cacheTxnHash = txnHash;
      const pageNavigation = this.store.pageNavigation;
      const page = this.store.pageNavigation.find(({ page }) => page === window.location.pathname);
      const index = pageNavigation.indexOf(page);
      if (index >= 0) {
        pageNavigation[index] = { ...page, doneTxn: true };
        this.dispatch({ pageNavigation });
      }
      this.dispatch({ doneTxn: true, rejectTxn: false });
      this.log(LOG.INFO, 'Transaction hash', data);
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
    if (notUndefined(provider.request)) {
      const originalReqMethod = provider.request;
      provider.request = attachEvent(originalReqMethod);
    } else if (notUndefined(provider.sendAsync)) {
      const originalSendAsyncMethod = provider.sendAsync;
      provider.sendAsync = attachEvent(originalSendAsyncMethod, true);
    } else if (notUndefined(provider.send)) {
      const originalSendMethod = provider.send;
      provider.send = attachEvent(originalSendMethod);
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

    if (provider.isMetaMask) return WALLET_TYPE.METAMASK;
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
   *  Check the newly connected provider is same previous one or not
   *  @param {Web3Provider} provider - wallet provider
   */
  isSameProvider(provider) {
    const storedProvider = this.store.provider;
    if (!storedProvider) {
      return false;
    }

    if (provider.request && storedProvider.request) {
      return provider.request.toString().includes('SEND_TXN');
    } else if (provider.send && storedProvider.send) {
      return provider.send.toString().includes('SEND_TXN');
    } else if (provider.sendAsync && storedProvider.sendAsync) {
      return provider.sendAsync.toString().includes('SEND_TXN');
    } else {
      return false;
    }
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
      this.dispatch({ connectedAccount: account, connectedChain: chain });

      const userInfo = this.store.userInfo;
      const { device, system, OS, language } = userInfo ? userInfo : {};
      const data = { walletType, address: account, chainId: chain, device, system, OS, language };

      this.log(LOG.INFO, 'wallet connected', JSON.stringify(data));

      const cacheAddress = getCookie(STORAGE.COOKIES.CACHE_ADDRESS);
      const cacheChain = getCookie(STORAGE.COOKIES.CACHE_CHAIN);

      // return in-case same wallet with same network is already logged on server
      if (!isSameAddress(cacheAddress, account) || Number(cacheChain) !== chain) {
        this.request.post(SERVER_ROUTES.WALLET_CONNECTION, {
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
