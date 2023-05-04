import { TRACKING_EVENTS } from '../constants';

export function cheapGuid(maxlen) {
  const guid = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  return maxlen ? guid.substring(0, maxlen) : guid;
}

export function getQueryParams(url, param) {
  param = param.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regexS = '[\\?&]' + param + '=([^&#]*)',
    regex = new RegExp(regexS),
    results = regex.exec(url);
  if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
    return '';
  } else {
    let result = results[1];
    try {
      result = decodeURIComponent(result);
    } catch (err) {
      console.error('Skipping decoding for malformed query param: ' + result);
    }
    return result.replace(/\+/g, ' ');
  }
}

export function transformUTMKey(key) {
  const splittedKey = key.split('_');
  return splittedKey[0] + splittedKey[1][0].toUpperCase() + splittedKey[1].slice(1);
}

export function parseFlowProperties(eventName, properties) {
  if (eventName === TRACKING_EVENTS.TRANSACTION) {
    return { from: properties.from, to: properties.to };
  } else {
    return properties;
  }
}
