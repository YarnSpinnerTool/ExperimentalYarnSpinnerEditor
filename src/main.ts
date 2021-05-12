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


import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import { FileOpenController } from "@fileSystem/fileOpenController";

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
            { label: "new" },
            { label: "open" },
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
                    const { shell } = require("electron");
                    await shell.openExternal("https://github.com/YarnSpinnerTool/YarnSpinner/blob/yarn-spec/Documentation/Yarn-Spec.md"); //TODO This will be changed to wherever the 2.0 docs are located 
                }
            },
            {
                label: "Editor bug?",
                click: async () => 
                {
                    const { shell } = require("electron");
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