// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from 'monaco-editor';
import * as yarnSpinner from '../../YarnSpinner/yarnSpinnerMonarch';

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
		value: [`
Title: Node Collapse Test
---
woweeeeeeee
===
				
Syntax Highlighting Test
type a Yarn 2.0 keyword:
		
Auto-Closing Brackets Test
try either <<, {, or (.
		
[b]Here is some bold text[\\b]
[u]Here is some underlined text[\\u]
[i]Here is some italicised text[\\i]
`
		].join('\n'),
		language: 'yarnSpinner',
	});
}