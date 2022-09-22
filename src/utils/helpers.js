import { notUndefined } from './validators';

export function setGetValueInStorage() {
  const key = arguments[0];
  const value = arguments[1];
  if (value) {
    localStorage.setItem(key, value);
  } else {
    return localStorage.getItem(key);
  }
}

export function currentTimestamp() {
  return Math.floor(new Date().getTime() / 1000);
}

export function addEvent(element, type, listener) {
  if (notUndefined(element.addEventListener)) {
    element.addEventListener(type, listener, false);
  }
  // for old browser use attachEvent instead
  else {
    element.attachEvent('on' + type, listener);
  }
}

export function getConfig(value, defaultValue) {
  return value ? value : defaultValue;
}
