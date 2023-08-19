import { LIB_VERSION, STORAGE, TRACKING_EVENTS, LOG, DATA_POINTS } from '../constants';
import BaseAnalytics from '../BaseAnalytics';
import { getCookie } from '../utils/cookies';
import { extractDomain } from '../utils/formatting';
import {
  includes,
  stripEmptyProperties,
  setGetValueInLocalStorage,
  deleteValueFromLocalStorage,
} from '../utils/helpers';
import { notUndefined } from '../utils/validators';

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

class UserInfo extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  browser(userAgent, vendor, opera) {
    vendor = vendor || ''; // vendor is undefined for at least IE9
    if (opera || includes(userAgent, ' OPR/')) {
      if (includes(userAgent, 'Mini')) {
        return 'Opera Mini';
      }
      return 'Opera';
    } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry';
    } else if (includes(userAgent, 'IEMobile') || includes(userAgent, 'WPDesktop')) {
      return 'Internet Explorer Mobile';
    } else if (includes(userAgent, 'SamsungBrowser/')) {
      // https://developer.samsung.com/internet/user-agent-string-format
      return 'Samsung Internet';
    } else if (includes(userAgent, 'Edge') || includes(userAgent, 'Edg/')) {
      return 'Microsoft Edge';
    } else if (includes(userAgent, 'FBIOS')) {
      return 'Facebook Mobile';
    } else if (includes(userAgent, 'Chrome')) {
      return 'Chrome';
    } else if (includes(userAgent, 'CriOS')) {
      return 'Chrome iOS';
    } else if (includes(userAgent, 'UCWEB') || includes(userAgent, 'UCBrowser')) {
      return 'UC Browser';
    } else if (includes(userAgent, 'FxiOS')) {
      return 'Firefox iOS';
    } else if (includes(vendor, 'Apple')) {
      if (includes(userAgent, 'Mobile')) {
        return 'Mobile Safari';
      }
      return 'Safari';
    } else if (includes(userAgent, 'Android')) {
      return 'Android Mobile';
    } else if (includes(userAgent, 'Konqueror')) {
      return 'Konqueror';
    } else if (includes(userAgent, 'Firefox')) {
      return 'Firefox';
    } else if (includes(userAgent, 'MSIE') || includes(userAgent, 'Trident/')) {
      return 'Internet Explorer';
    } else if (includes(userAgent, 'Gecko')) {
      return 'Mozilla';
    } else {
      return '';
    }
  }

  browserVersion(userAgent, vendor, opera) {
    const browser = this.browser(userAgent, vendor, opera);
    const versionRegexs = {
      'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
      'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
      Chrome: /Chrome\/(\d+(\.\d+)?)/,
      'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
      'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
      Safari: /Version\/(\d+(\.\d+)?)/,
      'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
      Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
      Firefox: /Firefox\/(\d+(\.\d+)?)/,
      'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
      Konqueror: /Konqueror:(\d+(\.\d+)?)/,
      BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
      'Android Mobile': /android\s(\d+(\.\d+)?)/,
      'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
      'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
      Mozilla: /rv:(\d+(\.\d+)?)/,
    };
    const regex = versionRegexs[browser];
    if (regex === undefined) {
      return undefined;
    }
    const matches = userAgent.match(regex);
    if (!matches) {
      return undefined;
    }
    return parseFloat(matches[matches.length - 2]);
  }

  device(userAgent) {
    if (navigator?.userAgentData?.mobile) {
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
      return 'tablet';
    } else if (phoneCheck.test(userAgent)) {
      return 'mobile';
    } else {
      return 'pc';
    }
  }

  os(userAgent) {
    const a = userAgent;
    if (/Windows/i.test(a)) {
      if (/Phone/.test(a) || /WPDesktop/.test(a)) {
        return 'Windows Phone';
      }
      return 'Windows';
    } else if (/(iPhone|iPad|iPod)/.test(a)) {
      return 'iOS';
    } else if (/Android/.test(a)) {
      return 'Android';
    } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
      return 'BlackBerry';
    } else if (/Mac/i.test(a)) {
      return 'Mac OS X';
    } else if (/Linux/.test(a)) {
      return 'Linux';
    } else if (/CrOS/.test(a)) {
      return 'Chrome OS';
    } else {
      return '';
    }
  }

  searchEngine(referrer) {
    if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
      return 'google';
    } else if (referrer.search('https?://(.*)bing.com') === 0) {
      return 'bing';
    } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
      return 'yahoo';
    } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
      return 'duckduckgo';
    } else {
      return '';
    }
  }

  uuid(userAgent) {
    // Time-based entropy
    const T = function () {
      const time = 1 * new Date();
      let ticks;
      if (window.performance && window.performance.now) {
        ticks = window.performance.now();
      } else {
        ticks = 0;
        while (time == 1 * new Date()) {
          ticks++;
        }
      }
      return time.toString(16) + Math.floor(ticks).toString(16);
    };

    // Math.Random entropy
    const R = function () {
      return Math.random().toString(16).replace('.', '');
    };

    // User agent entropy
    // This function takes the user agent string, and then xors
    // together each sequence of 8 bytes.  This produces a final
    // sequence of 8 bytes which it returns as hex.
    const UA = function () {
      let ua = userAgent,
        i,
        ch,
        buffer = [],
        ret = 0;

      function xor(result, byte_array) {
        let j,
          tmp = 0;
        for (j = 0; j < byte_array.length; j++) {
          tmp |= buffer[j] << (j * 8);
        }
        return result ^ tmp;
      }

      for (i = 0; i < ua.length; i++) {
        ch = ua.charCodeAt(i);
        buffer.unshift(ch & 0xff);
        if (buffer.length >= 4) {
          ret = xor(ret, buffer);
          buffer = [];
        }
      }

      if (buffer.length > 0) {
        ret = xor(ret, buffer);
      }

      return ret.toString(16);
    };

    const se = (screen.height * screen.width).toString(16);
    return T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
  }

  distinctId(userAgent) {
    const cachedDistinctId = getCookie(STORAGE.COOKIES.DISTINCT_ID);
    const oldVersionDistincId = setGetValueInLocalStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID);

    if (notUndefined(cachedDistinctId)) {
      return cachedDistinctId;
    } else if (oldVersionDistincId) {
      this.setConsetCookie(STORAGE.COOKIES.DISTINCT_ID, oldVersionDistincId, ONE_YEAR);
      deleteValueFromLocalStorage(STORAGE.LOCAL_STORAGE.DEVICE_ID);
      return oldVersionDistincId;
    } else {
      const newDistinctId = this.uuid(userAgent);
      this.setConsetCookie(STORAGE.COOKIES.DISTINCT_ID, newDistinctId, ONE_YEAR);
      return newDistinctId;
    }
  }

  async getUserInfo() {
    if (notUndefined(navigator)) {
      const userAgent = navigator.userAgent;
      const vendor = navigator.vendor;
      const windowOpera = window.opera;
      const referrer = document.referrer;

      const userInfo = {
        ...stripEmptyProperties({
          browser: this.browser(userAgent, vendor, windowOpera),
          device: this.device(userAgent),
          os: this.os(userAgent),
          referrer: referrer,
          referringDomain: extractDomain(referrer),
          searchEngine: this.searchEngine(referrer),
        }),
      };

      userInfo.browserVersion = this.browserVersion(userAgent, vendor, windowOpera);
      userInfo.libVersion = LIB_VERSION;
      userInfo.screenHeight = screen.height;
      userInfo.screenWidth = screen.width;

      this.dispatch({ userInfo, distinctId: this.distinctId(userAgent) });

      this.trackEvent({ event: TRACKING_EVENTS.APP_VISIT, logMessage: 'App visit' });

      if (this.dataPoints[DATA_POINTS.DEMOGRAPHICS]) {
        await this.getUserIp();
      }

      //getUserIp is an async method so it take times to relsove uptil then we queue all tracking events
      //then process all events after resolve
      this.dispatch({ initialized: true });
      this.processQueue();
    }

    //ping server with the enables datapoints info
    this.request.post('track/ping', {
      data: { dataPoints: Object.keys(this.dataPoints).sort(), libVersion: LIB_VERSION },
      sendBeacon: true,
    });
  }

  async getUserIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
      });
      const result = await response.json();
      if (result?.ip) {
        this.dispatch({ ip: result.ip });
      }
    } catch (e) {
      this.log(LOG.ERROR, `getUserIp`, e.toString());
    }
  }
}

export default UserInfo;
