import { DEFAULT_CONFIG } from '../constants';

export function limitedTimeout(timeout) {
  if (timeout < 2 || timeout > 30) {
    return DEFAULT_CONFIG.INACTIVITY_TIMEOUT;
  } else {
    return timeout;
  }
}

export function sessionUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
