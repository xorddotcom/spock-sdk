import { ServerEndooint, logEnums } from '../constants';
import { stringify } from '../utils/formatting';

class Request {
  constructor(appKey, log) {
    this.appKey = appKey;
    this.log = log;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      appKey,
    };
  }

  post(route, data = {}) {
    const formatedData = stringify(data);
    if (formatedData) {
      fetch(`${ServerEndooint}/${route}`, {
        method: 'POST',
        headers: this.headers,
        body: formatedData,
      })
        .then((res) => {
          this.log(logEnums.DEBUG, 'Response', res);
          return res.json();
        })
        .catch((e) => {
          this.log(logEnums.ERROR, 'Post request failed', e);
        });
    }
  }
}

export default Request;
