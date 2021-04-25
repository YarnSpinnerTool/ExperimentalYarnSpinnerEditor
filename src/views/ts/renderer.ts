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
	
	monaco.editor.create(document.getElementById('container')!, {
		theme: 'vs-dark',
		value: [`
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
				return '../../../dist/ts.worker.render.js';
			}
			return '../../../dist/editor.worker.js';
		}
	};
}`
		].join('\n'),
		language: 'typescript',
	});
}