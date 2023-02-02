import { SERVER_ENDPOINT, TEST_SERVER_ENDPOINT, LOG } from '../constants';
import { JSON_Formatter } from '../utils/formatting';

class Request {
  constructor({ appKey, log, testENV, testMode, store }) {
    this.log = log;
    this.testMode = testMode;
    this.endPoint = testENV ? TEST_SERVER_ENDPOINT : SERVER_ENDPOINT;
    this.store = store;
    this.headers = {
      appkey: appKey,
      'Content-type': 'application/json; charset=UTF-8',
    };
    this.post = this.post.bind(this);
  }

  async post(route, { data, callback, keepalive }) {
    const formatedData = JSON_Formatter.stringify(data);
    if (formatedData) {
      if (this.testMode) {
        callback && callback();
        return;
      }

      let headers = this.headers;
      headers['ipaddress'] = this.store.ip;

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
}

export default Request;
