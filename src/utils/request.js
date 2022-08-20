import { SERVER_ENDPOINT, logEnums } from '../constants';
import { stringify } from '../utils/formatting';

class Request {
  constructor(appKey, log) {
    this.appKey = appKey;
    this.log = log;
    this.headers = {
      appkey: '51e0aef1ebc5c0aa53612485a02c6acfca2f81423f9950790596272c7052b85e',
      'Content-type': 'application/json; charset=UTF-8',
    };
    this.post = this.post.bind(this);
  }

  post(route, { data, callback }) {
    const formatedData = stringify(data);
    console.log('formatedData => ', formatedData);
    if (formatedData) {
      fetch(`${SERVER_ENDPOINT}/${route}`, {
        method: 'POST',
        headers: this.headers,
        body: formatedData,
      })
        .then((response) => response.json())
        .then((json) => {
          console.log('json => ', json);
          callback && callback();
        })
        .catch((e) => {
          console.log('error => ', e);
          this.log(logEnums.ERROR, 'Post request failed', e);
        });
    }
  }
}

export default Request;
