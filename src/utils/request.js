import { SERVER_ENDPOINT, logEnums } from '../constants';
import { stringify } from '../utils/formatting';

class Request {
  constructor({ appKey, log, testMode }) {
    this.log = log;
    this.testMode = testMode;
    this.ipaddress = undefined;
    this.headers = {
      appkey: appKey,
      'Content-type': 'application/json; charset=UTF-8',
    };
    this.post = this.post.bind(this);
  }

  async getUserIp() {
    let ipaddress = this.ipaddress;
    if (!ipaddress) {
      const result = await this.externalGet('https://api.ipify.org?format=json');
      if (result?.ip) {
        ipaddress = result?.ip;
        this.ipaddress = ipaddress;
        return ipaddress;
      }
    } else {
      return ipaddress;
    }
  }

  async post(route, { data, callback, withIp, keepalive }) {
    const formatedData = stringify(data);
    if (formatedData) {
      if (this.testMode) {
        callback && callback();
        return;
      }

      const headers = withIp ? { ...this.headers, ipaddress: await this.getUserIp() } : this.headers;

      try {
        const response = await fetch(`${SERVER_ENDPOINT}/${route}`, {
          method: 'POST',
          headers,
          body: formatedData,
          keepalive,
        });
        await response.json();
        callback && callback();
        this.log(logEnums.INFO, `${route} logged`);
      } catch (e) {
        this.log(logEnums.ERROR, `${route} request failed`, e.toString());
      }
    }
  }

  async externalGet(api) {
    try {
      const response = await fetch(api, {
        method: 'GET',
      });
      return await response.json();
    } catch (e) {
      console.log('error => ', e);
    }
  }
}

export default Request;
