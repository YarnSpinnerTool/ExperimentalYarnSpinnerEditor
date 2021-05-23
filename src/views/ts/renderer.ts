/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
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
import exports from "../../controllers/themeReader.ts";

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

//monaco.editor.defineTheme("yarnSpinnerTheme", yarnSpinner.theme);

//Utilising exports we can get the variable information from themeReader

monaco.editor.defineTheme('customTheme', {
	base: 'vs',
    inherit: true,
    rules: [
        //{ background: 'CFD8DC'},
        
        { token: 'body.bold', fontStyle: 'bold' },
        { token: 'body.underline', fontStyle: 'underline' },
        { token: 'body.italic', fontStyle: 'italic' },
        { token: 'body.commands', foreground : exports.commands },
        { token: 'commands', foreground : exports.commands },
        { token: 'file.tag', foreground : exports.fileTag },
        { token: 'interpolation', foreground : exports.interpolation },
        { token: 'options', foreground : exports.option },
        { token: 'variables', foreground : exports.variables },
        { token: 'float', foreground : exports.float },
        { token: 'number', foreground : exports.number },
        { token: 'yarn.commands', foreground : exports.yarnCommands },
        { token: 'commands.float', foreground : exports.commands },
        { token: 'commands.number', foreground : exports.commands },
        { token: 'commands.operator', foreground: exports.operator },
        { token: 'hashtag', foreground: exports.hashtag },
        { token: 'dialogue', foreground : exports.primary_text }
        ],

    colors: {
        'editor.foreground': exports.primary_text,
        'editor.background': exports.editor,
        'editorCursor.foreground': exports.workingFile,
        'editor.lineHighlightBackground': exports.lineSelection,
        'editorLineNumber.foreground': exports.primary_text,
        'editor.selectionBackground': exports.lineSelection,
        'editor.inactiveSelectionBackground': exports.editor,
        'minimap.background': exports.lineSelection
    }
});

//set css variables
document.documentElement.style.setProperty(`--editor`, exports.editor);
document.documentElement.style.setProperty(`--topSideEdit`, exports.editor);
document.documentElement.style.setProperty(`--workingFile`, exports.workingFile);
document.documentElement.style.setProperty(`--tabGap`, exports.tabGap);
document.documentElement.style.setProperty(`--dividerColour`, exports.divideColour);
document.documentElement.style.setProperty(`--primary_text`, exports.primary_text);
document.documentElement.style.setProperty(`--secondary_text`, exports.secondary_text);


const containerElement = document.getElementById("container");


if (containerElement) 
{
    editor = monaco.editor.create(containerElement, {
        //theme: "yarnSpinnerTheme",
        theme: "customTheme",
        value: "".toString(),
        language: "yarnSpinner",
        automaticLayout: true,
        fontFamily: "Courier New",
        fontSize: 14,
        mouseWheelZoom: true,
        wordWrap: "on"
    });
}



const workingFiles = document.getElementById("workingFilesDetail");

if (workingFiles){
    
    var childrenOfWF = workingFiles.children;


}



/*
    Generic function for inserting at the front and the end of a selection
*/
function wrapTextWithTag(textFront: String, textBack: String){

        var selection = editor.getSelection() as monaco.IRange;
        var selectFront = new monaco.Selection(selection.startLineNumber, selection.startColumn, selection.startLineNumber, selection.startColumn);
        var selectBack = new monaco.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);


        var frontString = textFront.concat("");//Needs to concat an empty character in order to set the cursor properly

        //In this order, so when nothing is selected, textFront is prepended after textBack is inserted
        editor.focus();//Set focus back to editor

        editor.executeEdits("", [{range: selectBack, text: textBack as string}]);//Set textBack
        editor.setPosition(new monaco.Position(selectFront.startLineNumber, selectFront.startColumn));//reset cursor to behind textFront input
        editor.executeEdits("", [{range: selectFront, text: frontString as string}]);//Set textFront
        editor.setSelection(new monaco.Selection(selection.startLineNumber, selection.startColumn + frontString.length, selection.startLineNumber, selection.startColumn + frontString.length));
        //Reset collection to an empty range
}


//Set selection to BOLD
const boldText = document.getElementById("boldTextIcon");
if (boldText){
    boldText.onclick = () => { wrapTextWithTag("[b]", "[\\b]"); };
}

//Set selection to Italics
const italicText = document.getElementById("italicTextIcon");
if (italicText){
    italicText.onclick = () => { wrapTextWithTag("[i]", "[\\i]"); };
}

//Set selection to Underline
const underlineText = document.getElementById("underlineTextIcon");
if (underlineText){
    underlineText.onclick = () => { wrapTextWithTag("[u]", "[\\u]"); };
}

//TODO Set selection to selected colour 
const colourPick = document.getElementById("colourPicker");
if (colourPick){
    colourPick.onchange = () => {
        var value = (colourPick as HTMLInputElement).value;

        var startText = "[col=\'".concat(value.substr(1)).concat("\']");
        var endText = "[\\col]";

        wrapTextWithTag(startText, endText);
        editor.focus();
    }
}

//Listen for editor commands
window.addEventListener("keydown", (e) =>{
    if (e.ctrlKey && e.key === "b"){
        boldText?.click();//send bold click event
    }

    //TODO remove the monaco commands that use these command combinations
    // if (e.ctrlKey && e.key === "i"){
    //     italicText?.click();
    // }

    // if (e.ctrlKey && e.key === "u"){
    //     underlineText?.click();
    // }
});



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