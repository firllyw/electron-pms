const path = require('path');

module.exports = {
  // Configure for main process
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.json']
  },
  node: {
    __dirname: false,
    __filename: false
  }
};