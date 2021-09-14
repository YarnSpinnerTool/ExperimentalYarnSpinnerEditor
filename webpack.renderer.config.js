const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');


const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

plugins.push(
	new CopyWebpackPlugin({
		patterns: [{ from: path.resolve(__dirname, 'assets', 'icons'), to: 'img' }],
	  })
)


rules.push({
	test: /\.css$/,
	use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
}, {
	test: /\.png$/,
	use: [
		{
			loader: 'file-loader',
			options: {
				name: 'img/[name].[ext]',
				publicPath: '../.'
			}
		},
	],
});



module.exports = {
	module: {
		rules,
	},
	plugins: plugins,
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
	},
};
