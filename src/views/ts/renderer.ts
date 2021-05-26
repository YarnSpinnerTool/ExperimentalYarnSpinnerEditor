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

//TODO Temporary classes location
//!----------------------------------------------------------------------------------------------------------------------------------

/*
	--------------------------------------------------
		THIS NEEDS TO BE MOVED TO ANOTHER FILE
		STAYING HERE FOR NOW BC WEBPACK ISSUES
	--------------------------------------------------
*/

export class YarnFile 
{
	private filePath: string | null;
	private fileName: string;
	private contents: string;
	private contentsOnDisk: string;
	private uniqueIdentifier: number;

	constructor(filePath: string | null, contents: string | null, name: string | null, uniqueIdentifier: number) 
	{
	    this.filePath = filePath ? filePath : null;
	    this.fileName = name ? name : "New File";
	    this.contents = contents ? contents : "";
	    this.contentsOnDisk = contents ? contents : "";
	    this.uniqueIdentifier = uniqueIdentifier;
	}

	//Getters
	getPath(): string | null 
	{
	    return this.filePath;
	}

	getName(): string 
	{
	    return this.fileName;
	}

	getContents(): string 
	{
	    return this.contents;
	}

	getSaved(): boolean 
	{
	    return this.getContents() === this.contentsOnDisk;
	}

	getUniqueIdentifier(): number 
	{
	    return this.uniqueIdentifier;
	}

	//Setters
	setFilePath(filePath: string): void 
	{
	    this.filePath = filePath;
	}

	setName(name: string): void 
	{
	    this.fileName = name;
	}

	setContents(contents: string): void 
	{
	    this.contents = contents;
	}

	//Functions
	fileSaved(): void 
	{
	    this.contentsOnDisk = this.contents;
	}

}

export class YarnFileManager 
{
	private openFiles = new Map<number, YarnFile>(); //Number is the representation of the uniqueIdentifier
	private currentOpenYarnFile: YarnFile;

	constructor() 
	{
	    this.currentOpenYarnFile = this.createEmptyFile();
	}

	//Getters 
	getFiles(): Map<number, YarnFile> 
	{
	    return this.openFiles;
	}

	getCurrentOpenFile(): YarnFile 
	{
	    return this.currentOpenYarnFile;
	}

	getYarnFile(yarnIDNumber: number): YarnFile | undefined 
	{
	    return this.openFiles.get(yarnIDNumber);
	}

	//Setters
	setCurrentOpenYarnFile(yarnIDNumber: number): void 
	{
	    const newCurrent = this.openFiles.get(yarnIDNumber);
	    if (newCurrent) 
	    {
	        this.currentOpenYarnFile = newCurrent;
	    }
	}

	//Functions
	addToFiles(newFile: YarnFile): void 
	{
	    this.openFiles.set(newFile.getUniqueIdentifier(), newFile);
	}

	removeFromFiles(yarnIDNumber: number): void 
	{
	    this.openFiles.delete(yarnIDNumber);
	}

	createEmptyFile(): YarnFile 
	{
	    const newFile: YarnFile = new YarnFile(null, null, null, Date.now());
	    this.addToFiles(newFile);
	    this.setCurrentOpenYarnFile(newFile.getUniqueIdentifier());

	    return newFile;
	}
}



//!----------------------------------------------------------------------------------------------------------------------------------


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
import { EventEmitter } from "node:stream";

const yarnFileManager = new YarnFileManager();

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

monaco.editor.defineTheme("customTheme", {
    base: "vs",
    inherit: true,
    rules: [
        //{ background: 'CFD8DC'},
        { token: "body.bold", foreground: exports.default, fontStyle: "bold" },
        { token: "body.underline", foreground: exports.default,  fontStyle: "underline" },
        { token: "body.italic", foreground: exports.default,  fontStyle: "italic" },

        { token: "Commands", foreground: exports.commands},
        { token: "CommandsInternals", foreground: exports.commandsInternal },
        { token: "VarAndNum", foreground: exports.varAndNum },
        { token: "Options", foreground: exports.options },
        { token: "Interpolation", foreground: exports.interpolation },
        { token: "Strings", foreground: exports.strings },
        { token: "Metadata", foreground: exports.metadata },
        { token: "Comments", foreground: exports.comments },
        { token: "Default", foreground: exports.default },
        
        { token: "Invalid", foreground: "#931621"}

    ],

    colors: {
        "editor.foreground": exports.default,
        "editor.background": exports.editor,
        "editorCursor.foreground": exports.invertDefault,
        //"editor.lineHighlightBackground": exports.invertDefault, //Removed from parameter
        "editorLineNumber.foreground": exports.default,
        "editor.selectionBackground": exports.invertDefault,
        "editor.inactiveSelectionBackground": exports.editor,
        "minimap.background": exports.editorMinimap
    }
});

