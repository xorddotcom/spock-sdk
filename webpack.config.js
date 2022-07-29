const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test-sdk-saad.min.js',
    library: 'Web3AnalyticsTest',
    libraryTarget: 'umd',

  },
};
