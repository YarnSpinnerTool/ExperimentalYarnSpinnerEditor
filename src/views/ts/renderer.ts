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
	setFilePath(filePath: string)  : void
	{
	    this.filePath = filePath;
	}

	setName(name: string) : void
	{
	    this.fileName = name;
	}

	setContents(contents: string) : void
	{
	    this.contents = contents;
	}

	//Functions
	fileSaved() : void
	{
	    this.contentsOnDisk = this.contents;
	}

}

export class YarnFileManager 
{
	private openFiles = new Map<number, YarnFile>();
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

	getYarnFile(yarnIDNumber: number) : YarnFile | undefined
	{
	    return this.openFiles.get(yarnIDNumber);
	}

	//Setters
	setCurrentOpenYarnFile(yarnIDNumber: number) : void
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

	removeFromFiles(yarnIDNumber: number) : void
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

        { token: "body.bold", fontStyle: "bold" },
        { token: "body.underline", fontStyle: "underline" },
        { token: "body.italic", fontStyle: "italic" },
        { token: "body.commands", foreground: exports.commands },
        { token: "commands", foreground: exports.commands },
        { token: "file.tag", foreground: exports.fileTag },
        { token: "interpolation", foreground: exports.interpolation },
        { token: "options", foreground: exports.option },
        { token: "variables", foreground: exports.variables },
        { token: "float", foreground: exports.float },
        { token: "number", foreground: exports.number },
        { token: "yarn.commands", foreground: exports.yarnCommands },
        { token: "commands.float", foreground: exports.commands },
        { token: "commands.number", foreground: exports.commands },
        { token: "commands.operator", foreground: exports.operator },
        { token: "hashtag", foreground: exports.hashtag },
        { token: "dialogue", foreground: exports.primary_text }
    ],

    colors: {
        "editor.foreground": exports.primary_text,
        "editor.background": exports.editor,
        "editorCursor.foreground": exports.workingFile,
        "editor.lineHighlightBackground": exports.lineSelection,
        "editorLineNumber.foreground": exports.primary_text,
        "editor.selectionBackground": exports.lineSelection,
        "editor.inactiveSelectionBackground": exports.editor,
        "minimap.background": exports.lineSelection
    }
});

//set css variables
document.documentElement.style.setProperty("--editor", exports.editor);
document.documentElement.style.setProperty("--topSideEdit", exports.editor);
document.documentElement.style.setProperty("--workingFile", exports.workingFile);
document.documentElement.style.setProperty("--tabGap", exports.tabGap);
document.documentElement.style.setProperty("--dividerColour", exports.divideColour);
document.documentElement.style.setProperty("--primary_text", exports.primary_text);
document.documentElement.style.setProperty("--secondary_text", exports.secondary_text);

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
    fontSize: 14,
    mouseWheelZoom: true,
    wordWrap: "on"
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
    const workingDetailDiv = document.getElementById(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString());

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

    //Add all listeners
    workingFiles.addEventListener("click", (event) => 
    {
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
				
                if(arrayOfFiles.length)
                {	
                    yarnFileManager.setCurrentOpenYarnFile(arrayOfFiles[0]);
                    editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());
                    editor.updateOptions({readOnly: false});
                }
            }
            else 
            {
                yarnFileManager.removeFromFiles(fileIdentifier);
                editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());
                editor.updateOptions({readOnly: false});
            }

            //Remove the HTML elements from working files
            parentDiv.parentElement?.removeChild(parentDiv);
        }
        else if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY") 
        {
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
                //update currentOpen content
                syncCurrentFile();

                //Change currentOpen
                yarnFileManager.setCurrentOpenYarnFile(fileIdentifier);
                editor.setValue(yarnFileManager.getCurrentOpenFile().getContents()); //TODO Swap to push edit operations? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
                editor.updateOptions({ readOnly: false });
            }
        }
    });
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

//Listen for editor commands
// window.addEventListener("keydown", (e) =>{
//No more need for this at this stage
// });



const saveFileIcon = document.getElementById("saveFileIcon");

if (saveFileIcon) 
{
    saveFileIcon.onclick = () => { saveAsEmitter(); };
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


ipcRenderer.on("fileSaveResponse", (event, arg) => 
{
    if (arg) 
    {
        alert("File saved successfully");
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
    ipcRenderer.send("fileSaveAsToMain", null, yarnFileManager.getCurrentOpenFile().getContents());
}

/**
 * Emits an event containing the the contents of the editor, instructing the main process to perform the Save function.
 * TODO implement this fully
 * @returns {void}
 */
function saveEmitter() 
{
    ipcRenderer.send("fileSaveToMain", null, yarnFileManager.getCurrentOpenFile().getContents());
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