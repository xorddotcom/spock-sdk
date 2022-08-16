export const SERVER_ENDPOINT = 'http://dapp-server-test.dappzero.io';

const ALIAS = 'dz';

const withAlias = (label) => `${ALIAS}_${label}`;

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

export const EVENTS = {
  SEND_TXN: withAlias('sendTxn'),
  LEGACY_TXN_CALLBACK: withAlias('legacyTxnCallback'),
  STORAGE_SET_ITEM: withAlias('storageSetItem'),
  STORAGET_GET_ITEM: withAlias('storageGetItem'),
};

const COOKIES = {
  CACHE_ADDRESS: withAlias('cache_address'),
  CACHE_CHAINID: withAlias('cache_chain'),
};

const LOCAL_STORAGE = {
  DEVICE_ID: withAlias('device_Id'),
};

const SESSION_STORAGE = {
  SESSION_STARTED: withAlias('session_started'),
};

export const STORAGE = {
  COOKIES,
  LOCAL_STORAGE,
  SESSION_STORAGE,
};
