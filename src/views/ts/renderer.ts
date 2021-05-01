// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from 'monaco-editor';
import { yarnSpinnerTokensProvider } from '../../YarnSpinner/yarnSpinnerMonarch';
import { yarnSpinnerConfig } from '../../YarnSpinner/yarnSpinnerMonarch';
import { yarnSpinnerTheme } from '../../YarnSpinner/yarnSpinnerMonarch';
import { yarnSpinnerValue } from '../../YarnSpinner/yarnSpinnerMonarch';

let editor: monaco.editor.IStandaloneCodeEditor;
if(document!) {

	// Look at https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
	monaco.languages.register({id: 'yarnSpinner'});
	monaco.languages.setMonarchTokensProvider('yarnSpinner', yarnSpinnerTokensProvider);
	monaco.languages.setLanguageConfiguration('yarnSpinner', yarnSpinnerConfig);
	monaco.editor.defineTheme('yarnSpinnerTheme', yarnSpinnerTheme);
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