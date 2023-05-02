import BaseAnalytics from '../BaseAnalytics';
import { DEFAULT_CONFIG, LOG, TRACKING_EVENTS, STORAGE } from '../constants';
import { addEvent, currentTimestamp, getConfig } from '../utils/helpers';
import { getCookie, setCookie } from '../utils/cookies';
import { JSON_Formatter } from '../utils/formatting';
import { notUndefined } from '../utils/validators';
import { limitedTimeout, sessionUUID } from './utils';

const ONE_MINUTE = 60 * 1000;

class Session extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.inActivityTimeout =
      limitedTimeout(getConfig(config.inactivityTimeout, DEFAULT_CONFIG.INACTIVITY_TIMEOUT)) * 60 * 1000;
    this.documentHidden = false;
    this.storedDuration = 0;
    this.inActivityCounter = 0;
    this.sessionExpired = false;
    this.hiddenTime = 0;
    this.totalHiddenTime = 0;
    this.hidden = 'hidden';
  }

  trackSession() {
    this.beginSession();
    this.inActivityInterval();

    addEvent(window, 'beforeunload', this.pauseSession.bind(this));

    this.visibilityEvents();

    //reset inactivity events
    addEvent(window, 'mousemove', this.resetInActivity.bind(this));
    addEvent(window, 'click', this.resetInActivity.bind(this));
    addEvent(window, 'keydown', this.resetInActivity.bind(this));
    addEvent(window, 'scroll', this.resetInActivity.bind(this));
  }

  beginSession() {
    const cachedSession = getCookie(STORAGE.COOKIES.SESSION);
    if (notUndefined(cachedSession)) {
      this.rewindSession(cachedSession);
    } else {
      this.startTime = currentTimestamp();
      this.dispatch({ sessionId: sessionUUID(), flow: [], txnReject: 0, txnSubmit: 0 });
      //clear states
      this.storedDuration = 0;
      this.inActivityCounter = 0;
      this.sessionExpired = false;
      this.hiddenTime = 0;
      this.totalHiddenTime = 0;
      this.log(LOG.INFO, 'Session started');
    }
  }

  rewindSession(cachedSession) {
    const properties = JSON_Formatter.parse(cachedSession);
    const { duration, flow, pauseTime, sessionId, txnReject, txnSubmit } = properties;
    this.startTime = pauseTime;
    this.dispatch({ sessionId, txnReject, txnSubmit, flow });
    this.storedDuration = duration;
    this.request.post(`track/${TRACKING_EVENTS.REWIND_SESSION}`, { data: { sessionId } });
  }

  pauseSession() {
    if (!this.sessionExpired) {
      const duration = this.sessionDuration();
      const { flow, sessionId, txnReject, txnSubmit } = this.store;
      const properties = {
        duration,
        flow,
        pauseTime: currentTimestamp(),
        sessionId,
        timeout: this.inActivityTimeout,
        txnReject,
        txnSubmit,
      };
      this.trackEvent({ event: TRACKING_EVENTS.PAUSE_SESSION, properties, logMessage: 'Pause session' });
      setCookie(STORAGE.COOKIES.SESSION, JSON_Formatter.stringify(properties), this.inActivityTimeout);
    }
  }

  endSession() {
    const duration = this.sessionDuration();
    const { flow, sessionId, txnReject, txnSubmit } = this.store;
    const properties = {
      duration,
      flow,
      sessionId,
      txnReject,
      txnSubmit,
    };
    this.trackEvent({ event: TRACKING_EVENTS.SESSION, properties, logMessage: 'Session expired' });
  }

  sessionDuration() {
    let duration = this.storedDuration + (currentTimestamp() - this.startTime);
    duration -= this.totalHiddenTime;
    return duration;
  }

  resetInActivity() {
    if (this.sessionExpired) {
      this.beginSession();
    }
    this.inActivityCounter = 0;
  }

  inActivityInterval() {
    setInterval(() => {
      if (!this.sessionExpired) {
        this.inActivityCounter += ONE_MINUTE;
        if (this.inActivityCounter >= this.inActivityTimeout) {
          this.sessionExpired = true;
          this.endSession();
        }
      }
    }, ONE_MINUTE);
  }

  visibilityChange() {
    if (document[this.hidden]) {
      this.hiddenTime = currentTimestamp();
    } else {
      //check if document was hidden on not
      if (this.hiddenTime > 0) {
        this.totalHiddenTime += currentTimestamp() - this.hiddenTime;
        this.hiddenTime = 0;
      }
    }
  }

  visibilityEvents() {
    addEvent(window, 'focus', this.visibilityChange.bind(this));
    addEvent(window, 'blur', this.visibilityChange.bind(this));
    addEvent(window, 'pageshow', this.visibilityChange.bind(this));
    addEvent(window, 'pagehide', this.visibilityChange.bind(this));

    // IE 9 and lower:
    if ('onfocusin' in document) {
      addEvent(window, 'focusin', this.visibilityChange.bind(this));
      addEvent(window, 'focusout', this.visibilityChange.bind(this));
    }

    // Page Visibility API for changing tabs and minimizing browser
    if (this.hidden in document) {
      addEvent(document, 'visibilitychange', this.visibilityChange.bind(this));
    } else if ('mozHidden' in document) {
      this.hidden = 'mozHidden';
      addEvent(document, 'mozvisibilitychange', this.visibilityChange.bind(this));
    } else if ('webkitHidden' in document) {
      this.hidden = 'webkitHidden';
      addEvent(document, 'webkitvisibilitychange', this.visibilityChange.bind(this));
    } else if ('msHidden' in document) {
      this.hidden = 'msHidden';
      addEvent(document, 'msvisibilitychange', this.visibilityChange.bind(this));
    }
  }
}

export default Session;