//set css variables
document.documentElement.style.setProperty("--editor", exports.editor);
document.documentElement.style.setProperty("--topSideEdit", exports.editor);
document.documentElement.style.setProperty("--workingFile", exports.workingFile);
document.documentElement.style.setProperty("--tabGap", exports.tabGap);
document.documentElement.style.setProperty("--dividerColour", exports.invertDefault);
document.documentElement.style.setProperty("--primary_text", exports.default);
document.documentElement.style.setProperty("--secondary_text", exports.invertDefault);

const containerElement = document.getElementById("container");

if (!containerElement) 
{
    throw new Error("Container element not found");
}

const editor = monaco.editor.create(containerElement, {
    //theme: "yarnSpinnerTheme",
    theme: "customTheme",
    value: "".toString(),
    language: "yarnSpinner",
    automaticLayout: true,
    fontFamily: "Courier New",
    fontSize: 20,
    mouseWheelZoom: true,
    wordWrap: "on",
    renderLineHighlight: "none"

});

//Instantiate with new empty file
editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());

//Override monaco's default commands to add our own
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I, () => 
{
    italicText?.click();
});

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U, () => 
{
    underlineText?.click();
});

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B, () => 
{
    boldText?.click();
});

//Editor specific events
editor.onDidChangeModelContent(() => 
{
    const workingDetailDiv = document.getElementById( yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString() );

    syncCurrentFile();//Update the contents at each point
    const unsavedIdentifier = "*";//Can change to anything

    if (workingDetailDiv) 
    {
        const paraElementContent = workingDetailDiv.children[0].innerHTML;//Access the paragraph text

        //Checks if it is not saved
        if (yarnFileManager.getCurrentOpenFile().getSaved() === false) 
        {
            if (paraElementContent.substr(paraElementContent.length - unsavedIdentifier.length) !== unsavedIdentifier) 
            {
                workingDetailDiv.children[0].innerHTML = paraElementContent.concat(unsavedIdentifier);
            }
        }
        //Checks if it is saved
        else if (yarnFileManager.getCurrentOpenFile().getSaved()) 
        {
            //check if it is saved, but still has the *
            if (paraElementContent.substr(paraElementContent.length - unsavedIdentifier.length) === unsavedIdentifier) 
            {
                workingDetailDiv.children[0].innerHTML = paraElementContent.slice(0, - unsavedIdentifier.length);
            }
        }
    }
});


//Working file details specific events
const workingFiles = document.getElementById("workingFilesDetail");

if (workingFiles) 
{
    //Set the intiated new empty file into working space
    addFileToDisplay(yarnFileManager.getCurrentOpenFile());
    editor.updateOptions({ readOnly: false });

    let lastOpenDiv = document.getElementById(String(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()));//Get the last opened (current open) div
    if (lastOpenDiv){
        //Last file changes back to workingFile colour
        console.log("Changing colour of generated");
        lastOpenDiv.style.color = exports.tabGap;
    }

    //Add all listeners
    workingFiles.addEventListener("click", (event) => 
    {
        //Button clicked event
        if (event && event.target && (event.target as HTMLElement).tagName === "BUTTON") 
        {
            //Get file ID information and HTML elements
            const button = (event.target as HTMLButtonElement);
            const parentDiv = button.parentElement;
            const fileIdentifier = Number(parentDiv?.id);

            if (Number.isNaN(fileIdentifier) || !parentDiv) 
            {
                console.error("Attempted to remove broken file instance, please file a bug at https://github.com/setho246/YarnSpinnerEditor/issues");
                return;
            }

            //Remove file from array
            if (yarnFileManager.getFiles().size === 1) 
            {
                editor.updateOptions({ readOnly: true });
            }

            if (fileIdentifier === yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()) 
            {
                editor.setValue("");
                yarnFileManager.removeFromFiles(fileIdentifier);
                const arrayOfFiles = Array.from(yarnFileManager.getFiles().keys());//Get new list of files

                if (arrayOfFiles.length) 
                {
                    yarnFileManager.setCurrentOpenYarnFile(arrayOfFiles[0]);
                    updateEditor(yarnFileManager.getCurrentOpenFile());
                }

                lastOpenDiv = document.getElementById(String(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()));
                if (lastOpenDiv){
                    //Sets the colour of the selected file
                    lastOpenDiv.style.color = exports.tabGap;
                }
            }
            else 
            {
                yarnFileManager.removeFromFiles(fileIdentifier);
                updateEditor(yarnFileManager.getCurrentOpenFile());
            }

            //Remove the HTML elements from working files
            parentDiv.parentElement?.removeChild(parentDiv);
        }

        //Swap between files, (button not clicked but element was)
        else if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY") 
        {
            if (lastOpenDiv){
                //Sets the colour of the now unselected file
                lastOpenDiv.style.color = exports.default;
            }

            let fileIdentifier: number;

            if ((event.target as HTMLElement).tagName === "P") 
            {
                fileIdentifier = Number((event.target as HTMLParagraphElement).parentElement?.id);
            }
            else 
            {
                const divElement = (event.target as HTMLDivElement);
                fileIdentifier = Number(divElement.id);
            }

            const openedFile = yarnFileManager.getYarnFile(fileIdentifier);//Gets the new thing

            if (openedFile) 
            {
                //Swapping between files
                //update currentOpen content
                syncCurrentFile();
                
                //Change currentOpen
                yarnFileManager.setCurrentOpenYarnFile(fileIdentifier);

                lastOpenDiv = document.getElementById(String(openedFile.getUniqueIdentifier()));
                if (lastOpenDiv){
                    //Sets the colour of the selected file
                    lastOpenDiv.style.color = exports.tabGap;
                }

                updateEditor(yarnFileManager.getCurrentOpenFile());
            }
        }
    });

    //Early beginnings of right click menu on working files
    workingFiles.addEventListener("contextmenu", (event) =>{
        event.preventDefault();
        
        if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY" && (event.target as HTMLParagraphElement).parentElement?.id !== "workingFilesDetail" ) 
        {
            console.log("We right click the P erlement not the div");
            console.log((event.target as HTMLParagraphElement).parentElement?.id);
        }
    });
}

