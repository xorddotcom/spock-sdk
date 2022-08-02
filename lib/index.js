const Web2Analytics = require("../modules/web2Analytics.js");
const {getStoredIdOrGenerateId} = require("./utils/index.js");


//Track User
var track_user = function () {
  const   userId = getStoredIdOrGenerateId();
   const user= sessionStorage.getItem("device_id");
  if (!user) {
    console.log("User is visiting for the first time");
  }
};


class Web3AnalyticsTest {
  constructor() {
    var _this = this;
    this.Web2 = Web2Analytics;
  }

}

Web3AnalyticsTest.Web2 = Web2Analytics;
module.exports = Web3AnalyticsTest;
