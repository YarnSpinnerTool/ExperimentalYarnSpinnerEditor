const path = require('path')

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
		loader: 'ts-loader'
	  }
    ],
  };

const renderConfig = {
  target: 'electron-renderer',
  mode: 'development',
  entry: {
    'render': './src/views/ts/renderer.ts',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  output: {
    globalObject: 'self',
    filename: '[name].render.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: loaders,
  
};

const mainConfig = {
	target: 'electron-main',
	mode: 'development',
	entry: {
	  'main': './src/main.ts',
	  'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
	  'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
	},
	output: {
	  globalObject: 'self',
	  filename: '[name].main.js',
	  path: path.resolve(__dirname, 'dist'),
	},
	module: loaders
  };
  
  const preloadConfig = {
	target: 'electron-preload',
	mode: 'development',
	entry: {
	  'preload': './src/controllers/preload.ts',
	  'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
	  'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
	},
	output: {
	  globalObject: 'self',
	  filename: '[name].preload.js',
	  path: path.resolve(__dirname, 'dist'),
	},
	module: loaders
  };
  module.exports = [renderConfig, preloadConfig, mainConfig]