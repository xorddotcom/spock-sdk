import AnalyticsStorage from '../AnalyticsStorage';
import { DEFAULT_CONFIG, LOG, TRACKING_EVENTS, STORAGE, UTM_KEYS, DATA_POINTS, withAlias } from '../constants';
import { cheapGuid, getQueryParams, parseFlowProperties, transformUTMKey } from './utils';
import { setCookie } from '../utils/cookies';
import { JSON_Formatter } from '../utils/formatting';
import { getConfig } from '../utils/helpers';
import { log } from '../utils/logs';
import Request from '../utils/request';

import WidgetController from '../Widget';

/**
 * @typedef Config
 * @type {object}
 * @property {String} appKey - application unique key
 * @property {string[]} dataPoints - data that is allowed to track
 * @property {boolean} debug - sdk in debug mode
 * @property {number} inactivityTimeout - timeout for inactive session
 * @property {boolean} optOut - opt all users out from tracking on init
 * @property {boolean} testENV - sdk in test environment
 * @property {boolean} testMode - sdk in test mode
 */

/**
 * Base class for analytics configuration
 */
class BaseAnalytics {
  /**
   * Base class constructor
   * @param {Config} config - SDK configuration.
   */
  constructor(config) {
    this.appKey = config.appKey;
    this.dataPoints = getConfig(config.dataPoints, DEFAULT_CONFIG.DATA_POINTS)
      .concat('web3') //default datapoint
      .reduce((accum, dataPoint) => {
        accum[dataPoint] = true;
        return accum;
      }, {});
    this.debug = getConfig(config.debug, DEFAULT_CONFIG.DEBUG);
    this.defaultOptOut = getConfig(config.optOut, DEFAULT_CONFIG.OPT_OUT);
    this.inActivityTimeout = getConfig(config.inactivityTimeout, DEFAULT_CONFIG.INACTIVITY_TIMEOUT);
    this.testENV = getConfig(config.testENV, DEFAULT_CONFIG.TEST_ENV);
    this.testMode = getConfig(config.testMode, DEFAULT_CONFIG.TEST_MODE);

    this.store = AnalyticsStorage.store;
    this.dispatch = AnalyticsStorage.dispatch;
    this.log = (message, ...extraArguments) => log(this.debug && !this.store.optOut, message, ...extraArguments);
    this.request = new Request({
      appKey: this.appKey,
      log: this.log,
      testMode: this.testMode,
      testENV: this.testENV,
      store: this.store,
    });

    this.widgetController = WidgetController;
  }

  /**
   *  store cookies with user consent
   *  @param {string} cName - cookie name
   *  @param {string} cValue - cookie value
   *  @param {number} expiry - cookie expiry
   */
  setConsetCookie(cName, cValue, expiry) {
    !this.store.optOut && setCookie(cName, cValue, expiry);
  }

  /**
   *  send event to the server with metadata
   */
  trackEvent({ event, properties, logMessage, sendBeacon, allowTrack }) {
    const utmParams = UTM_KEYS.reduce((accum, key) => {
      const param = getQueryParams(document.URL, key);
      if (param) {
        accum[transformUTMKey(key)] = param;
      }
      return accum;
    }, {});

    const browserProfile = { ...this.store.userInfo, currentUrl: window.location.href };

    const web2 = { ...browserProfile, ...utmParams };

    const data = {
      ...(this.dataPoints[DATA_POINTS.WEB2] ? web2 : {}),
      ip: this.dataPoints[DATA_POINTS.DEMOGRAPHICS] ? this.store.ip : undefined,
      chain: this.store.connectedChain,
      distinctId: this.store.distinctId,
      insertId: cheapGuid(),
      sessionId: this.store.sessionId,
      time: Date.now() / 1000,
      walletAddress: this.store.connectedAccount,
      dataPoints: Object.keys(this.dataPoints).sort(),
      ...(properties ?? {}),
    };

    // store complete data in a cookie so if pause-load req aboarded due to unload the data will be there in cookie
    // and when user cameback the session record will be created
    if (event === TRACKING_EVENTS.PAUSE_SESSION) {
      this.setConsetCookie(
        STORAGE.COOKIES.SESSION,
        JSON_Formatter.stringify({ ...data, ip: this.store.ip }),
        7 * 24 * 60 * 60 * 1000
      );
    }

    //not to add these events in session flow
    if (![TRACKING_EVENTS.SESSION, TRACKING_EVENTS.PAUSE_SESSION].includes(event)) {
      this.dispatch({
        flow: [...this.store.flow, { event, properties: parseFlowProperties(event, properties) }],
      });
    }

    //is the tracking of particular event is allowed
    if (allowTrack) {
      //move event to the queue until SDK init is complete
      if (this.store.initialized) {
        this.request.post(`track/${event}`, { data, sendBeacon });
      } else {
        this.dispatch({ trackingQueue: [...this.store.trackingQueue, { event, data }] });
      }
    }

    if (this.dataPoints[DATA_POINTS.ENGAGE]) {
      const { ip, flow, optOut, initialized, txnReject, txnSubmit, sessionDuration } = this.store;
      this.widgetController.postMessage(withAlias(event.replace(/-/g, '_')), {
        ...data,
        ...web2, //in-case web2 is exlude in analytics datapoint
        store: {
          duration: typeof sessionDuration === 'function' ? sessionDuration() : 0,
          flow,
          initialized,
          ip,
          optOut,
          txnReject,
          txnSubmit,
        },
        browserProps: {
          innerWidth: window.innerWidth,
        },
      });
    }

    logMessage && this.log(LOG.INFO, logMessage, data);
  }

  /**
   *  send all the queued events
   */
  processQueue() {
    this.store.trackingQueue.forEach(({ event, data }) => {
      this.request.post(`track/${event}`, { data });
    });
    this.dispatch({ trackingQueue: [] });
  }
}

export default BaseAnalytics;
