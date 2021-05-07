// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from 'monaco-editor';
import * as yarnSpinner from '../../YarnSpinner/yarnSpinnerMonarch';
import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';

let editor: monaco.editor.IStandaloneCodeEditor;
if(document!) {

	//Register our new custom language
	monaco.languages.register({id: 'yarnSpinner'});
	//set the tokeniser
	monaco.languages.setMonarchTokensProvider('yarnSpinner', yarnSpinner.tokens);
	//set the configuration
	monaco.languages.setLanguageConfiguration('yarnSpinner', yarnSpinner.config);
	//set the completions NOT WORKING CURRENTLY
	monaco.languages.registerCompletionItemProvider('yarnSpinner', yarnSpinner.completions);

	monaco.editor.defineTheme('yarnSpinnerTheme', yarnSpinner.theme);
	// @ts-ignore
	self.MonacoEnvironment = {
		getWorkerUrl: function (moduleId: String, label: String) {
			if (label === 'typescript' || label === 'javascript') {
				return '../dist/ts.worker.render.js';
			}
			return '../dist/editor.worker.js';
		}
	};

	editor = monaco.editor.create(document.getElementById('container')!, {
		theme: 'yarnSpinnerTheme',
		value: "".toString(),
		language: 'yarnSpinner',
		automaticLayout: true,
		fontFamily: "Courier New",
		fontSize: 14,
		mouseWheelZoom: true,
        wordWrap: "on"
	});

	document.getElementById("fileSymbol")!.onclick = function openFileFromWindow() {
		var selected = electron.remote.dialog.showOpenDialog(
		electron.remote.getCurrentWindow(),	// io dialog dimensions
		{ 
			filters: [{ name: 'Yarn file', extensions: ['txt', 'yarn']}],
			properties: ['openFile', 'createDirectory'], 
			defaultPath: path.join(__dirname, "/Test.txt")	//!change before release!
		});
		
		selected.then(result => {
			var contents = fs.readFileSync(result.filePaths[0]).toString();
			editor.setValue(contents);
		});
	};
}