export function notUndefined(value) {
  return typeof value !== 'undefined';
}

export function isSameAddress(address1 = '', address2 = '') {
  return address1.toLowerCase() === address2.toLowerCase();
}
