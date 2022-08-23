import { SERVER_ENDPOINT, logEnums } from '../constants';
import { stringify } from '../utils/formatting';

class Request {
  constructor(appKey, log, testMode) {
    this.log = log;
    this.testMode = testMode;
    this.headers = {
      appkey: appKey,
      'Content-type': 'application/json; charset=UTF-8',
    };
    this.post = this.post.bind(this);
  }

  post(route, { data, callback }) {
    const formatedData = stringify(data);
    if (formatedData) {
      if (this.testMode) {
        callback && callback();
        return;
      }

      fetch(`${SERVER_ENDPOINT}/${route}`, {
        method: 'POST',
        headers: this.headers,
        body: formatedData,
      })
        .then((response) => response.json())
        .then((json) => {
          callback && callback();
          this.log(logEnums.INFO, `${route} logged`);
        })
        .catch((e) => {
          this.log(logEnums.ERROR, `${route} request failed`, e);
        });
    }
  }
}

export default Request;
