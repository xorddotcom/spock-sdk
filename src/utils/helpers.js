export function setGetValueInStorage() {
  const key = arguments[0];
  const value = arguments[1];
  if (value) {
    localStorage.setItem(key, value);
  } else {
    return localStorage.getItem(key);
  }
}

//Get Stored Id or Generated Id
export function getStoredIdOrGenerateId() {
  const storedDeviceId = setGetValueInStorage('device_id');
  if (storedDeviceId) {
    return storedDeviceId;
  } else {
    const deviceId = generateUUID();
    setGetValueInStorage('device_id', deviceId);
    return deviceId;
  }
}

// Get generateUUID
export function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

//Get Timestamp
export function getTimestamp() {
  return Math.floor(new Date().getTime() / 1000);
}

// Operating System Detection
function getOS(userAgent) {
  let os = 'Unknown OS';
  if (userAgent.indexOf('Windows NT 10.0') != -1) {
    os = 'Windows 10';
  } else if (userAgent.indexOf('Windows NT 6.2') != -1) {
    os = 'Windows 8';
  } else if (userAgent.indexOf('Windows NT 6.1') != -1) {
    os = 'Windows 7';
  } else if (userAgent.indexOf('Windows NT 6.0') != -1) {
    os = 'Windows Vista';
  } else if (userAgent.indexOf('Windows NT 5.1') != -1) {
    os = 'Windows XP';
  } else if (userAgent.indexOf('Windows NT 5.0') != -1) {
    os = 'Windows 2000';
  } else if (userAgent.indexOf('Mac') != -1) {
    os = 'Mac/iOS';
  } else if (userAgent.indexOf('X11') != -1) {
    os = 'UNIX';
  } else if (userAgent.indexOf('Linux') != -1) {
    os = 'Linux';
  }
  return os;
}
//Browser Detection
function getBrowser(userAgent) {
  let browser;
  if(navigator.brave !== undefined && navigator.brave.isBrave === "isBrave"){
    browser = 'brave';
  }
  else if (userAgent.match(/chrome|chromium|crios/i)) {
    browser = 'chrome';
  } else if (userAgent.match(/firefox|fxios/i)) {
    browser = 'firefox';
  } else if (userAgent.match(/safari/i)) {
    browser = 'safari';
  } else if (userAgent.match(/opr\//i)) {
    browser = 'opera';
  } else if (userAgent.match(/edg/i)) {
    browser = 'edge';
  } else {
    browser = 'No browser detection';
  }
  return browser;
}
// Device Detection
function getDevice(userAgent) {
  let device;

  if (navigator.userAgentData.mobile) {
    return 'mobile';
  }
  userAgent = userAgent.toLowerCase();
  // regexps corresponding to tablets or phones that can be found in userAgent string
  const tabletCheck =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/;
  const phoneCheck =
    /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/;

  // check whether the regexp values corresponds to something in the user agent string
  if (tabletCheck.test(userAgent)) {
    device = 'tablet';
  } else if (phoneCheck.test(userAgent)) {
    device = 'mobile';
  } else {
    device = 'pc';
  }

  // set the device type
  return device;
}

//Get Metadeta
export function getMetaData() {
  let metaData = {};
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent;
    metaData.device = getDevice(userAgent);
    metaData.browser = getBrowser(userAgent);
    metaData.os = getOS(userAgent);
    metaData.language = navigator.language[0];
    return metaData;
  } else {
    return metaData;
  }
}

export function addEvent(element, type, listener) {
  if (typeof element.addEventListener !== 'undefined') {
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

const TXN_REJECT_ERROR_CODES = [4001, -32000, -32603];

export function txnRejected(error) {
  if (TXN_REJECT_ERROR_CODES.includes(error?.code) || error?.message?.match(/rejected|denied transaction/)) return true;
  else return false;
}
