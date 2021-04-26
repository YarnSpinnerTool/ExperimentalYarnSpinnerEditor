// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from 'monaco-editor';
if(document!) {
	// @ts-ignore
	self.MonacoEnvironment = {
		getWorkerUrl: function (moduleId: String, label: String) {
			if (label === 'typescript' || label === 'javascript') {
				return '../dist/ts.worker.render.js';
			}
			return '../dist/editor.worker.js';
		}
	};
	monaco.editor.defineTheme('yarnSpinnerTheme', {
		base: 'vs',
		inherit: true,
		rules: [{ background: 'EDF9FA' }],
		colors: {
			'editor.foreground': '#000000',
			'editor.background': '#EDF9FA',
			'editorCursor.foreground': '#8B0000',
			'editor.lineHighlightBackground': '#0000FF20',
			'editorLineNumber.foreground': '#008800',
			'editor.selectionBackground': '#88000030',
			'editor.inactiveSelectionBackground': '#88000015'
		}
	});
	monaco.editor.create(document.getElementById('container')!, {
		theme: 'yarnSpinnerTheme',
		value: [].join('\n'),
		language: 'typescript',
		automaticLayout: true,
		fontFamily: "Arial",
		fontSize: 20
	});
}