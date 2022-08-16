export const configrationDefaultValue = {
  INACTIVITY_TIMEOUT: 30,
};

export const logEnums = {
  ERROR: '[ERROR] ',
  WARNING: '[WARNING] ',
  INFO: '[INFO] ',
  DEBUG: '[DEBUG] ',
  VERBOSE: '[VERBOSE] ',
};

export const WALLET_TYPE = {
  METAMASK: 'Metamask',
  WALLETCONNECT: 'WalletConnect',
  COINBASE: 'Coinbase',
  FORTMATIC: 'Fortmaic',
  PORTIS: 'Portis',
  OTHER: 'Other',
};

const ALIAS = 'dz';

const withAlias = (label) => `${ALIAS}_${label}`;

export const ServerEndooint = 'http://dapp-server-test.dappzero.io';

export const EVENTS = {
  SEND_TXN: withAlias('sendTxn'),
  LEGACY_TXN_CALLBACK: withAlias('legacyTxnCallback'),
  STORAGE_SET_ITEM: withAlias('storageSetItem'),
  STORAGET_GET_ITEM: withAlias('storageGetItem'),
};

export const COOKIES = {
  CACHE_ADDRESS: withAlias('cacheAddress'),
  CACHE_CHAINID: withAlias('cacheChain'),
};

export const PROVIDER_TYPE = {
  EIP1193: 'eip1193',
  LEGACY: 'legacy',
};
