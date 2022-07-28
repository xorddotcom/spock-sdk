//Can Import Functions Here from other files
const hexGenerator = require('../modules/hexGenerator.js');
var  Web3Analytics= function TestSdk() {
        var _this = this;
        this.hexGenerator = hexGenerator;
}

Web3Analytics.hexGenerator = hexGenerator;
module.exports=Web3Analytics