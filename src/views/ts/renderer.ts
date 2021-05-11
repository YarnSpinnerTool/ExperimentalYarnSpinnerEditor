/*
Copyright (c) 2021 Yarn Spinner Editor Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from "monaco-editor";
import * as yarnSpinner from "../../YarnSpinner/yarnSpinnerMonarch";
import * as fs from "fs";
import * as path from "path";
import * as electron from "electron";

let editor: monaco.editor.IStandaloneCodeEditor;

//Register our new custom language
monaco.languages.register({ id: "yarnSpinner" });
//set the tokeniser
monaco.languages.setMonarchTokensProvider("yarnSpinner", yarnSpinner.tokensWIP);
//set the configuration
monaco.languages.setLanguageConfiguration("yarnSpinner", yarnSpinner.config);
//set the completions NOT WORKING CURRENTLY
monaco.languages.registerCompletionItemProvider("yarnSpinner", yarnSpinner.completions);

monaco.editor.defineTheme("yarnSpinnerTheme", yarnSpinner.theme);

const containerElement = document.getElementById("container");

if (containerElement) 
{
    editor = monaco.editor.create(containerElement, {
        theme: "yarnSpinnerTheme",
        value: "".toString(),
        language: "yarnSpinner",
        automaticLayout: true,
        fontFamily: "Courier New",
        fontSize: 14,
        mouseWheelZoom: true,
        wordWrap: "on"
    });
}

const folderIcon = document.getElementById("openFolderIcon");

if (folderIcon) 
{
    folderIcon.onclick = function () 
    {
        alert("Tester");

        const openFileResult = electron.remote.dialog.showOpenDialog(
            electron.remote.getCurrentWindow(),
            {
                filters: [{ name: "Yarn file", extensions: ["txt", "yarn"] }],
                properties: ["openFile", "createDirectory"],
                defaultPath: path.join(__dirname, "/Test.txt")	//!change before release!
            });

        openFileResult.then(result => 
        {
            const contents = fs.readFileSync(result.filePaths[0]).toString();
            editor.setValue(contents);
        });
    };
}


const saveFileIcon = document.getElementById("saveFileIcon");

if (saveFileIcon) 
{
    saveFileIcon.onclick = function () 
    { //!if you use this remember to delete file from repo before push!

        const saveFileResult = electron.remote.dialog.showSaveDialog(
            electron.remote.getCurrentWindow(),
            {
                filters: [{ name: "Yarn file", extensions: ["yarn"] },
                    { name: "Text file", extensions: ["txt"] }],
                defaultPath: __dirname
            });

        saveFileResult.then(result => 
        {
            // Make sure user didn't cancel.
            if (result.filePath) 
            {
                fs.writeFileSync(result.filePath, editor.getValue());
            }
        });
    };
}
