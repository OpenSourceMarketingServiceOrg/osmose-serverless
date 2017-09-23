module.exports = {
  entry: './handler.js',
  target: 'node',
  externals: ["aws-sdk", "babel-runtime"] // exclude external modules
};
