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
import { ThemeReader } from "./controllers/themeReader";
import { YarnFileManager } from "./models/YarnFileManager";
import { YarnNodeList } from "./controllers/NodeTranslator";
import { setUpResizing } from "./views/ts/WindowResizing";
import { EditorController } from "./controllers/EditorController";
import { setActiveFile, addFileToDisplay } from "./controllers/DomHelpers";
import { getThemeName, getFontString, setupSettingsDefaults } from "./controllers/YarnSettings";

const yarnFileManager = new YarnFileManager();
const yarnNodeList = new YarnNodeList();
const themeReader = new ThemeReader();
const theme = themeReader.returnThemeOnStringName(getThemeName());
const editor = new EditorController("container", theme, yarnFileManager, yarnNodeList);

// Need to disable no-var-requires here, as it is the nicest way to use a module without an import statement, as import statements must be at the top of the file.
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
let ipcHandler: any;
setUpResizing();

declare const ELECTRON_AVAILABLE: boolean;

if (ELECTRON_AVAILABLE) 
{
    const RendererIPC = require("./controllers/RendererIPC");

    ipcHandler = new RendererIPC(yarnFileManager, editor);
    setupSettingsDefaults();
}
else 
{
    const WebIPC = require("./controllers/WebIPC");

    ipcHandler = new WebIPC(yarnFileManager, editor);
    // @ts-expect-error The element is an image, so src exists.
    document.getElementById("YSLogo").src = "./img/YSLogo.png";
}
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

//set css variables
//TODO streamline variables, a few of these are using the same colour
document.documentElement.style.setProperty("--editor", theme.editor);
document.documentElement.style.setProperty("--editorMinimap", theme.editorMinimap);
document.documentElement.style.setProperty("--topSideEdit", theme.editor);
document.documentElement.style.setProperty("--workingFile", theme.workingFile);
document.documentElement.style.setProperty("--tabGap", theme.tabGap);
document.documentElement.style.setProperty("--dividerColour", theme.invertDefault);
document.documentElement.style.setProperty("--primary_text", theme.default);
document.documentElement.style.setProperty("--secondary_text", theme.invertDefault);
document.documentElement.style.setProperty("--selectedFileBg", theme.selectedFileBg);
document.documentElement.style.setProperty("--font_choice", getFontString());


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
    //Set the initiated new empty file into working space
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
            console.log("We right click the P element not the div");
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
    saveFileIcon.onclick = () => { ipcHandler.saveEmitter(); };
}

const newFileIcon = document.getElementById("newFileIcon");
if (newFileIcon) 
{
    newFileIcon.onclick = function () { ipcHandler.createNewFile(); };
}

const openFolderIcon = document.getElementById("openFolderIcon");
if (openFolderIcon) 
{
    openFolderIcon.onclick = function () { ipcHandler.openFileEmitter(); };
}

const buildTreeIcon = document.getElementById("buildTree");
if (buildTreeIcon)
{
    buildTreeIcon.onclick = function () 
    {
        editor.handleNodeTreeBuild();
    };
}

// Load a file into the application if it has a .yarn extension
document.ondrop = (e) => 
{
    e.preventDefault();
    e.stopPropagation();

    const paths = [];

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) 
    {
        if (files[i].path.endsWith(".yarn")) 
        {
            paths.push(files[i].path);
        }
    }
    ipcHandler.openFileEmitter(paths);
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
