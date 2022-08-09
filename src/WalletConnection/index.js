import BaseAnalytics from '../BaseAnalytics';
import { logEnums, WALLET_TYPE } from '../constants';
import { addEvent, notUndefined, isSameAddress, normalizeChainId } from '../utils';

class WalletConnection extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.walletProvider = this.walletProvider.bind(this);
  }

  initialize() {
    this.walletConnectionEvents();
  }

  walletConnectionEvents() {
    if (notUndefined(window.ethereum) && window.ethereum.isMetaMask) {
      //incase when metamask is already coonected on load
      window.ethereum.on('connect', () => {
        setTimeout(() => {
          const chainId = window.ethereum.chainId;
          const account = window.ethereum.selectedAddress;
          this.logWalletConnection(WALLET_TYPE.METAMASK, account, chainId);
        }, 1000 * 5);
      });

      window.ethereum.on('accountsChanged', (account) => {
        const chainId = window.ethereum.chainId;
        this.logWalletConnection(WALLET_TYPE.METAMASK, account[0], chainId);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.log(logEnums.INFO, 'chain changed', chainId);
      });
    }

    addEvent(window, 'w3a_lsItemInserted', (event) => this.handleWalletLSSetItem.bind(this)(event));
    addEvent(window, 'w3a_lsItemRetrieve', (event) => this.handleWalletLSGetItem.bind(this)(event));
  }

  getWalletTypeFromProvider(provider) {
    if (provider.isMetaMask) return WALLET_TYPE.METAMASK;
    else if (provider.isWalletconnect) return WALLET_TYPE.WALLETCONNECT;
    else if (provider.isCoinbaseWallet) return WALLET_TYPE.COINBASE;
    else if (provider.isFortmatic) return WALLET_TYPE.FORTMATIC;
    else if (provider.isPortis) return WALLET_TYPE.PORTIS;
    else return WALLET_TYPE.OTHER;
  }

  walletProvider(provider) {
    if (notUndefined(provider)) {
      this.dispatch({ provider });
      const walletType = this.getWalletTypeFromProvider(provider);
      if (notUndefined(provider.request)) {
        this.eip1193StandardMethods(provider, walletType);
      } else if (notUndefined(provider.send)) {
        this.legacyMethods(provider, walletType);
      }
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
      this.logWalletConnection(WALLET_TYPE.WALLETCONNECT, account, value.chainId);
    } else if (key.includes('walletlink')) {
      if (key.includes('DefaultChainId')) {
        this.store.connectedChain = value;
      } else if (key.includes('Addresses')) {
        this.logWalletConnection(WALLET_TYPE.COINBASE, value, this.store.connectedChain);
      }
    }
  }

  handleWalletLSSetItem(event) {
    console.log('setEvent => ', event);
    if (notUndefined(event.value)) {
      this.lsWalletHandler(event.key, event.value);
    }
  }

  handleWalletLSGetItem(event) {
    console.log('getEvent => ', event);
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

  logWalletConnection(walletName, account, chainId) {
    if (typeof walletName === 'string' && typeof account === 'string') {
      const chain = typeof chainId === 'string' ? normalizeChainId(chainId) : chainId ? chainId : this.connectedChain;
      if (!isSameAddress(this.store.connectedWallet, account) || chain !== this.store.connectedChain) {
        this.dispatch({ connectedAccount: account, connectedChain: chain });
        const data = { walletName, account, chain };
        this.log(logEnums.INFO, 'wallet connected', JSON.stringify(data));
      }
    }
  }
}

export default WalletConnection;
