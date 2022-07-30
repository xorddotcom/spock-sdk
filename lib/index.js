//Can Import Functions Here from other files
// const hexGenerator = require('../modules/hexGenerator.js');
const Web2Analytics = require("../modules/trackSession.js");
var  Web3AnalyticsTest= function Web3AnalyticsTest() {
        var _this = this;
        this.Web2=Web2Analytics;
}

Web3AnalyticsTest.Web2=Web2Analytics;
module.exports=Web3AnalyticsTest