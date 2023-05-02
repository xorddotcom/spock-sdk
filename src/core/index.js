import BaseAnalytics from '../BaseAnalytics';
import Session from '../Session';
import UserInfo from '../UserInfo';
import WalletConnection from '../WalletConnection';
import { TRACKING_EVENTS, LOG } from '../constants';
import { addEvent } from '../utils/helpers';
import { extractDomain } from '../utils/formatting';

class Web3Analytics extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.userInfo = new UserInfo(config);
    this.wallet = new WalletConnection(config);
    this.session = new Session(config);
    this.trackPageView = this.trackPageView.bind(this);
  }

  initialize() {
    this.log(LOG.INFO, 'Web3 Analytics initialized');
    this.userInfo.getUserInfo();
    this.session.trackSession();
    this.wallet.initialize();

    this.trackOutboundLink();
  }

  trackPageView(_page) {
    const page = _page || window.location.pathname;
    if (page) {
      //TODO spilt pathname and search
      const properties = { pathName: page };
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
}

export default Web3Analytics;
