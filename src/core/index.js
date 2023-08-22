import { TRACKING_EVENTS, LOG, STORAGE, DATA_POINTS } from '../constants';
import BaseAnalytics from '../BaseAnalytics';
import Session from '../Session';
import UserInfo from '../UserInfo';
import { getCookie, setCookie } from '../utils/cookies';
import { extractDomain, JSON_Formatter } from '../utils/formatting';
import { addEvent, stripEmptyProperties } from '../utils/helpers';
import { isType, notUndefined } from '../utils/validators';
import WalletConnection from '../WalletConnection';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.userInfo = new UserInfo(config);
    this.wallet = new WalletConnection(config);
    this.session = new Session(config);

    this.trackPageView = this.trackPageView.bind(this);
    this.trackOutboundLink = this.trackOutboundLink.bind(this);
    this.optOutTracking = this.optOutTracking.bind(this);
    this.optInTracking = this.optInTracking.bind(this);
    this.hasOptedOutTracking = this.hasOptedOutTracking.bind(this);
  }

  async initialize() {
    this.log(LOG.INFO, 'Web3 Analytics initialized');
    this.userConsent();

    this.session.trackSession();
    await this.userInfo.getUserInfo();
    this.wallet.initialize();

    if (this.dataPoints[DATA_POINTS.NAVIGATION]) {
      this.trackOutboundLink();
    }
  }

  trackPageView(pathname, search) {
    if (this.dataPoints[DATA_POINTS.NAVIGATION]) {
      const properties = stripEmptyProperties({
        pathname: pathname || window.location.pathname,
        search: search || window.location.search,
      });
      this.trackEvent({ event: TRACKING_EVENTS.PAGE_VIEW, properties, logMessage: 'Page view' });
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
          const properties = { link: anchorTag.href, domain: extractDomain(anchorTag.href) };
          this.trackEvent({ event: TRACKING_EVENTS.OUTBOUND, properties, logMessage: 'Outbound' });
        }
      }
    }

    addEvent(window, 'click', trackAnchorClick.bind(this));
  }

  userConsent() {
    const optOut = getCookie(STORAGE.COOKIES.OPT_OUT);

    if (notUndefined(optOut)) {
      this.dispatch({ optOut: JSON_Formatter.parse(optOut) });
    } else {
      this.dispatch({ optOut: this.defaultOptOut });
    }
  }

  optTracking(expiration, option) {
    expiration = isType(expiration) === 'number' && expiration > 0 && expiration <= 365 ? expiration : 365;
    setCookie(STORAGE.COOKIES.OPT_OUT, option, expiration * 24 * 60 * 60 * 1000);
    this.dispatch({ optOut: option });
  }

  optOutTracking(expiration) {
    this.optTracking(expiration, true);
  }

  optInTracking(expiration) {
    this.optTracking(expiration, false);
  }

  hasOptedOutTracking() {
    return this.store.optOut;
  }
}

export default Web3Analytics;
