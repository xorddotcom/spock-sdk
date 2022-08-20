function cookieExpiry(expDays = 1) {
  let date = new Date();
  date.setHours(23 * expDays, 59, 59, 999);
  return date.toUTCString();
}

export function setCookie(cName, cValue, expDays) {
  const expires = 'expires=' + cookieExpiry(expDays);
  document.cookie = cName + '=' + cValue + '; ' + expires + '; path=/';
}

export function getCookie(cName) {
  const name = cName + '=';
  const cDecoded = decodeURIComponent(document.cookie);
  const cArr = cDecoded.split('; ');
  let res;
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
}