/**
 * 
 * @param {YarnFile} fileToAdd The file of which contents to push to the editor
 * @returns {void}
 */
function updateEditor(fileToAdd: YarnFile){
    //TODO Swap to push edit operations? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
    editor.setValue(fileToAdd.getContents());
    editor.updateOptions({readOnly: false});
}



/**
 * Update the file manager file to match the code editor.
 * 
 * @returns {void}
 */
function syncCurrentFile() 
{
    yarnFileManager.getCurrentOpenFile().setContents(editor.getValue());
}


/**
 *	Generic function for inserting at the front and the end of a selection.
 *
 * @param {string} textFront The tag to insert at the front of the selection 
 * @param {string} textBack The tag to insert at the back of the selection 
 * 
 * @returns {void}
 */
function wrapTextWithTag(textFront: string, textBack: string) 
{

    const selection = editor.getSelection() as monaco.IRange;
    const selectFront = new monaco.Selection(selection.startLineNumber, selection.startColumn, selection.startLineNumber, selection.startColumn);
    const selectBack = new monaco.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);


    const frontString = textFront.concat("");//Needs to concat an empty character in order to set the cursor properly

    //In this order, so when nothing is selected, textFront is prepended after textBack is inserted
    editor.focus();//Set focus back to editor

    editor.executeEdits("", [{ range: selectBack, text: textBack as string }]);//Set textBack
    editor.setPosition(new monaco.Position(selectFront.startLineNumber, selectFront.startColumn));//reset cursor to behind textFront input
    editor.executeEdits("", [{ range: selectFront, text: frontString as string }]);//Set textFront
    editor.setSelection(new monaco.Selection(selection.startLineNumber, selection.startColumn + frontString.length, selection.startLineNumber, selection.startColumn + frontString.length));
    //Reset collection to an empty range
}


//Set selection to BOLD
const boldText = document.getElementById("boldTextIcon");
if (boldText) 
{
    boldText.onclick = () => { wrapTextWithTag("[b]", "[\\b]"); };
}

//Set selection to Italics
const italicText = document.getElementById("italicTextIcon");
if (italicText) 
{
    italicText.onclick = () => { wrapTextWithTag("[i]", "[\\i]"); };
}

//Set selection to Underline
const underlineText = document.getElementById("underlineTextIcon");
if (underlineText) 
{
    underlineText.onclick = () => { wrapTextWithTag("[u]", "[\\u]"); };
}

//TODO Set selection to selected colour 
const colourPick = document.getElementById("colourPicker");
if (colourPick) 
{
    colourPick.onchange = () => 
    {
        const value = (colourPick as HTMLInputElement).value;

        const startText = "[col='".concat(value.substr(1)).concat("']");
        const endText = "[\\col]";

        wrapTextWithTag(startText, endText);
        editor.focus();
    };
}

