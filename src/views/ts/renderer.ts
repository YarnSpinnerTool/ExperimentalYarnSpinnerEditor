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

const openFiles = new Map<number, YarnFileClass>();
var currentOpenYarnFile: YarnFileClass;

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


    //Override monaco's default commands to add our own
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I, () => {
        italicText?.click();
    } );

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U, () => {
        underlineText?.click();
    } );

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B, () => {
        boldText?.click();
    } );


    //Editor specific events
    editor.onDidChangeModelContent(e => {

        //Check the currentOpenYarnFile against the editor's value
        if (currentOpenYarnFile.contents == editor.getValue()){
            console.log("they are the same");
            currentOpenYarnFile.isSaved = true;
        }

        else{
            console.log("they are not the same");
            currentOpenYarnFile.isSaved = false;
        }

    });
}

//Working file details specific events
const workingFiles = document.getElementById("workingFilesDetail");

if (workingFiles){

	//console.log("workingFilesExists");

    workingFiles.addEventListener('click', (event) => {
		if(event && event.target && (event.target as HTMLButtonElement).tagName === "BUTTON"){

            //Get file ID information and HTML elements
            var button = (event.target as HTMLButtonElement);
            var parentDiv = button.parentElement;
			var fileIdentifier = Number(parentDiv?.id);
			
			if(Number.isNaN(fileIdentifier) || !parentDiv) {
				console.error("Attempted to remove broken file instance, please file a bug at https://github.com/setho246/YarnSpinnerEditor/issues");
				return;
			}

            //alert("Before delete".concat(openFiles.toString())); //Debug information

            //Remove file from array
			openFiles.delete(fileIdentifier);
			

            //Remove the HTML elements from working files
			parentDiv.parentElement?.removeChild(parentDiv);

            //alert("post delete".concat(openFiles.toString())); //Debug information
        }

        else if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY"){
            var fileIdentifier: number;

            if ((event.target as HTMLElement).tagName === "P") {
				fileIdentifier = Number((event.target as HTMLParagraphElement).parentElement?.id)
			}
            else{
                var divElement = (event.target as HTMLDivElement);
                fileIdentifier = Number(divElement.id);
            }

            // alert(fileIdentifier);

            //Bug checking
            var currentValue = editor.getValue()
			
			var openedFile = openFiles.get(fileIdentifier);
			
			if(openedFile){	
				editor.setValue(openedFile.contents); // Swap to push edit operations? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
				editor.updateOptions({readOnly: false});
			}
                

            // if (currentValue == editor.getValue()){
            //     alert("Didn't work or was same file or is empty file anyway");
            //     //console.log("File not found in working files");
            // }
        }


    });


}

function updateFileObjectContent(file: YarnFileClass) {
	// file = editor.getValue()

    /*
        SETH ----->
                Possibly follow the modelModel class structure of having the array of files be stored within a class

                e.g. yarnFolderModel 
                        arrayOfFiles = something
                        currentFile = file that's in the editor
                    
                        ****Maybe further variable to get the editor for when we split views***

                        getters and setters for stuff

                        method to find matching ID and return matched one?

    */



    /*
        Store current file (current editor value) into current open file (maybe also make into variable itself?)
            Note: This is different to save, it's storing the value as rn we lose all data

        pushEditOperations of new content into the editor (rather than using direct setValue, microsoft says no ewwie yucky)
            range would be entire document
            text would be contents of new file
        
        Set current file, to the file that was changed




    */



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
// window.addEventListener("keydown", (e) =>{
     //No more need for this at this stage
// });



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
    const newFile:YarnFileClass = new YarnFileClass(null, null, null, false, Date.now());
    openFiles.set(newFile.getUniqueIdentifier(), newFile);

    currentOpenYarnFile = newFile;

    addFileToDisplay(newFile);
    editor.setValue(newFile.contents);
}

/**
 * Creates and appends the HTML required for showing a new file.
 * 
 * @param {YarnFIleClass} file The file to add to the display.
 * 
 * @returns {void}
 */
function addFileToDisplay(file: YarnFileClass) : void 
{
	const div = document.createElement("div");
	div.setAttribute("id", file.uniqueIdentifier.toString());
	
	const closeButton = document.createElement("button");
    closeButton.setAttribute("id", file.uniqueIdentifier.toString());
	closeButton.textContent = "x";
	
    const para = document.createElement("p");
    para.textContent = file.getName();
	
	div.appendChild(para);
	div.appendChild(closeButton);
    
	
	const fileListElement = document.getElementById("workingFilesDetail");
	
    if(fileListElement) 
    {	
        fileListElement.appendChild(div);
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
	
	
	
    const openedFile = new YarnFileClass(path, contents, name, true, Date.now());
    openFiles.set(openedFile.getUniqueIdentifier(), openedFile);
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
	uniqueIdentifier: number;
    getName(): string;
    getSaved(): boolean;
}

export class YarnFileClass implements YarnFile
{
    filePath: string | null;
    fileName: string;
    contents: string;
    isSaved: boolean;
	uniqueIdentifier: number;
	
    constructor(filePath: string | null, contents:string|null, name: string|null, isSaved: boolean|null, uniqueIdentifier: number)
    {
        this.filePath = filePath ? filePath : null;
        this.fileName = name ? name : "New File";
        this.contents = contents ? contents : "";
        this.isSaved = isSaved ? true : false;
		this.uniqueIdentifier = uniqueIdentifier;
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

    getUniqueIdentifier():number {
        return this.uniqueIdentifier;
    }
}