const path = require('path');
const slsw = require('serverless-webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
entry: './handler.js',
   target: 'node',
   externals: [nodeExternals()],
   output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  }
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: __dirname
    }]
  },
};
