/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the protect root for license information.
 *---------------------------------------------------------------------------------------------
*/

/*  ~~IMPORTANT~~
	IPC Main console.log output will be in the VSCode terminal
	IPC Renderer console.log output will be in the developer tools window in the actual Electron client
*/


// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import { ipcRenderer } from "electron";
import { ThemeReader } from "../../controllers/themeReader";
import { YarnFileManager } from "../../models/YarnFileManager";
import { YarnFile } from "../../models/YarnFile";
import { YarnNodeList } from "../../controllers/NodeTranslator";
import * as nodeView from "./nodeView";
import { EditorController } from "../../controllers/editorController";

const yarnFileManager = new YarnFileManager();
const yarnNodeList = new YarnNodeList();
const theme = new ThemeReader().OGBlue;
const editor = new EditorController("container", theme, yarnFileManager, yarnNodeList);


//set css variables
//TODO streamline variables, a few of these are using the same colour
document.documentElement.style.setProperty("--editor", theme.editor);
document.documentElement.style.setProperty("--topSideEdit", theme.editor);
document.documentElement.style.setProperty("--workingFile", theme.workingFile);
document.documentElement.style.setProperty("--tabGap", theme.tabGap);
document.documentElement.style.setProperty("--dividerColour", theme.invertDefault);
document.documentElement.style.setProperty("--primary_text", theme.default);
document.documentElement.style.setProperty("--secondary_text", theme.invertDefault);

// * Initialise and create a node in the node view.
nodeView.newNode("Node One");
nodeView.newNode("Node Two");
nodeView.newNode("Node Three");
nodeView.newNode("Node Four");
nodeView.newNode("Node Five");
nodeView.newNode("Node Six");
nodeView.connectNodes("Node One", "Node Two");
nodeView.connectNodes("Node Two", "Node Three");
nodeView.connectNodes("Node Three", "Node One");
nodeView.connectNodes("Node Two", "Node Six");
nodeView.connectNodes("Node Two", "Node Five");


//Working file details specific events
const workingFiles = document.getElementById("workingFilesDetail");

if (workingFiles) 
{
    //Set the intiated new empty file into working space
    addFileToDisplay(yarnFileManager.getCurrentOpenFile());
    editor.setReadOnly(false);

    let lastOpenDiv = document.getElementById(String(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()));//Get the last opened (current open) div
    if (lastOpenDiv)
    {
        //Last file changes back to workingFile colour
        console.log("Changing colour of generated");
        lastOpenDiv.style.color = theme.tabGap;
    }

    //Add all listeners
    workingFiles.addEventListener("click", (event) => 
    {
        alert(yarnNodeList.getTitles());
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
                editor.setReadOnly(true);
            }

            if (fileIdentifier === yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()) 
            {
                editor.setValue("");
                yarnFileManager.removeFromFiles(fileIdentifier);
                const arrayOfFiles = Array.from(yarnFileManager.getFiles().keys());//Get new list of files

                if (arrayOfFiles.length) 
                {
                    yarnFileManager.setCurrentOpenYarnFile(arrayOfFiles[0]);
                    editor.updateEditor(yarnFileManager.getCurrentOpenFile());
                }

                lastOpenDiv = document.getElementById(String(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier()));
                if (lastOpenDiv)
                {
                    //Sets the colour of the selected file
                    lastOpenDiv.style.color = theme.tabGap;
                }
            }
            else 
            {
                yarnFileManager.removeFromFiles(fileIdentifier);
                editor.updateEditor(yarnFileManager.getCurrentOpenFile());
            }

            //Remove the HTML elements from working files
            parentDiv.parentElement?.removeChild(parentDiv);
        }

        //Swap between files, (button not clicked but element was)
        else if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY") 
        {
            if (lastOpenDiv)
            {
                //Sets the colour of the now unselected file
                lastOpenDiv.style.color = theme.default;
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
                editor.syncCurrentFile();
                
                //Change currentOpen
                yarnFileManager.setCurrentOpenYarnFile(fileIdentifier);

                lastOpenDiv = document.getElementById(String(openedFile.getUniqueIdentifier()));
                if (lastOpenDiv)
                {
                    //Sets the colour of the selected file
                    lastOpenDiv.style.color = theme.tabGap;
                }

                editor.updateEditor(yarnFileManager.getCurrentOpenFile());
            }
        }
    });

    //Early beginnings of right click menu on working files
    workingFiles.addEventListener("contextmenu", (event) =>
    {
        event.preventDefault();
        
        if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY" && (event.target as HTMLParagraphElement).parentElement?.id !== "workingFilesDetail" ) 
        {
            console.log("We right click the P erlement not the div");
            console.log((event.target as HTMLParagraphElement).parentElement?.id);
        }
    });
}

//Set selection to BOLD
const boldText = document.getElementById("boldTextIcon");
if (boldText) 
{
    boldText.onclick = () => { editor.wrapTextWithTag("[b]", "[\\b]"); };
}

//Set selection to Italics
const italicText = document.getElementById("italicTextIcon");
if (italicText) 
{
    italicText.onclick = () => { editor.wrapTextWithTag("[i]", "[\\i]"); };
}

//Set selection to Underline
const underlineText = document.getElementById("underlineTextIcon");
if (underlineText) 
{
    underlineText.onclick = () => { editor.wrapTextWithTag("[u]", "[\\u]"); };
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

        editor.wrapTextWithTag(startText, endText);
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
    findIcon.onclick = function () { editor.showFindDialog(); };
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
    editor.setReadOnly(false);
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
    editor.setReadOnly(false);
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
    editor.showFindDialog();
});

ipcRenderer.on("mainRequestUndo", () =>
{
    editor.actionUndo(); 
});

ipcRenderer.on("mainRequestRedo", () =>
{
    editor.actionRedo();
});

ipcRenderer.on("mainRequestFindAndReplace", () => 
{
    editor.showFindAndReplaceDialog();
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
