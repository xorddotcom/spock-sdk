const { getStoredIdOrGenerateId,getCoordinates,getMetaData } = require("../utils/index.js");
let timeSpentOnSite;
function getTimeSpentOnSite() {
    timeSpentOnSite = parseInt(localStorage.getItem("timeSpentOnSite"));
    timeSpentOnSite = isNaN(timeSpentOnSite) ? 0 : timeSpentOnSite;
    return timeSpentOnSite;
  }
const page = [];
let timer;
let timerStart;
let inactivityCounter = 0;
let inactivityTime = 100;
timeSpentOnSite = getTimeSpentOnSite();
//Track User
const track_user = function () {
  const user = localStorage.getItem("device_id");
  console.log("User", user);
  if (!user) {
    const userId = getStoredIdOrGenerateId();
    console.log("User is visiting for the first time");
  }
};

//Begin Session
const begin_session = function () {
  const date = Date.now();
  track_user();
  if (sessionStorage.getItem("session_started")) {
    console.log("Session already started");

    sessionStorage.setItem("session_started", date);
  } else {
    console.log("Session started");
    sessionStorage.setItem("session_started", date);
  }
};
//End Session
const end_session = function () {
  let date = (date = sessionStorage.getItem("session_started"));
  const timeSpentOnSite = localStorage.getItem("timeSpentOnSite");
  console.log("Session expired");
  sessionStorage.removeItem("session_started");
  localStorage.removeItem("timeSpentOnSite");
};
//Add any events you want to track
const add_event = function (element, type, listener) {
  element.addEventListener(type, listener, false);
};

//Track Sessions
const track_sessions = function () {
 
  

  function start_time() {
    timerStart = Date.now();
    timer = setInterval(function () {
      timeSpentOnSite = getTimeSpentOnSite() + (Date.now() - timerStart);
      localStorage.setItem("timeSpentOnSite", timeSpentOnSite);
      timerStart = parseInt(Date.now());
      // Convert to seconds
    //   console.log(parseInt(timeSpentOnSite / 1000));
    }, 1000);
  }
  begin_session();
  start_time();
  // manage sessions on window visibility events
  const hidden = "hidden";

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
  add_event(window, "beforeunload", end_session);
  // track user inactivity
  setInterval(function () {
    inactivityCounter++;
    if (inactivityCounter >= inactivityTime) {
    //   console.log(
    //     "You have been inactive for " + inactivityCounter * 3 + " seconds."
    //   );
      clearInterval(timer);
      end_session();
    }
  }, 3000);
};

//Track Page View
const track_page_view = function (page) {
  if (!page) {
    page = window.location.pathname;
    console.log("Page not provided, using current page", page);
  } else {
    page = page;
    console.log("Page provided", page);
  }
};
//Track Page Navigation
const track_page_navigation = function () {
  const visit = window.location.pathname;
  if (visit) {
    page.push(visit);
    console.log("Page Navigation", page);
  }
};

//Track Outbound Links
const link=[];
const track_outbound_links = function () {
  const outbound = document.querySelectorAll("a[href^='http']");
  for (let i = 0; i < outbound.length; i++) {
    outbound[i].addEventListener("click", function (e) {
      e.preventDefault();
       link.push(outbound[i]);
      console.log("Outbound Link", link);
    });
  }
}

class Web2Analytics {
  constructor() {
    this.trackSessions = track_sessions;
    this.getCoordinates = getCoordinates;
    this.getMetaData = getMetaData;
    this.TrackPageView = track_page_view;
    this.TrackPageNavigation = track_page_navigation;
    this.TrackOutboundLinks = track_outbound_links;
  }
}

module.exports = Web2Analytics;
