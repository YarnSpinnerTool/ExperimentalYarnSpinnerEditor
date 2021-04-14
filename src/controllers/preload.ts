// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import * as monaco from 'monaco-editor';
if(document!) {
	monaco.editor.create(document.getElementById('container')!, {
		value: [
			'function x() {',
			'\tconsole.log("Hello world!");',
			'}'
		].join('\n'),
		language: 'javascript'
	});
}

window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element)   {
            element.innerText = text;
        }
    };
  
    for (const type of ["chrome", "node", "electron"]) {
        replaceText(`${type}-version`, String(process.versions[type as keyof NodeJS.ProcessVersions]));
    }
});
  