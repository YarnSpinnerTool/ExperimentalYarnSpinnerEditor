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
	monaco.languages.setMonarchTokensProvider('yarnSpinner', yarnSpinner.tokensWIP);
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
		value: [
`#File tag
//File Comment

Title: GeneralTest
Header: tagOne
//Header comment
---
//Body Comment
#File tags are only available at the start of the file

Cullie: This node is foldable to the left of "---"
Cullie: So that large amounts of text can be hidden.

Cullie: Interpolation is done like {$test} that.

Cullie: You can use BBCode tags to stylise your text.
Cullie: [b]Like this[\\b], [i]this[\\i], or [u]this[\\u]. 
===

Title: autoCompleteTest
Header: tagTwo
---
Seth: Try typing out if... then press tab.

===
`
		].join('\n'),
		language: 'yarnSpinner',
		automaticLayout: true,
		fontFamily: "Courier New",
		fontSize: 14,
		mouseWheelZoom: true,
        wordWrap: "on"
	});


}