const saveFileIcon = document.getElementById("saveFileIcon");

if (saveFileIcon) 
{
    saveFileIcon.onclick = () => { saveEmitter(); };
}

const newFileIcon = document.getElementById("newFileIcon");
if (newFileIcon) 
{
    newFileIcon.onclick = function () { createNewFile(); };
}

const openFolderIcon = document.getElementById("openFolderIcon");
if (openFolderIcon) 
{
    openFolderIcon.onclick = function () { openFileEmitter(); };
}

const findIcon = document.getElementById("searchFolderIcon");
if (findIcon) 
{
    findIcon.onclick = function () { showFindDialog(); };
}

/**
 * Creates a new file and shows it in the display.
 * 
 * @returns {void}
 */
function createNewFile() 
{
    yarnFileManager.createEmptyFile();
    addFileToDisplay(yarnFileManager.createEmptyFile());
    editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());
    editor.updateOptions({ readOnly: false });
}

/**
 * Creates and appends the HTML required for showing a new file.
 * 
 * @param {YarnFIleClass} file The file to add to the display.
 * 
 * @returns {void}
 */
function addFileToDisplay(file: YarnFile): void 
{
    const div = document.createElement("div");
    div.setAttribute("id", file.getUniqueIdentifier().toString());

    const closeButton = document.createElement("button");
    closeButton.textContent = "x";

    const para = document.createElement("p");
    para.textContent = file.getName();

    div.appendChild(para);
    div.appendChild(closeButton);


    const fileListElement = document.getElementById("workingFilesDetail");

    if (fileListElement) 
    {
        fileListElement.appendChild(div);
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
    if (!name) 
    {
        name = "New File";
    }

    const openedFile = new YarnFile(path, contents, name, Date.now());
    yarnFileManager.addToFiles(openedFile);
    addFileToDisplay(openedFile);
    yarnFileManager.setCurrentOpenYarnFile(openedFile.getUniqueIdentifier());
    editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());
    editor.updateOptions({ readOnly: false });
});


ipcRenderer.on("fileSaveResponse", (event, response, filePath, fileName) => 
{
    if (response) 
    {
        if (filePath) 
        {
            yarnFileManager.getCurrentOpenFile().setFilePath(filePath);
        }

        if (fileName) 
        {
            yarnFileManager.getCurrentOpenFile().setName(fileName);

            const workingDetailDiv = document.getElementById(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString());

            if (workingDetailDiv) 
            {
                workingDetailDiv.children[0].innerHTML = yarnFileManager.getCurrentOpenFile().getName();
            }
        }

        yarnFileManager.getCurrentOpenFile().fileSaved();

    }
    else 
    {
        console.error("File save error occured");
    }
});

ipcRenderer.on("mainRequestSaveAs", () => 
{
    saveAsEmitter();
});

ipcRenderer.on("mainRequestSave", () => 
{
    saveEmitter();
});

ipcRenderer.on("mainRequestNewFile", () => 
{
    createNewFile();
});

ipcRenderer.on("mainRequestFind", () => 
{
    showFindDialog();
});

ipcRenderer.on("mainRequestUndo", () =>
{
    actionUndo(); 
});

ipcRenderer.on("mainRequestRedo", () =>
{
    actionRedo();
});

ipcRenderer.on("mainRequestFindAndReplace", () => 
{
    showFindAndReplaceDialog();
});

ipcRenderer.on("gotPing", (event, arg) => 
{
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
    ipcRenderer.send("fileSaveToMain", null, yarnFileManager.getCurrentOpenFile().getContents());
}

/**
 * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
 * 
 * @returns {void}
 */
function saveEmitter() 
{
    ipcRenderer.send("fileSaveToMain", yarnFileManager.getCurrentOpenFile().getPath(), yarnFileManager.getCurrentOpenFile().getContents());
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

/**
 * Shows the Find dialog in the editor.
 * 
 * @returns {void}
 */
function showFindDialog() 
{
    editor.focus();
    editor.trigger(null, "actions.find", null);
}

/**
 * Shows the Find and Replace dialog in the editor.
 * 
 * @returns {void}
 */
function showFindAndReplaceDialog() 
{
    editor.focus();
    editor.trigger(null, "editor.action.startFindReplaceAction", null);
}

/**
 * Executes the undo function from within the editor.
 * 
 * @returns {void}
 */
function actionUndo()
{
    editor.focus();
    editor.trigger("keyboard", "undo", null);
}

/**
 * Executes the redo function from within the editor.
 * 
 * @returns {void}
 */
 function actionRedo()
 {
     editor.focus();
     editor.trigger("keyboard", "redo", null);
 }