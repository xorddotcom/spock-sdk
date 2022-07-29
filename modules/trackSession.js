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

function startSession() {
  timerStart = Date.now();
  timer = setInterval(function () {
    timeSpentOnSite = getTimeSpentOnSite() + (Date.now() - timerStart);
    localStorage.setItem("timeSpentOnSite", timeSpentOnSite);
    timerStart = parseInt(Date.now());
    // Convert to seconds
    console.log(parseInt(timeSpentOnSite / 1000));
  }, 1000);
}
// var stopCountingWhenWindowIsInactive = true;

// if (stopCountingWhenWindowIsInactive) {
//   if (typeof document.hidden !== "undefined") {
//     var hidden = "hidden",
//       visibilityChange = "visibilitychange",
//       visibilityState = "visibilityState";
//   } else if (typeof document.msHidden !== "undefined") {
//     var hidden = "msHidden",
//       visibilityChange = "msvisibilitychange",
//       visibilityState = "msVisibilityState";
//   }
//   var documentIsHidden = document[hidden];

//   document.addEventListener(visibilityChange, function () {
//     if (documentIsHidden != document[hidden]) {
//       if (document[hidden]) {
//         // Window is inactive
//         clearInterval(timer);
//       } else {
//         // Window is active
//         startSession();
//       }
//       documentIsHidden = document[hidden];
//     }
//   });
// }
// /**
//  *  Reset inactivity counter and time
//  */
//  function resetInactivity() {
//     if (inactivityCounter >= inactivityTime) {
//         startSession();
//     }
//     inactivityCounter = 0;
// }

// add_event(window, "mousemove", resetInactivity);
// add_event(window, "click", resetInactivity);
// add_event(window, "keydown", resetInactivity);
// add_event(window, "scroll", resetInactivity);

// // track user inactivity
// setInterval(function() {
//     inactivityCounter++;
//     if (inactivityCounter >= inactivityTime) {
//         console.log("You have been inactive for " + (inactivityCounter * 3)  + " seconds.");
//         clearInterval(timer);
//     }
// }, 3000);
var track_sessions = function () {
    startSession();
   // manage sessions on window visibility events
   var hidden = "hidden";

   /**
    *  Handle visibility change events
    */
   function onchange() {
       if (document[hidden] || !document.hasFocus()) {
        console.log("Hidden or not focused");
           clearInterval(timer);;
       }
       else {
        console.log("Focused");
        startSession();
       }
   }

   // add focus handling eventListeners
   add_event(window, "focus", onchange);
   add_event(window, "blur", onchange);

   // newer mobile compatible way
   add_event(window, "pageshow", onchange);
   add_event(window, "pagehide", onchange);

   // IE 9 and lower:
   if ("onfocusin" in document) {
       add_event(window, "focusin", onchange);
       add_event(window, "focusout", onchange);
   }

   // Page Visibility API for changing tabs and minimizing browser
   if (hidden in document) {
       document.addEventListener("visibilitychange", onchange);
   }
   else if ("mozHidden" in document) {
       hidden = "mozHidden";
       document.addEventListener("mozvisibilitychange", onchange);
   }
   else if ("webkitHidden" in document) {
       hidden = "webkitHidden";
       document.addEventListener("webkitvisibilitychange", onchange);
   }
   else if ("msHidden" in document) {
       hidden = "msHidden";
       document.addEventListener("msvisibilitychange", onchange);
   }
  };

  
module.exports = track_sessions;

