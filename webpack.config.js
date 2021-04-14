const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const commonConfig = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  }
}

module.exports = [
	Object.assign(
	  {
		target: 'electron-main',
		entry: { main: './main.ts' }
	  },
	  commonConfig),
	Object.assign(
	  {
		target: 'electron-renderer',
		entry: { gui: './src/views/ts/renderer.ts' },
		// plugins: [new HtmlWebpackPlugin()]
	  },
	  commonConfig)
  ]