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

/*  ~~IMPORTANT~~
	IPC Main console.log output will be in the VSCode terminal
	IPC Renderer console.log output will be in the developer tools window in the actual Electron client
*/



/*
TODO

SENDERS
- File read
- File write


LISTENERS
- File read
- File write (save / save as)
- Menu events






*/



// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as monaco from "monaco-editor";
import * as yarnSpinner from "../../YarnSpinner/yarnSpinnerMonarch";
import { ipcRenderer } from "electron";

const openFiles: FileClass[] = [];
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

const saveFileIcon = document.getElementById("saveFileIcon");

if (saveFileIcon) 
{
    saveFileIcon.onclick = () => {saveAsEmitter();};
}

const newFileIcon = document.getElementById("newFileIcon");
if (newFileIcon)
{
    newFileIcon.onclick = function ()
    {
        createNewFile();
    };
}

const openFolderIcon = document.getElementById("openFolderIcon");
if (openFolderIcon)
{
    openFolderIcon.onclick = function ()
    {
        openFileEmitter();
    };
}

/**
 * Creates a new file and shows it in the display.
 * 
 * @returns {void}
 */
function createNewFile() 
{
    console.log("IN CREATE NEW FILE");
    const newFile:FileClass = new FileClass(null, null, null, false);
    openFiles.push(newFile);
    addFileToDisplay(newFile);
    editor.setValue(newFile.contents);
}

/**
 * Creates and appends the HTML required for showing a new file.
 * 
 * @param {FIleClass} file The file to add to the display.
 * 
 * @returns {void}
 */
function addFileToDisplay(file: FileClass) : void 
{
    console.log("ADDING FILE TO DISPLAY");
    const para = document.createElement("p");
    para.textContent = file.getName();
    const fileListElement = document.getElementById("workingFilesDetail");
	
    if(fileListElement) 
    {	
        fileListElement.appendChild(para);
        console.log("JUST APPENED");
    }
    else 
    {
        console.error("OpenFileError: Cannot append file to display list");
    }
}


/*
	******************************************************************************************************************
										IPCRenderer Listeners and Emitters                                                                                                                                                                                            
	******************************************************************************************************************
*/

/*
	------------------------------------
				LISTENERS
	------------------------------------
*/

ipcRenderer.on("openFile", (event, path, contents, name) => 
{
    if(!name) 
    {
        name = "New File";
    }
	
    const openedFile = new FileClass(path, contents, name, true);
    openFiles.push(openedFile);
    addFileToDisplay(openedFile);
    editor.setValue(openedFile.getContents());
});


ipcRenderer.on("fileSaveResponse", (event, arg) => 
{
    if (arg) 
    {
        alert("File successfully");
    }
    else 
    {
        alert("File save error occured");
    }
});

ipcRenderer.on("mainRequestSaveAs", () => 
{
    saveAsEmitter();
});

ipcRenderer.on("mainRequestNewFile", () => 
{
    console.log("REQUEST RECIEVED FROM MAIN");
    createNewFile();
});

ipcRenderer.on("gotPing", (event, arg) => 
{
    console.log("RESPONSE RECIEVED");
    console.log(arg);//Should be pong
});



/*
	------------------------------------
				EMITTERS
	------------------------------------
*/

/*
	FORMAT:
		EVENT LISTENER (EVENT, => {
			ipcRenderer.send(CHANNEL, ARGS)
		})
*/

/**
 * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
 * 
 * @returns {void}
 */
function saveAsEmitter() 
{
    ipcRenderer.send("fileSaveAsToMain", null, editor.getValue().toString());
}

/**
 * Emits an event to request that main opens a file.
 * 
 * @returns {void}
 */
function openFileEmitter() 
{
    ipcRenderer.send("fileOpenToMain");
}

// ipcRenderer.send('fileOpenToMain', 'ping');
// ipcRenderer.send('fileSaveAsToMain', 'ping');
// ipcRenderer.send('fileSaveToMain', 'ping');

// ipcRenderer.send('getPing','ping');









/*
	--------------------------------------------------
		THIS NEEDS TO BE MOVED TO ANOTHER FILE
		STAYING HERE FOR NOW BC WEBPACK ISSUES
	--------------------------------------------------
*/

export interface YarnFile
{
    filePath: string | null;
    fileName: string;
    contents: string;
    isSaved: boolean;
    getName(): string;
    getSaved(): boolean;
}

export class FileClass implements YarnFile
{
    filePath: string | null;
    fileName: string;
    contents: string;
    isSaved: boolean;
	
    constructor(filePath: string | null, contents:string|null, name: string|null, isSaved: boolean|null)
    {
        this.filePath = filePath ? filePath : null;
        this.fileName = name ? name : "New File";
        this.contents = contents ? contents : "";
        this.isSaved = isSaved ? true : false;
    }

    getName():string
    {
        return this.fileName;
    }
	
    getContents():string
    {
        return this.contents;
    }

    getSaved():boolean
    {
        if(this.isSaved != undefined)
        {
            return this.isSaved;
        }
        else
        {
            alert("Failed to get saved.  Does file not exist?");
            return false;
        }
    }
}