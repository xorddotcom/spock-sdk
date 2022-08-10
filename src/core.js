import { logEnums } from './constants';
import { RequestServer } from './request';
import { addEvent, getStoredIdOrGenerateId, getCoordinates, getMetaData, getTimestamp } from './utils';

class Web3Analytics {
  constructor(config) {
    this.debug = config.debug ? config.debug : false;
    this.log = config.logging;
    this.connectedWallet = undefined;
    this.connectedChain = undefined;
    this.userId = undefined;
    this.timeSpentOnSite = 0;
    this.req={};
    this.reference = undefined;
    this.outboundLink = undefined;
    this.timer = undefined;
    this.timerStart = 0;
    this.timerEnd = 0;
    this.hideTime= 0;
    this.unHideTime= 0;
    this.visiblilty=true;
    this.inactivityCounter = 0;
    this.inactivityTime = 3;
    this.inactivity=undefined
    this.trackTime = false;
    this.lastDurationTime=0
    this.pagesNavigation = [];
  }

  initialize() {
    this.log(logEnums.INFO, 'Web3Analytics initialized');
    this.initializeEvents();
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

    // addEvent(window, 'w3a_lsItemInserted', (res) => {
    //   this.log(logEnums.INFO, 'lsSetFired', res);
    // });
  }

  //Track User
  trackUser() {
    const user = localStorage.getItem('device_id');
    this.userId = user;
    console.log(this.userId);
    this.log(logEnums.INFO, `User ${this.userId}`);
    if (!user) {
      this.userId = getStoredIdOrGenerateId();
      this.log(logEnums.INFO, 'User is visiting for the first time');
    }
  }
  //Begin Session
  beginSession() {
    this.timerStart = getTimestamp();
    // this.trackUser();
    const date = getTimestamp();
    this.reference = document.referrer;
        this.lastDurationTime= 0;
    if (sessionStorage.getItem('session_started')) {
      // this.log(logEnums.INFO, 'Session already started');
      console.log('Session already started');
      sessionStorage.setItem('session_started', date);
    } else {
      //  this.log(logEnums.INFO, 'Session started');
      console.log('Session started',this.timerStart);
      sessionStorage.setItem('session_started', date);
    }
  }
  //End Session
  endSession() {
    this.timerEnd = getTimestamp();
    // this.log(logEnums.INFO, 'Session expired');
    console.log('Session expired',this.timerEnd);
    const total=this.timerEnd - this.timerStart - this.lastDurationTime;
    console.log('total', total,this.lastDurationTime);
    this.timerStart=0;
    this.timerEnd=0;
    this.lastDurationTime= 0;
    clearInterval(this.inactivity);
    sessionStorage.removeItem('session_started');
    localStorage.removeItem('timeSpentOnSite');
    RequestServer();
    // RequestServer.sendData(this.pagesNavigation);
  }
  //Track Time
  startTime() {
    if (!this.trackTime) {
    this.log(logEnums.INFO, 'start time');
    this.trackTime = true;
    this.unHideTime=(getTimestamp() - this.hideTime);
    console.log("this.unHideTime",this.unHideTime)
    console.log("this.lastDuration",this.hideTime)
    this.lastDurationTime= this.lastDurationTime + this.unHideTime
    console.log('start time',this.unHideTime,this.lastDurationTime,this.hideTime);
    this.unHideTime=0
    
    }
  }
  //End Time
  endTime() {
    // this.log(logEnums.INFO, 'end time');
      if(this.trackTime){
        console.log('this.Endtime',this.hideTime)
      }
  }
  //Reset Inactivity Counter
  resetInactivity() {
    if (this.inactivityCounter >= this.inactivityTime) {
      this.trackTime = false;
      console.log('start time resetInactivity');
      this.beginSession();
      this.checkInactivityCounter("reset");
    }
    this.inactivityCounter = 0;
  }
  // Handle visibility change eventss
  onchange() {
    // if (document[hidden]) {
    //   console.log('Hidden or not focused');
    //   clearInterval(timer);
    // } else {
    //   console.log('Focused');
    //   console.log('start time onchange else');
    //   start_time();
    // }
    if (document.visibilityState === 'visible') {
      // this.log(logEnums.INFO, 'visibilitychange', 'visible');
      console.log('visibilitychange', 'visible');
      this.startTime();
    } else {
      // this.log(logEnums.INFO, 'visibilitychange', 'hidden');
      this.hideTime=getTimestamp();
      this.trackTime=false;
      console.log('visibilitychange', 'hidden');
      this.endTime();
    }
  }
  //Check Inactivity Counter
  checkInactivityCounter(check) {
     this.inactivity= setInterval(() => {
      this.inactivityCounter++;
      console.log('inactivityCounter', this.inactivityCounter,check);
      if (this.inactivityCounter === this.inactivityTime) {
        console.log('you have been inactive for more than ', this.inactivityTime, 'seconds');
        this.endSession();
      }
    }, 5000);
  }

  //Track Sessions
  trackSessions() {
    // manage sessions on window visibility events
    let hidden = false;
    this.beginSession();
    // this.startTime();
    // this.log(logEnums.INFO, 'start time track_sessions');
    addEvent(window, 'visibilitychange', this.onchange.bind(this));
    addEvent(window, 'mousemove', this.resetInactivity.bind(this));
    addEvent(window, 'click', this.resetInactivity.bind(this));
    // addEvent(window, 'keydown', this.resetInactivity.bind(this));
    // addEvent(window, 'scroll', this.resetInactivity.bind(this));
    addEvent(window, 'beforeunload', this.endSession.bind(this));
    // this.checkInactivityCounter("track")
    this.checkInactivityCounter("track");
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
