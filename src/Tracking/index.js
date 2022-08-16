import BaseAnalytics from '../BaseAnalytics';
import { logEnums, STORAGE, configrationDefaultValue } from '../constants';
import { generateUUID } from './utils';
import { addEvent, currentTimestamp, setGetValueInStorage, getConfig } from '../utils/helpers';
import { notUndefined } from '../utils/validators';

class Tracking extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.inactivityTimeout = getConfig(config.inactivityTimeout, configrationDefaultValue.INACTIVITY_TIMEOUT);
    this.reference = undefined;
    this.outboundLink = undefined;
    this.timerStart = 0;
    this.timerEnd = 0;
    this.hideTime = 0;
    this.unHideTime = 0;
    this.visiblilty = true;
    this.inactivityCounter = 0;
    this.inactivity = undefined;
    this.trackTime = false;
    this.lastDurationTime = 0;
    this.pagesNavigation = [];
  }

  initialize() {
    this.trackUser();
    this.trackSessions();
  }

  //Track User
  trackUser() {
    let deciveId;

    const storedDeviceId = setGetValueInStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID);
    if (!storedDeviceId) {
      this.log(logEnums.INFO, 'User is visiting for the first time');
      deciveId = generateUUID();
      setGetValueInStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID, deviceId);
    } else {
      deciveId = storedDeviceId;
    }

    this.dispatch({ userId: deciveId });
    this.log(logEnums.INFO, `User ${this.store.userId}`);
  }

  //Track Sessions
  trackSessions() {
    //let hidden = false;
    this.beginSession();
    addEvent(window, 'visibilitychange', this.handleDocumentVisibilityState.bind(this));
    addEvent(window, 'mousemove', this.resetInactivity.bind(this));
    addEvent(window, 'click', this.resetInactivity.bind(this));
    addEvent(window, 'beforeunload', this.endSession.bind(this));
    this.checkInactivityCounter('track');
  }

  //Begin Session
  beginSession() {
    this.timerStart = currentTimestamp();
    this.reference = notUndefined(document.referrer) ? document.referrer : undefined;
    this.lastDurationTime = 0;

    const storedSessionTime = setGetValueInStorage(STORAGE.SESSION_STORAGE.SESSION_STARTED);

    if (storedSessionTime) {
      console.log('storedSessionTime => ', storedSessionTime);
      // this.request.post('/app-visits/create ', {
      //   user: this.store.userId,
      //   reference:this.reference,
      //   metaData: getMetaData(),
      //   timestamp: currentTimestamp(),
      // });
    } else {
      //  this.log(logEnums.INFO, 'Session started');
      console.log('Session started', this.timerStart);
      setGetValueInStorage(STORAGE.SESSION_STORAGE.SESSION_STARTED, this.timerStart);
    }
  }

  //End Session
  endSession() {
    this.timerEnd = currentTimestamp();
    // this.log(logEnums.INFO, 'Session expired');
    console.log('Session expired', this.timerEnd);
    const total = this.timerEnd - this.timerStart - this.lastDurationTime;
    this.timerStart = 0;
    this.timerEnd = 0;
    this.lastDurationTime = 0;
    clearInterval(this.inactivity);
    sessionStorage.removeItem(STORAGE.SESSION_STORAGE.SESSION_STARTED);
    // this.request.post('/session/create-session', {
    //   user: this.store.userId,
    //   duration: total,
    //   Navigation: this.pagesNavigation,
    //   metaData: getMetaData(),
    //   timestamp: currentTimestamp(),
    //   doneTxn: false,
    //   wallet: this.store.connectedAccount,
    // });
  }

  //Track Time
  startTime() {
    if (!this.trackTime) {
      this.log(logEnums.INFO, 'start time');
      this.trackTime = true;
      this.unHideTime = currentTimestamp() - this.hideTime;
      this.lastDurationTime = this.lastDurationTime + this.unHideTime;
      this.unHideTime = 0;
    }
  }

  //End Time
  endTime() {
    // this.log(logEnums.INFO, 'end time');
    if (this.trackTime) {
      console.log('this.Endtime', this.hideTime);
    }
  }

  //Reset Inactivity Counter
  resetInactivity() {
    if (this.inactivityCounter >= this.inactivityTimeout) {
      this.trackTime = false;
      this.beginSession();
      this.checkInactivityCounter('reset');
    }
    this.inactivityCounter = 0;
  }

  // Handle visibility change eventss
  handleDocumentVisibilityState() {
    if (document.visibilityState === 'visible') {
      console.log('visibilitychange', 'visible');
      this.startTime();
    } else {
      this.hideTime = currentTimestamp();
      this.trackTime = false;
      console.log('visibilitychange', 'hidden');
      this.endTime();
    }
  }

  //Check Inactivity Counter
  checkInactivityCounter(check) {
    this.inactivity = setInterval(() => {
      this.inactivityCounter++;
      if (this.inactivityCounter === 1) {
        this.endSession();
      }
    }, this.inactivityTimeout * 1000);
  }

  //Track Page
  trackPageView(_page) {
    const page = _page || window.location.pathname;
    if (page) {
      this.log(logEnums.INFO, 'track pageview', page);
      this.pagesNavigation.push(page);
    }
  }

  //Track Outbound Link
  trackOutboundLink() {
    console.log('trackOutboundLink');

    const trackOutbound = function () {
      const links = document.querySelectorAll('a');
      links.forEach(function (link) {
        if (link.hostname !== window.location.hostname) {
          addEvent(link, 'click', function (e) {
            const outboundLink = link.href;
            this.log(logEnums.INFO, 'track outbound link', outboundLink);
          });
        }
      });
    };

    addEvent(document, 'DOMContentLoaded', trackOutbound);
  }
}

export default Tracking;
