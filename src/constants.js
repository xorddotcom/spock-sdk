export const SERVER_ENDPOINT = 'https://dapp-server.thespock.xyz';
export const TEST_SERVER_ENDPOINT = 'https://dapp-server-test.thespock.xyz';

const ALIAS = 'w3a';

export const withAlias = (label) => `${ALIAS}_${label}`;

export const configrationDefaultValue = {
  DEBUG: false,
  INACTIVITY_TIMEOUT: 30,
  TEST_MODE: false,
  TEST_ENV: false,
};

export const logEnums = {
  ERROR: `[${withAlias('ERROR')}] `,
  WARNING: `[${withAlias('WARNING')}] `,
  INFO: `[${withAlias('INFO')}] `,
  DEBUG: `[${withAlias('DEBUG')}] `,
  VERBOSE: `[${withAlias('VERBOSE')}] `,
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
  CACHE_CHAIN: withAlias('cache_chain'),
  CACHE_DEVICE_ID: withAlias('cache_deviceId'),
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

export const EMPTY_STRING = '';

export const SERVER_ROUTES = {
  APP_VISIT: 'app-visits/create',
  OUTBOUND: 'outbound-links/create',
  PAGE_VIEW: 'page-views/create',
  SESSION: 'session/create-session',
  TRANSACTION: 'transactions/create',
  VALUE_CONTRIBUTION: 'value-contribution/create',
  WALLET_CONNECTION: 'wallet-connection/create',
};
