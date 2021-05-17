/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
*/

import { app, BrowserWindow, Menu, ipcMain, shell } from "electron";
import * as path from "path";
import { openFile as YarnOpenFile } from "./controllers/fileSystem/fileOpenController";
import { writeFile as YarnWriteFile } from "./controllers/fileSystem/fileWriteController";


/**
 * Creates the main window. This is a change.
 * 
 * @returns {null} No return
 */
function createWindow() 
{
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 540,
        width: 960,
        minHeight: 480,
        minWidth: 480,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });


    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../src/index.html"));

}

//https://www.electronjs.org/docs/api/menu
const isMac = process.platform === "darwin";

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: "File",
        submenu: [
            { 
                label: "New",
                click: async () =>
                {
                    handleNewFile();
                } 
            },
            {
                label: "Open",
                click: async () => 
                {
                    handleFileOpen();
                }
            },
            { label: "save" },
            { label: "save as" },
            { label: "import" },
            { label: "export" },
            isMac ? { role: "close" } : { role: "quit" },
        ]
    },
    // { role: 'editMenu' }
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "copy" },
            { role: "cut" },
            { role: "paste" },
            { type: "separator" },
            { label: "find" },
            { label: "replace" },
            ...(isMac ?
                [
                    { role: "pasteAndMatchStyle" },
                    { role: "delete" },
                    { role: "selectAll" },
                    { type: "separator" },
                    {
                        label: "Speech",
                        submenu: [
                            { role: "startSpeaking" },
                            { role: "stopSpeaking" }
                        ]
                    }
                ] :
                [
                    { role: "delete" },
                    { type: "separator" },
                    { role: "selectAll" }
                ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: "View",
        submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: "Window",
        submenu: [
            { role: "minimize" },
            { role: "zoom" },
            ...(isMac ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" }
            ] : [
                { role: "close" }
            ])
        ]
    },
    {
        label: "Options",
        submenu: [
            { label: "themes" },
            { label: "accessibility" },
            { label: "settings" },
            { label: "search" },
        ]
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Yarn Spinner Documentation",
                click: async () => 
                {
                    await shell.openExternal("https://github.com/YarnSpinnerTool/YarnSpinner/blob/yarn-spec/Documentation/Yarn-Spec.md"); //TODO This will be changed to wherever the 2.0 docs are located 
                }
            },
            {
                label: "Editor bug?",
                click: async () => 
                {
                    await shell.openExternal("https://github.com/setho246/YarnSpinnerEditor/issues"); //TODO will need to change once ownership changes
                }
            },
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => 
{
    if (process.platform !== "darwin") 
    {
        app.quit();
    }
});

app.on("activate", () => 
{
    if (BrowserWindow.getAllWindows().length === 0) 
    {
        createWindow();
    }
});


/*
	******************************************************************************************************************
										IPCMain Listeners and Emitters
	******************************************************************************************************************
*/

/*
	------------------------------------
				LISTENERS
	------------------------------------
*/

ipcMain.on("getPing", (event) => 
{
    //console.log(arg);
    event.reply("gotPing", "You're a curious one");
});

ipcMain.on("fileOpenToMain", () => 
{
    handleFileOpen();
});

ipcMain.on("fileSaveAsToMain", (event, filePath, contents) => 
{
    YarnWriteFile(filePath, contents);
});

// ipcMain.on("fileSaveToMain", (event, arg) => 
// {

// });

/*
	------------------------------------
				EMITTERS
	------------------------------------
*/
//Sends message from Main to Renderer
//BrowserWindow.getFocusedWindow()?.webContents.send("ChannelMessage", args);
//This should ONLY be used for menu interaction

/**
 * Emits message to renderer to create new file.
 * 
 * @returns {void}
 */
function handleNewFile() 
{
    BrowserWindow.getFocusedWindow()?.webContents.send("mainRequestNewFile"); //Pass the result to renderer
}

/**
 * Handles the opening of a file and returns the contents to the focused window.
 * 
 * @returns {void}
 */
function handleFileOpen() 
{
    //Sends message from main to renderer
    const fileContent = YarnOpenFile();
    if(fileContent) 
    {
        BrowserWindow.getFocusedWindow()?.webContents.send("openFile", fileContent.path, fileContent.contents, fileContent.name); //Pass the result to renderer
    }
}
