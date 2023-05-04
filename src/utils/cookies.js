function cookieExpiry(expiry) {
  return new Date(Date.now() + expiry).toUTCString();
}

export function setCookie(cName, cValue, expiry) {
  const expires = 'expires=' + cookieExpiry(expiry);
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

export function deleteCookie(cName) {
  setCookie(cName, '', -1);
}
