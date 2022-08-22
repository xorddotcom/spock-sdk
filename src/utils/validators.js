export function notUndefined(value) {
  return !isType(value, 'undefined');
}

export function isSameAddress(address1 = '', address2 = '') {
  return address1.toLowerCase() === address2.toLowerCase();
}

export function isType(value, type) {
  return typeof value === type;
}
