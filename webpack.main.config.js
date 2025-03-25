const path = require('path');

module.exports = {
  entry: './main.js',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'electron.js'
  },
  node: {
    __dirname: false
  },
  mode: 'production'
};  