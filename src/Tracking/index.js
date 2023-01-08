import BaseAnalytics from '../BaseAnalytics';
import { LOG, STORAGE, DEFAULT_CONFIG, EMPTY_STRING, SERVER_ROUTES, EVENTS } from '../constants';
import { generateUUID } from './utils';
import { addEvent, currentTimestamp, setGetValueInStorage, getConfig } from '../utils/helpers';
import { notUndefined } from '../utils/validators';
import { getCookie, setCookie } from '../utils/cookies';

class Tracking extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.inactivityTimeout = getConfig(config.inactivityTimeout, DEFAULT_CONFIG.INACTIVITY_TIMEOUT);
    this.reference = undefined; //document reference
    this.inactivityInterval = undefined; //inactivity interval for checking session inactivity
    this.sessionInactive = false; //is ongoing session is inactive
    this.sessionStartTime = 0; //session start time
    this.sessionHiddenTime = 0; //session inactive time
    this.sessionTotalInactivetime = 0; //total duration in which session was inactive
    this.pagesFlow = []; //all the pages open in one session
    this.doneSessionPreflightReq = false;

    this.trackPageView = this.trackPageView.bind(this);
  }

  initialize() {
    //preflight req for cors cache
    this.sessionPreflightReq();

    this.reference = this.documentReference(document.referrer);
    this.trackUser();
    this.trackSessions();
    this.trackOutboundLink();
  }

  sessionPreflightReq() {
    const data = {
      sessionDuration: 0,
      doneTxn: false,
      navigation: [],
      pagesFlow: [],
      rejectTxn: false,
      device: EMPTY_STRING,
      system: EMPTY_STRING,
      OS: EMPTY_STRING,
      language: EMPTY_STRING,
      userId: EMPTY_STRING,
      noLog: true,
    };

    this.request.post(SERVER_ROUTES.SESSION, {
      data,
      withIp: true,
    });
    this.doneSessionPreflightReq = true;
  }

  documentReference(reference) {
    if (notUndefined(document.referrer) && document.referrer !== '') {
      const pageHost = window.location.host;
      try {
        const referenceHost = new URL(reference).host;
        return referenceHost !== pageHost ? reference : undefined;
      } catch (error) {
        this.log(LOG.ERROR, 'documentReference', error);
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  trackUser() {
    let deviceId;
    const storedDeviceId = setGetValueInStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID);
    if (!storedDeviceId) {
      deviceId = generateUUID();
      setGetValueInStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID, deviceId);
    } else {
      deviceId = storedDeviceId;
    }

    this.dispatch({ userId: deviceId });
    const userInfo = this.store.userInfo;
    const { device, system, OS, language } = userInfo ? userInfo : {};
    const data = { reference: this.reference, userId: deviceId, device, system, OS, language };

    this.log(LOG.INFO, `Track User`, data);

    const cacheDeviceId = getCookie(STORAGE.COOKIES.CACHE_DEVICE_ID);
    if (notUndefined(cacheDeviceId)) return;
    else {
      this.request.post(SERVER_ROUTES.APP_VISIT, {
        data,
        withIp: true,
        callback: () => {
          setCookie(STORAGE.COOKIES.CACHE_DEVICE_ID, deviceId);
        },
      });
    }
  }

  trackSessions() {
    this.beginSession();
    addEvent(window, 'visibilitychange', this.handleDocumentVisibilityState.bind(this));
    addEvent(window, 'mousemove', this.resetInactivity.bind(this));
    addEvent(window, 'click', this.resetInactivity.bind(this));
    addEvent(window, 'unload', this.endSession.bind(this));
    addEvent(window, EVENTS.WALLET_CONNECTION, this.endSession.bind(this));

    this.generateInactivityInterval();
  }

  beginSession() {
    this.sessionStartTime = currentTimestamp();
    this.sessionTotalInactivetime = 0;
    this.sessionInactive = false;
    this.log(LOG.INFO, 'Session started');
  }

  endSession(event) {
    const totalSessionDuration = currentTimestamp() - this.sessionStartTime;
    const sessionDuration = totalSessionDuration - this.sessionTotalInactivetime;
    this.sessionStartTime = 0;
    this.sessionTotalInactivetime = 0;

    clearInterval(this.inactivityInterval);

    const userInfo = this.store.userInfo;
    const { device, system, OS, language } = userInfo ? userInfo : {};
    const data = {
      address: event?.account ?? this.store.connectedAccount,
      chainId: event?.chainId ?? this.store.connectedChain,
      sessionDuration,
      doneTxn: this.store.doneTxn,
      navigation: this.store.pageNavigation,
      pagesFlow: this.pagesFlow,
      rejectTxn: this.store.rejectTxn,
      device,
      system,
      OS,
      language,
      userId: this.store.userId,
      submitTxnCount: this.store.submitTxnCount,
      rejectTxnCount: this.store.rejectTxnCount,
    };
    this.log(LOG.INFO, 'Session expired => ', data);

    this.request.post(SERVER_ROUTES.SESSION, {
      data,
      withIp: true,
      keepalive: true,
      callback: () => {
        this.dispatch({ pageNavigation: [], doneTxn: false, rejectTxn: false, submitTxnCount: 0, rejectTxnCount: 0 });
        this.pagesFlow = [];
        //add current page in navigation after clearing all navigation data
        this.trackPageView();
      },
    });
  }

  resetInactivity() {
    if (this.sessionInactive) {
      this.beginSession();
      this.generateInactivityInterval();
    } else {
      clearInterval(this.inactivityInterval);
      this.generateInactivityInterval();
      this.sessionInactive = false;
    }
  }

  handleDocumentVisibilityState() {
    if (document.visibilityState === 'visible') {
      const hiddenInactiveTime = currentTimestamp() - this.sessionHiddenTime;
      this.sessionTotalInactivetime += hiddenInactiveTime;
    } else {
      this.sessionHiddenTime = currentTimestamp();
    }
  }

  generateInactivityInterval() {
    this.inactivityInterval = setInterval(() => {
      this.sessionInactive = true;
      this.endSession();
    }, this.inactivityTimeout * 60 * 1000);
  }

  trackPageView(_page) {
    const page = _page || window.location.pathname;
    if (page) {
      const pageNavigation = this.store.pageNavigation;
      const alreadyNavigated = pageNavigation.find(({ page }) => page === page);
      if (!alreadyNavigated) {
        pageNavigation.push({ page, doneTxn: false });
        this.dispatch({ pageNavigation });
      }
      this.pagesFlow.push(page);
      const data = { pageTitle: page };
      this.request.post(SERVER_ROUTES.PAGE_VIEW, { data });
      this.log(LOG.INFO, 'Track pageview', data);
    }
  }

  trackOutboundLink() {
    function findParentByTagName(element, tagName) {
      var parent = element;

      while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
        parent = parent.parentNode;
      }

      return parent;
    }

    function trackAnchorClick(event) {
      const anchorTag = findParentByTagName(event.target || event.srcElement, 'A');
      if (anchorTag) {
        if (anchorTag.hostname !== window.location.hostname) {
          const data = { link: anchorTag.href };
          this.request.post(SERVER_ROUTES.OUTBOUND, { data });
          this.log(LOG.INFO, 'Track outbound link', data);
        }
      }
    }

    addEvent(window, 'click', trackAnchorClick.bind(this));
  }
}

export default Tracking;
