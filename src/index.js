import Web3AnalyticsClass from './core';

function overrideLocalStorage() {
  Storage.prototype._setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    const event = new Event('w3a_lsItemInserted');
    event.key = key;
    event.value = value;
    window.dispatchEvent(event);
    this._setItem(key, value);
  };

  Storage.prototype._getItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function (key) {
    const event = new Event('w3a_lsItemRetrieve');
    event.key = key;
    const noLog = arguments[1] === 'noLog';
    !noLog && window.dispatchEvent(event);
    return this._getItem(key);
  };
}

function onloadConfig() {
  overrideLocalStorage();
}

const Web3Analytics = {};

Web3Analytics.init = function (config) {
  if (typeof window === 'undefined') return;

  const userConfig = config || {};

  onloadConfig();

  const web3AnalyticsInstance = new Web3AnalyticsClass(userConfig);
  web3AnalyticsInstance.initialize();
  Web3Analytics.valueContribution = web3AnalyticsInstance.valueContribution;
  Web3Analytics.walletProvider = web3AnalyticsInstance.wallet.walletProvider;
  Web3Analytics.trackPageView = web3AnalyticsInstance.tracking.trackPageView;
};

export default Web3Analytics;
