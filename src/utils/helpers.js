import { notUndefined } from './validators';

export function setGetValueInLocalStorage() {
  try {
    const key = arguments[0];
    const value = arguments[1];
    if (value) {
      localStorage.setItem(key, value);
    } else {
      return localStorage.getItem(key);
    }
  } catch (error) {
    return undefined;
  }
}

export function deleteValueFromLocalStorage() {
  try {
    const key = arguments[0];
    localStorage.removeItem(key);
  } catch (error) {
    return undefined;
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
  return notUndefined(value) ? value : defaultValue;
}

export function includes(str, needle) {
  return str.indexOf(needle) !== -1;
}

export function stripEmptyProperties(obj) {
  return Object.entries(obj).reduce((accum, entry) => {
    let value = entry[1];
    value = notUndefined(value) ? value.toString() : '';
    if (value.trim() !== '') {
      accum[entry[0]] = value;
    }
    return accum;
  }, {});
}
