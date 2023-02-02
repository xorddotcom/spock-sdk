import { UAParser } from 'ua-parser-js';

import BaseAnalytics from '../BaseAnalytics';
import { notUndefined } from '../utils/validators';
import { LOG } from '../constants';

class UserInfo extends BaseAnalytics {
  constructor(config) {
    super(config);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  async getUserInfo() {
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

    await this.getUserIp();
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
