const path = require('path')
const {merge} = require('webpack-merge')

const loaders = {
    rules: [
      {
        test: /\.css$/,
        loader: 'css-loader',
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
	  {
		test: /\.ts$/,
		exclude: [/node_modules/],
		loader: 'ts-loader',
		options: {
			transpileOnly: true,
			experimentalWatchApi: true,
		  },
	  }
    ],
  };
  
const commonConfig = { 
	mode: 'development',
}

const renderConfig = merge(commonConfig, {
  target: 'electron-renderer',
  entry: {
    'render': './src/views/ts/renderer.ts',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  output: {
    globalObject: 'self',
	filename: (chunkData) => {
		switch (chunkData.chunk.name) {
			case 'editor.worker':
				return 'editor.worker.js';
			default:
				return '[name].render.js';
		}
	},
    // filename: '[name].render.js',
    path: path.resolve(__dirname, 'dist'),
	pathinfo: false
  },
  module: loaders,
  
});

const mainConfig = merge(commonConfig, {
	target: 'electron-main',
	entry: {
	  'main': './src/main.ts',
	},
	output: {
	  globalObject: 'self',
	  filename: '[name].main.js',
	  path: path.resolve(__dirname, 'dist'),
	  pathinfo: false
	},
	module: loaders
  });
  
  module.exports = [renderConfig, mainConfig]