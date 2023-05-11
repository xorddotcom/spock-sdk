import { SERVER_ENDPOINT, TEST_SERVER_ENDPOINT, LOG } from '../constants';
import { JSON_Formatter } from '../utils/formatting';

class Request {
  constructor({ appKey, log, testENV, testMode, store }) {
    this.log = log;
    this.testMode = testMode;
    this.endPoint = testENV ? TEST_SERVER_ENDPOINT : SERVER_ENDPOINT;
    this.store = store;
    this.appKey = appKey;
    this.headers = {
      'Content-type': 'application/json; charset=UTF-8',
    };
    this.post = this.post.bind(this);
  }

  async sendFetch(url, data) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: data,
      });
      await response.json();
    } catch (e) {
      this.log(LOG.ERROR, `${url} sendFetch`, e?.toString());
    }
  }

  async sendBeacon(url, data) {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'text/plain' });
        navigator.sendBeacon(url, blob);
      }
    } catch (e) {
      this.log(LOG.ERROR, `${url} sendBeacon`, e?.toString());
    }
  }

  async post(route, { data, sendBeacon }) {
    if (this.store.optOut) {
      return;
    }

    const formatedData = JSON_Formatter.stringify({ appKey: this.appKey, ip: this.store.ip, ...data });

    if (formatedData) {
      if (this.testMode) {
        return;
      }

      const url = `${this.endPoint}/${route}`;

      if (sendBeacon) {
        await this.sendBeacon(url, formatedData);
      } else {
        await this.sendFetch(url, formatedData);
      }
    }
  }
}

export default Request;
