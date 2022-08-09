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

//Get Co-Ordinates
export function getCoordinates() {
  let coords = {};
  function showPosition(position) {
    coords.latitude = position.coords.latitude;
    coords.longitude = position.coords.longitude;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    coords.latitude = 'Geolocation is not supported by this browser';
    coords.longitude = 'Geolocation is not supported by this browser';
  }
  return coords;
}

//Useragent Device Detection
export function userAgentDeviceDetection(uaOverride) {
  let userAgent;
  // TODO: refactor here
  if (uaOverride) {
    userAgent = uaOverride;
  } else if (navigator.userAgentData.mobile) {
    return 'phone';
  } else {
    userAgent = uaOverride;
  }
  // make it lowercase for regex to work properly
  userAgent = userAgent.toLowerCase();

  // assign the default device
  let device = 'desktop';

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
  }

  // set the device type
  return device;
}

//Get Metadeta
export function getMetaData() {
  let metaData = {};
  metaData.userAgent = navigator.userAgent;
  metaData.device = userAgentDeviceDetection(metaData.userAgent);
  metaData.language = navigator.language[0];
  return metaData;
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
