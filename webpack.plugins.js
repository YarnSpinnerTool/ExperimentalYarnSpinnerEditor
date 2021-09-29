const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    ELECTRON_AVAILABLE: JSON.stringify(true),
  })
];
