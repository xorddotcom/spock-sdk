//Can Import Functions Here from other files
// const hexGenerator = require('../modules/hexGenerator.js');
const track_sessions = require("../modules/trackSession.js");
var  Web3AnalyticsTest= function Web3AnalyticsTest() {
        var _this = this;
        this.track=track_sessions;
}

Web3AnalyticsTest.track=track_sessions;
module.exports=Web3AnalyticsTest