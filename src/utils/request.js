import { SERVER_ENDPOINT, TEST_SERVER_ENDPOINT, LOG } from '../constants';
import { stringify } from '../utils/formatting';

class Request {
  constructor({ appKey, log, testENV, testMode }) {
    this.log = log;
    this.testMode = testMode;
    this.endPoint = testENV ? TEST_SERVER_ENDPOINT : SERVER_ENDPOINT;
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

      let headers = this.headers;

      if (withIp) {
        const ipaddress = await this.getUserIp();
        if (ipaddress) {
          headers['ipaddress'] = ipaddress;
        }
      }

      try {
        const response = await fetch(`${this.endPoint}/${route}`, {
          method: 'POST',
          headers,
          body: formatedData,
          keepalive,
        });
        await response.json();
        callback && callback();
      } catch (e) {
        this.log(LOG.ERROR, `${route} request failed`, e.toString());
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
      this.log(LOG.ERROR, `externalGet`, e.toString());
    }
  }
}

export default Request;
