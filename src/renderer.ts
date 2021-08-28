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
import "./index.css";
import "./views/YSLogo.png";
import { ipcRenderer } from "electron";
import { ThemeReader } from "./controllers/themeReader";
import { YarnFileManager } from "./models/YarnFileManager";
import { YarnFile } from "./models/YarnFile";
import { YarnNodeList } from "./controllers/NodeTranslator";
import { setUpResizing } from "./views/ts/WindowResizing";
import { EditorController } from "./controllers/EditorController";

const yarnFileManager = new YarnFileManager();
const yarnNodeList = new YarnNodeList();
const theme = new ThemeReader().OGBlue;
const editor = new EditorController("container", theme, yarnFileManager, yarnNodeList);
setUpResizing();


//set css variables
//TODO streamline variables, a few of these are using the same colour
document.documentElement.style.setProperty("--editor", theme.editor);
document.documentElement.style.setProperty("--topSideEdit", theme.editor);
document.documentElement.style.setProperty("--workingFile", theme.workingFile);
document.documentElement.style.setProperty("--tabGap", theme.tabGap);
document.documentElement.style.setProperty("--dividerColour", theme.invertDefault);
document.documentElement.style.setProperty("--primary_text", theme.default);
document.documentElement.style.setProperty("--secondary_text", theme.invertDefault);
document.documentElement.style.setProperty("--selectedFileBg", theme.selectedFileBg);

// * Initialise and create a node in the node view.
//TODO REMOVE, SAMPLE CODE
/*
nodeView.newNode("Node One");
nodeView.newNode("Node Two");
nodeView.newNode("Node Three");
nodeView.newNode("Node Four");
nodeView.newNode("Node Five");
nodeView.newNode("Node Six");
*/



//Working file details specific events
const workingFiles = document.getElementById("workingFilesDetail");

if (workingFiles) 
{
    //Set the intiated new empty file into working space
    addFileToDisplay(yarnFileManager.getCurrentOpenFile());
    editor.setReadOnly(false);

    setActiveFile(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier());


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

            if (!parentDiv || Number.isNaN(fileIdentifier)) 
            {
                console.error("Attempted to remove broken file instance, please file a bug at https://github.com/setho246/YarnSpinnerEditor/issues");
                return;
            }

            //Remove file from array
            if (yarnFileManager.getFiles().size === 1) 
            {
                editor.setReadOnly(true);
            }

            const wasActiveFile = fileIdentifier === yarnFileManager.getCurrentOpenFile().getUniqueIdentifier();

            editor.setValue("");
            yarnFileManager.removeFromFiles(fileIdentifier);

            const arrayOfFiles = Array.from(yarnFileManager.getFiles().keys());//Get new list of files
            if (wasActiveFile && arrayOfFiles.length) 
            {
                yarnFileManager.setCurrentOpenYarnFile(arrayOfFiles[0]);
                editor.updateEditor(yarnFileManager.getCurrentOpenFile());
            }

            setActiveFile(yarnFileManager.getCurrentOpenFile().getUniqueIdentifier());


            //Remove the HTML elements from working files
            parentDiv.parentElement?.removeChild(parentDiv);
        }

        //Swap between files, (button not clicked but element was)
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

            //Swapping between files update, so update the file content to match editor
            editor.syncCurrentFile();

            //Change currentOpen
            yarnFileManager.setCurrentOpenYarnFile(fileIdentifier);

            setActiveFile(fileIdentifier);

            editor.updateEditor(yarnFileManager.getCurrentOpenFile());

        }
    });

    //Early beginnings of right click menu on working files
    workingFiles.addEventListener("contextmenu", (event) => 
    {
        event.preventDefault();

        if (event && event.target && (event.target as HTMLElement).tagName !== "DETAILS" && (event.target as HTMLElement).tagName !== "SUMMARY" && (event.target as HTMLParagraphElement).parentElement?.id !== "workingFilesDetail") 
        {
            console.log("We right click the P erlement not the div");
            console.log((event.target as HTMLParagraphElement).parentElement?.id);
        }
    });
}


/**
 * Add and remove classes to correctly highlight the active file.
 * 
 * @param {string|number} fileToMarkCurrent The file to mark current.
 * 
 * @returns {void}
 */
function setActiveFile(fileToMarkCurrent: string | number) 
{
    // Convert mixed type to string.
    fileToMarkCurrent = fileToMarkCurrent.toString();

    const activeFiles = document.getElementsByClassName("active-file");
    Array.from(activeFiles).forEach((value) => 
    {
        value.classList.remove("active-file");
    });

    document.getElementById(fileToMarkCurrent)?.classList.add("active-file");

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

// Load a file into the application if it has a .yarn extension
document.ondrop = (e) =>
{
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer?.files[0].path.endsWith(".yarn")) // if file is a yarn file
    {
        openFileEmitter("/Users/sethhilder/Documents/YarnSpinnerEditor/src/tokenizerTest.yarn");
    }
};

// ! Prevents issue with electron and ondrop event not firing
document.ondragover = (e) =>
{
    e.preventDefault();
};

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

    setActiveFile(file.getUniqueIdentifier());
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
    yarnFileManager.setCurrentOpenYarnFile(openedFile.getUniqueIdentifier());
    addFileToDisplay(openedFile);
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
 * @param {string} filepath file path if available
 * @returns {void}
 */
function openFileEmitter(filepath?: string) 
{
    ipcRenderer.send("fileOpenToMain", filepath);
}
