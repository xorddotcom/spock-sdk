const {
  getStoredIdOrGenerateId,
  getCoordinates,
  getMetaData,
  getTimestamp,
} = require("../utils/index.js");

let timeSpentOnSite;
let reference;
let outboundLink;
let timerEnd;
let sessionExpire=false;
let timer;
let timerStart;
let inactivityCounter = 0;
let inactivityTime = 6;
let trackTime = false;
const page = [];
function getTimeSpentOnSite() {
  let timeSpentOnSite = parseInt(localStorage.getItem("timeSpentOnSite"));
  timeSpentOnSite = isNaN(timeSpentOnSite) ? 0 : timeSpentOnSite;
  return timeSpentOnSite;
}
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
  reference = document.referrer;
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
  let date = sessionStorage.getItem("session_started");
  const timeSpentOnSite = localStorage.getItem("timeSpentOnSite");
  console.log("Session expired");
  sessionExpire=true;
  clearInterval(timerEnd);
  sessionStorage.removeItem("session_started");
  localStorage.removeItem("timeSpentOnSite");
};
//Add any events you want to track
const add_event = function (element, type, listener) {
  element.addEventListener(type, listener, false);
};

function start_time() {
    timerStart = Date.now();
    if (!trackTime && hidden !== 'msHidden') {
      timer = setInterval(function () {
        timeSpentOnSite = getTimeSpentOnSite() + (Date.now() - timerStart);
        localStorage.setItem("timeSpentOnSite", timeSpentOnSite);
        timerStart = parseInt(Date.now());
        // Convert to seconds
        console.log(parseInt(timeSpentOnSite / 1000));
      }, 1000);
    }
  }
//Track Sessions
const track_sessions = function () {
 // manage sessions on window visibility events
 let hidden=false ;

  begin_session();
  console.log("start time track_sessions");
  start_time();

  // Handle visibility change events
  function onchange() {
    if (document[hidden]) {
      console.log("Hidden or not focused");
      clearInterval(timer);
    } else {
      console.log("Focused");
      console.log("start time onchange else");
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
      trackTime = false;
      console.log("start time resetInactivity");
      start_time();
      inactivityCounter = 0;
      track_user_inactivity();
    }
  }
  add_event(window, "mousemove", resetInactivity);
  add_event(window, "click", resetInactivity);
  add_event(window, "keydown", resetInactivity);
  add_event(window, "scroll", resetInactivity);
  add_event(window, "beforeunload", end_session);
  // track user inactivity
const track_user_inactivity = function () {
    timerEnd = setInterval(function () {
        inactivityCounter++;
        if (inactivityCounter >= inactivityTime) {
          console.log(
            "You have been inactive for " + inactivityCounter * 3 + " seconds." + sessionExpire
          );
          clearInterval(timer);
          end_session();
        }
      }, 5000);
  }
  track_user_inactivity();
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
const link = [];
const track_outbound_links = function () {
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      const links = document.querySelectorAll("a");
      links.forEach(function (link) {
        if (link.hostname !== window.location.hostname) {
          link.addEventListener("click", function (e) {
            // e.preventDefault();
             outboundLink = link.href;
            console.log("Send Request To Server", outboundLink); //Send Request To Server
            console.log("Outbound Link", outboundLink);
          });
        }
      });
    },
    false
  );
};
class Web2Analytics {
  constructor() {
    this.trackSessions= track_sessions;
    this.getCoordinates = getCoordinates;
    this.getMetaData = getMetaData;
    this.TrackPageView = track_page_view;
    this.TrackPageNavigation = track_page_navigation;
    this.TrackOutboundLinks = track_outbound_links;
  }
}

module.exports = Web2Analytics;
