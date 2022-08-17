import BaseAnalytics from '../BaseAnalytics';
import { notUndefined } from '../utils/validators';

class UserInfo extends BaseAnalytics {
  constructor(config) {
    super(config);
  }

  getUserInfo() {
    const userInfo = {};
    if (notUndefined(navigator)) {
      const userAgent = navigator.userAgent;
      userInfo.device = this.getDevice(userAgent);
      userInfo.browser = this.getBrowser(userAgent);
      userInfo.os = this.getOS(userAgent);
      userInfo.language = navigator.language[0];
      this.dispatch({ userInfo });
    }
  }

  getDevice(userAgent) {
    let device;

    if (navigator.userAgentData.mobile) {
      return 'mobile';
    }
    userAgent = userAgent.toLowerCase();
    // regex to check if device is a tablet or a phone based on userAgent
    const tabletCheck =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/;
    const phoneCheck =
      /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/;

    // check for tablet first, then phone
    if (tabletCheck.test(userAgent)) {
      device = 'tablet';
    } else if (phoneCheck.test(userAgent)) {
      device = 'mobile';
    } else {
      device = 'pc';
    }

    // set the device type
    return device;
  }

  getBrowser(userAgent) {
    let browser;
    if (navigator.brave !== undefined && navigator.brave.isBrave === 'isBrave') {
      browser = 'brave';
    } else if (userAgent.match(/chrome|chromium|crios/i)) {
      browser = 'chrome';
    } else if (userAgent.match(/firefox|fxios/i)) {
      browser = 'firefox';
    } else if (userAgent.match(/safari/i)) {
      browser = 'safari';
    } else if (userAgent.match(/opr\//i)) {
      browser = 'opera';
    } else if (userAgent.match(/edg/i)) {
      browser = 'edge';
    } else {
      browser = 'No browser detection';
    }
    return browser;
  }

  getOS(userAgent) {
    let os = 'Unknown OS';
    if (userAgent.indexOf('Windows NT 10.0') != -1) {
      os = 'Windows 10';
    } else if (userAgent.indexOf('Windows NT 6.2') != -1) {
      os = 'Windows 8';
    } else if (userAgent.indexOf('Windows NT 6.1') != -1) {
      os = 'Windows 7';
    } else if (userAgent.indexOf('Windows NT 6.0') != -1) {
      os = 'Windows Vista';
    } else if (userAgent.indexOf('Windows NT 5.1') != -1) {
      os = 'Windows XP';
    } else if (userAgent.indexOf('Windows NT 5.0') != -1) {
      os = 'Windows 2000';
    } else if (userAgent.indexOf('Mac') != -1) {
      os = 'Mac/iOS';
    } else if (userAgent.indexOf('X11') != -1) {
      os = 'UNIX';
    } else if (userAgent.indexOf('Linux') != -1) {
      os = 'Linux';
    }
    return os;
  }
}

export default UserInfo;
