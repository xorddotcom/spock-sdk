const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'analytics.min.js',
    library: 'Web3Analytics',
    libraryTarget: 'umd',

  },
};
