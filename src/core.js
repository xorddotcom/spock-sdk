import { logEnums } from './constants';
import { addEvent, getStoredIdOrGenerateId, getCoordinates, getMetaData, getTimestamp } from './utils';

class Web3Analytics {
  constructor(config) {
    this.debug = config.debug ?? false;
    this.log = config.logging;
    this.connectedWallet = undefined;
    this.connectedChain = undefined;
    this.userId = undefined;
    this.timeSpentOnSite = 0;
    this.reference = undefined;
    this.outboundLink = undefined;
    this.timerEnd = undefined;
    this.sessionExpire = false;
    this.timer = undefined;
    this.timerStart = undefined;
    this.inactivityCounter = 0;
    this.inactivityTime = 6;
    this.trackTime = false;
    this.pagesNavigation = [];
  }

  initialize() {
    this.wallet.initialize();
  }

  initializeEvents() {
    this.handleWalletConnection();
    this.trackSessions();
  }

  handleWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (account) => {
        this.connectedWallet = account;
        this.log(logEnums.INFO, 'accountsChanged event', account);
      });
    }

    addEvent(window, 'w3a_lsItemInserted', (res) => {
      this.log(logEnums.INFO, 'lsSetFired', res);
    });
  }

  //Track User
  trackUser() {
    this.userId = localStorage.getItem('device_id');
    this.log(logEnums.INFO, 'User', this.userId);
    if (!user) {
      this.userId = getStoredIdOrGenerateId();
      this.log(logEnums.INFO, 'User is visiting for the first time');
    }
  }
  //Begin Session
  beginSession() {
    const date = getTimestamp();
    this.reference = document.referrer;
    track_user();
    if (sessionStorage.getItem('session_started')) {
      this.log(logEnums.INFO, 'Session already started');
      sessionStorage.setItem('session_started', date);
    } else {
      this.log(logEnums.INFO, 'Session started');
      sessionStorage.setItem('session_started', date);
    }
  }
  //End Session
  endSession() {
    const date = sessionStorage.getItem('session_started');
    const timeSpentOnSite = localStorage.getItem('timeSpentOnSite');
    this.log(logEnums.INFO, 'Session expired');
    this.sessionExpire = true;
    clearInterval(this.timerEnd);
    sessionStorage.removeItem('session_started');
    localStorage.removeItem('timeSpentOnSite');
  }
  //Track Time
  startTime() {
    this.log(logEnums.INFO, 'start time');
    this.timerStart = getTimestamp();
    this.timer = setInterval(() => {
      this.timeSpentOnSite = getTimestamp() - this.timerStart;
      localStorage.setItem('timeSpentOnSite', this.timeSpentOnSite);
    }, 1000);
  }
  //End Time
  endTime() {
    this.log(logEnums.INFO, 'end time');
    clearInterval(this.timer);
    this.timerEnd = setInterval(() => {
      this.inactivityCounter++;
      if (this.inactivityCounter >= this.inactivityTime) {
        this.endSession();
      }
    }, 1000);
  }

  //Track Sessions
  trackSessions() {
    // manage sessions on window visibility events
    let hidden = false;
    this.beginSession();
    this.log(logEnums.INFO, 'start time track_sessions');
    this.addEvent(window, 'visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.log(logEnums.INFO, 'visibilitychange', 'visible');
        this.trackTime = true;
        this.startTime();
      } else {
        this.log(logEnums.INFO, 'visibilitychange', 'hidden');
        this.trackTime = false;
        this.endTime();
      }
    });
  }

  //Track Page
  trackPageView(page) {
    if (!page) {
      page = window.location.pathname;
      console.log('Page not provided, using current page', page);
    } else {
      page = page;
      console.log('Page provided', page);
    }
  }

  //TrackPageNavigation
  trackPageNavigation() {
    const pageVisit = window.location.pathname;
    if (pageVisit) {
      this.pagesNavigation.push(pageVisit);
      this.log(logEnums.INFO, 'trackPageNavigation', this.pagesNavigation);
    }
  }

  //Track Outbound Link
  trackOutboundLink() {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        const links = document.querySelectorAll('a');
        links.forEach(function (link) {
          if (link.hostname !== window.location.hostname) {
            link.addEventListener('click', function (e) {
              outboundLink = link.href;
              console.log('Send Request To Server', outboundLink); //Send Request To Server
              console.log('Outbound Link', outboundLink);
            });
          }
        });
      },
      false
    );
  }
}

export default Web3Analytics;
