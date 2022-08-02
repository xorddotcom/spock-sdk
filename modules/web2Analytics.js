//Get Co-Ordinates
var getCoordinates = function () {
  var coords = {};
  function showPosition(position) {
    coords.latitude = position.coords.latitude;
    coords.longitude = position.coords.longitude;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    coords.latitude = "Geolocation is not supported by this browser";
    coords.longitude = "Geolocation is not supported by this browser";
  }
  return coords;
};

//Useragent Device Detection
function userAgentDeviceDetection(uaOverride) {
  var userAgent;
  // TODO: refactor here
  if (uaOverride) {
    userAgent = uaOverride;
  } else if (navigator.userAgentData.mobile) {
    return "phone";
  } else {
    userAgent = uaOverride;
  }
  // make it lowercase for regex to work properly
  userAgent = userAgent.toLowerCase();

  // assign the default device
  var device = "desktop";

  // regexps corresponding to tablets or phones that can be found in userAgent string
  var tabletCheck =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/;
  var phoneCheck =
    /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/;

  // check whether the regexp values corresponds to something in the user agent string
  if (tabletCheck.test(userAgent)) {
    device = "tablet";
  } else if (phoneCheck.test(userAgent)) {
    device = "mobile";
  }

  // set the device type
  return device;
}

//Get Metadeta
var getMetaData = function () {
  var metaData = {};
  metaData.userAgent = navigator.userAgent;
  metaData.device = userAgentDeviceDetection(metaData.userAgent);
  metaData.language = navigator.language[0];
  return metaData;
};

//Begin Session
var begin_session = function () {
  if (sessionStorage.getItem("session_started")) {
    console.log("Session already started");
    var date = Date.now();
    sessionStorage.setItem("session_started", date);
  } else {
    console.log("Session started");
    var date = Date.now();
    sessionStorage.setItem("session_started", date);
  }
};
//End Session
var end_session = function () {
  var date = (date = sessionStorage.getItem("session_started"));
  var timeSpentOnSite = localStorage.getItem("timeSpentOnSite");
  console.log("Session expired");
  sessionStorage.removeItem("session_started");
  localStorage.removeItem("timeSpentOnSite");
};

//Track Sessions
var track_sessions = function () {
  var timer;
  var timerStart;
  var timeSpentOnSite = getTimeSpentOnSite();
  var inactivityCounter = 0;
  var inactivityTime = 10;
  var add_event = function (element, type, listener) {
    element.addEventListener(type, listener, false);
  };
  function getTimeSpentOnSite() {
    timeSpentOnSite = parseInt(localStorage.getItem("timeSpentOnSite"));
    timeSpentOnSite = isNaN(timeSpentOnSite) ? 0 : timeSpentOnSite;
    return timeSpentOnSite;
  }

  function start_time() {
    timerStart = Date.now();
    timer = setInterval(function () {
      timeSpentOnSite = getTimeSpentOnSite() + (Date.now() - timerStart);
      localStorage.setItem("timeSpentOnSite", timeSpentOnSite);
      timerStart = parseInt(Date.now());
      // Convert to seconds
      console.log(parseInt(timeSpentOnSite / 1000));
    }, 1000);
  }
  begin_session();
  start_time();
  // manage sessions on window visibility events
  var hidden = "hidden";

  /**
   *  Handle visibility change events
   */
  function onchange() {
    if (document[hidden]) {
      console.log("Hidden or not focused");
      clearInterval(timer);
    } else {
      console.log("Focused");
      start_time();
    }
  }

  // Page Visibility API for changing tabs and minimizing browser
  if (hidden in document) {
    document.addEventListener("visibilitychange", onchange);
  } else if ("mozHidden" in document) {
    hidden = "mozHidden";
    document.addEventListener("mozvisibilitychange", onchange);
  } else if ("webkitHidden" in document) {
    hidden = "webkitHidden";
    document.addEventListener("webkitvisibilitychange", onchange);
  } else if ("msHidden" in document) {
    hidden = "msHidden";
    document.addEventListener("msvisibilitychange", onchange);
  }
  /**
   *  Reset inactivity counter and time
   */
  function resetInactivity() {
    if (inactivityCounter >= inactivityTime) {
      start_time();
    }
    inactivityCounter = 0;
  }
  add_event(window, "mousemove", resetInactivity);
  add_event(window, "click", resetInactivity);
  add_event(window, "keydown", resetInactivity);
  add_event(window, "scroll", resetInactivity);
  // track user inactivity
  setInterval(function () {
    inactivityCounter++;
    if (inactivityCounter >= inactivityTime) {
      console.log(
        "You have been inactive for " + inactivityCounter * 3 + " seconds."
      );
      clearInterval(timer);
      end_session();
    }
  }, 3000);
};
//Track Page View
var track_page_view = function (page) {
  if (!page) {
    page = window.location.pathname;
    console.log("Page not provided, using current page",page);
  }
  else{
    page = page;
    console.log("Page provided",page);
  }
};

class Web2Analytics {
  constructor() {
    var _this = this;
    this.trackSessions = track_sessions;
    this.getCoordinates = getCoordinates;
    this.getMetaData = getMetaData;
    this.TrackPageView=track_page_view;
  }
}

// Web2Analytics.track=track_sessions;
// Web2Analytics.getCoordinates=getCoordinates;

export default  Web2Analytics;