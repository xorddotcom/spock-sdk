import { logEnums } from './constants';

export function log(debug, level, message) {
  if (debug && typeof console !== 'undefined') {
    // parse the arguments into a string if it is an object
    if (arguments[2] && typeof arguments[2] === 'object') {
      arguments[2] = JSON.stringify(arguments[2]);
    }

    // append level, message and args
    let extraArguments = '';
    for (var i = 3; i < arguments.length; i++) {
      extraArguments += arguments[i];
    }
    const log = level + message + extraArguments;

    switch (level) {
      case logEnums.ERROR:
        console.error(log);
        break;
      case logEnums.WARNING:
        console.warn(log);
        break;
      case logEnums.INFO:
        console.info(log);
        break;
      case logEnums.VERBOSE:
        console.log(log);
        break;
      default:
        console.debug(log);
    }
  }
}

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
 // Operating System Detection
 function getOS(userAgent) {
  let os = "Unknown OS";
  if (userAgent.indexOf("Windows NT 10.0") != -1) {
      os = "Windows 10";
  } else if (userAgent.indexOf("Windows NT 6.2") != -1) {
      os = "Windows 8";
  } else if (userAgent.indexOf("Windows NT 6.1") != -1) {
      os = "Windows 7";
  } else if (userAgent.indexOf("Windows NT 6.0") != -1) {
      os = "Windows Vista";
  } else if (userAgent.indexOf("Windows NT 5.1") != -1) {
      os = "Windows XP";
  } else if (userAgent.indexOf("Windows NT 5.0") != -1) {
      os = "Windows 2000";
  } else if (userAgent.indexOf("Mac") != -1) {
      os = "Mac/iOS";
  } else if (userAgent.indexOf("X11") != -1) {
      os = "UNIX";
  } else if (userAgent.indexOf("Linux") != -1) {
      os = "Linux";
  }
  return os;
}
 //Browser Detection
 function getBrowser(userAgent){
  let browser;
  
  if(userAgent.match(/chrome|chromium|crios/i)){
      browser = "chrome";
    }else if(userAgent.match(/firefox|fxios/i)){
      browser = "firefox";
    }  else if(userAgent.match(/safari/i)){
      browser = "safari";
    }else if(userAgent.match(/opr\//i)){
      browser = "opera";
    } else if(userAgent.match(/edg/i)){
      browser = "edge";
    }else{
      browser="No browser detection";
    }
    return browser;             
}
// Device Detection
function getDevice(userAgent) {
  if (navigator.userAgentData.mobile) {
    return "phone";
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
    }
  
    // set the device type
    return device;
  }

//Get Metadeta
export function getMetaData() {
  let metaData = {};
  metaData.device = getDevice(metaData.userAgent);
  metaData.coordinates = getCoordinates();
  metaData.browser =  getBrowser(metaData.userAgent);
  metaData.os = getOS(metaData.userAgent);
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
