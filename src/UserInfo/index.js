import { UAParser } from 'ua-parser-js';

import BaseAnalytics from '../BaseAnalytics';
import { notUndefined } from '../utils/validators';

class UserInfo extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  getUserInfo() {
    const userInfo = {};
    if (notUndefined(navigator)) {
      const userAgent = navigator.userAgent;
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      userInfo.system = result.browser.name;
      userInfo.OS = result.os.name;
      userInfo.device = result.device.type || this.getDevice(userAgent);
      userInfo.language = navigator.language;
      this.dispatch({ userInfo });
    }
  }

  getDevice(userAgent) {
    let device;

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
      device = 'tablet';
    } else if (phoneCheck.test(userAgent)) {
      device = 'mobile';
    } else {
      device = 'pc';
    }

    // set the device type
    return device;
  }
}

export default UserInfo;
