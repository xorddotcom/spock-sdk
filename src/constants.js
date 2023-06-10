/**
 *  production server endpoint for storing analytics data
 */
export const SERVER_ENDPOINT = 'https://ingest.spockanalytics.xyz';

/**
 *  testing server endpoint for storing analytics data
 */
export const TEST_SERVER_ENDPOINT = 'https://ingest-dev.spockanalytics.xyz';

/**
 *  alias to make storage keys unqiue
 */
const ALIAS = 'spock';

/**
 *  Attach alias to the key of storage
 *  @param {String} key - storage key
 *  @returns {String} storage key with alias
 */
export const withAlias = (key) => `${ALIAS}_${key}`;

/**
 *  default values for sdk configuration
 */
export const DEFAULT_CONFIG = {
  DEBUG: false,
  GEOLOCATION: true,
  INACTIVITY_TIMEOUT: 30,
  OPT_OUT: false,
  TEST_ENV: false,
  TEST_MODE: false,
};

/**
 *console log enums
 *Error - this is a issues that needs attention right now.
 *Warning - this is something that is potentially a issue. Maybe a deprecated usage of something, maybe consent is enabled but consent is not given.
 *Info - All publicly exposed functions should log a call at this level to indicate that they were called. These calls should include the function name.
 *Debug - this should contain logs from the internal workings of the SDK and it's important calls. This should include things like the SDK configuration options, success or fail of the current network request, "request queue is full" and the oldest request get's dropped, etc.
 *Verbose - this should give a even deeper look into the SDK's inner working and should contain things that are more noisy and happen often.
 */
export const LOG = {
  ERROR: `[${withAlias('ERROR')}] `,
  WARNING: `[${withAlias('WARNING')}] `,
  INFO: `[${withAlias('INFO')}] `,
  DEBUG: `[${withAlias('DEBUG')}] `,
  VERBOSE: `[${withAlias('VERBOSE')}] `,
};

/**
 * supported wallet types
 */
export const WALLET_TYPE = {
  METAMASK: 'Metamask',
  WALLETCONNECT: 'WalletConnect',
  COINBASE: 'Coinbase',
  FORTMATIC: 'Fortmatic',
  PORTIS: 'Portis',
  OTHER: 'Other',
};

/**
 * custom DOM events
 * SEND_TXN - when txn is initialized by EIP1193 standard wallet that supports request method.
 * LEGACY_TXN_CALLBACK - when txn is initialized by legacy wallet that supports send or sendAsync method.
 * STORAGE_SET_ITEM - when something has added into storage (can be locl,session).
 * STORAGET_GET_ITEM - when something has retrived from storage (can be locl,session).
 * WALLET_CONNECTION - when user connected account or chain change.
 */
export const EVENTS = {
  SEND_TXN: withAlias('sendTxn'),
  LEGACY_TXN_CALLBACK: withAlias('legacyTxnCallback'),
  STORAGE_SET_ITEM: withAlias('storageSetItem'),
  STORAGET_GET_ITEM: withAlias('storageGetItem'),
  WALLET_CONNECTION: withAlias('walletConnection'),
};

/**
 * keys for storing data in cookies
 * DISTINCT_ID - user unqiue uuid.
 * SESSION - cache user session.
 * OPT_OUT - cache user opt_out tracking.
 */
const COOKIES = {
  DISTINCT_ID: withAlias('cache_distinctId'),
  SESSION: withAlias('session'),
  OPT_OUT: withAlias('opt_out'),
};

/**
 * keys for storing data combined into single obj
 */
export const STORAGE = {
  COOKIES,
};

/**
 * routes of server for logging analytics data
 * APP_VISIT - log when user landed on DApp.
 * EXPIRE_OLD_SESSION - expire session that is ended
 * OUTBOUND - log when user click on a link that redirect user out from the website.
 * PAGE_VIEW - log when user visit any page of DApp.
 * PAUSE_SESSION - pause session when user exit
 * REWIND_SESSION - rewind session when came back
 * SESSION - log when user session has ended or expired.
 * TRANSACTION - log user submit or reject transaction.
 * WALLET_CONNECTION - log user connect wallet on DApp.
 */
export const TRACKING_EVENTS = {
  APP_VISIT: 'app-visit',
  EXPIRE_OLD_SESSION: 'expire-old-session',
  OUTBOUND: 'outbound',
  PAGE_VIEW: 'page-view',
  PAUSE_SESSION: 'pause-session',
  REWIND_SESSION: 'rewind-session',
  SESSION: 'session',
  TRANSACTION: 'transaction',
  WALLET_CONNECTION: 'wallet-connect',
};

/**
 * constant for representing empty string
 */
export const EMPTY_STRING = '';

export const LIB_VERSION = '1.0.0';

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
