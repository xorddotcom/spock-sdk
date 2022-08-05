import { logEnums } from './constants';
import { log } from './utils';
import Web3AnalyticsClass from './core';

function overrideLocalStorageSetItem(log) {
  if (typeof localStorage !== 'undefined') {
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function (key, value) {
      const event = new Event('w3a_lsItemInserted');

      event.key = key;
      event.value = value;

      window.dispatchEvent(event);

      originalSetItem.apply(this, arguments);
    };
  } else {
    log(logEnums.ERROR, 'Localstorage not found');
  }
}

function onloadConfig(config) {
  overrideLocalStorageSetItem(config.logging);
}

const Web3Analytics = {};

Web3Analytics.init = function (config) {
  if (typeof window === 'undefined') return;

  const userConfig = config || {};

  const configration = {
    ...userConfig,
    logging: (level, message) => log(userConfig.debug, level, message),
  };

  onloadConfig(configration);

  const web3AnalyticsInstance = new Web3AnalyticsClass(configration);
  web3AnalyticsInstance.initializeEvents();

  // Web3Analytics.core = web3AnalyticsInstance;
};

export default Web3Analytics;
