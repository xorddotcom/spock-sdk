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

  async post(route, { data, callback, keepalive }) {
    if (this.store.optOut) {
      return;
    }
    const formatedData = JSON_Formatter.stringify({ appKey: this.appKey, ...data });
    if (formatedData) {
      if (this.testMode) {
        callback && callback();
        return;
      }

      try {
        const response = await fetch(`${this.endPoint}/${route}`, {
          method: 'POST',
          headers: this.headers,
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
}

export default Request;
