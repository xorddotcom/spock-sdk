import BaseAnalytics from '../BaseAnalytics';
import { logEnums, STORAGE, configrationDefaultValue } from '../constants';
import { generateUUID } from './utils';
import { addEvent, currentTimestamp, setGetValueInStorage, getConfig } from '../utils/helpers';
import { notUndefined } from '../utils/validators';
import { getCookie, setCookie } from '../utils/cookies';

class Tracking extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.inactivityTimeout = getConfig(config.inactivityTimeout, configrationDefaultValue.INACTIVITY_TIMEOUT);
    this.reference = undefined; //document reference
    this.inactivityInterval = undefined; //inactivity interval for checking session inactivity
    this.sessionInactive = false; //is ongoing session is inactive
    this.sessionStartTime = 0; //session start time
    this.sessionHiddenTime = 0; //session inactive time
    this.sessionTotalInactivetime = 0; //total duration in which session was inactive
    this.pagesFlow = []; //all the pages open in one session

    this.trackPageView = this.trackPageView.bind(this);
  }

  initialize() {
    this.reference = notUndefined(document.referrer) ? document.referrer : undefined;
    this.trackUser();
    this.trackSessions();
    this.trackOutboundLink();
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

    this.log(logEnums.INFO, `Track User`, data);

    const cacheDeviceId = getCookie(STORAGE.COOKIES.CACHE_DEVICE_ID);
    if (notUndefined(cacheDeviceId)) return;
    else {
      this.request.post('app-visits/create', {
        data,
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
    addEvent(window, 'beforeunload', this.endSession.bind(this));
    this.generateInactivityInterval();
  }

  beginSession() {
    this.sessionStartTime = currentTimestamp();
    this.sessionTotalInactivetime = 0;
    this.sessionInactive = false;
    this.log(logEnums.INFO, 'Session started');
  }

  endSession() {
    const totalSessionDuration = currentTimestamp() - this.sessionStartTime;
    const sessionDuration = totalSessionDuration - this.sessionTotalInactivetime;
    this.sessionStartTime = 0;
    this.sessionTotalInactivetime = 0;
    clearInterval(this.inactivityInterval);

    const userInfo = this.store.userInfo;
    const { device, system, OS, language } = userInfo ? userInfo : {};
    const data = {
      address: this.store.connectedAccount,
      sessionDuration,
      doneTxn: this.store.doneTxn,
      navigation: this.store.pageNavigation,
      pagesFlow: this.store.pagesFlow,
      device,
      system,
      OS,
      language,
      userId: this.store.userId,
    };
    this.log(logEnums.INFO, 'Session expired => ', data);
    this.request.post('session/create-session', { data });
  }

  //Reset Inactivity Counter
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
    }, 10 * 1000);
  }

  trackPageView(_page) {
    const page = _page || window.location.pathname;
    if (page) {
      const pageNavigation = this.store.pageNavigation;
      const alreadyNavigated = pageNavigation.find(({ pageTitle }) => pageTitle === page);
      if (!alreadyNavigated) {
        pageNavigation.push({ page, doneTxn: false });
        this.dispatch({ pageNavigation });
      }
      this.pagesFlow.push(page);
      const data = { pageTitle: page };
      this.request.post('page-views/create', { data });
      this.log(logEnums.INFO, 'Track pageview', data);
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
        const data = { link: anchorTag.href };
        this.request.post('outbound-links/create', { data });
        this.log(logEnums.INFO, 'Track outbound link', data);
      }
    }

    addEvent(window, 'click', trackAnchorClick.bind(this));
  }
}

export default Tracking;
