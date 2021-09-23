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
// import "./index.css";


console.log("This should only be shown on creation of window");

const settingsButton = document.getElementById("settingsConfirmChangeButton");
if (settingsButton)
{

    settingsButton.addEventListener("click", (event) =>
    {
        const themeSelectElement: HTMLSelectElement = document.getElementById("ThemeValue") as HTMLSelectElement;

        if (themeSelectElement)
        {
            const value = themeSelectElement.options[themeSelectElement.selectedIndex].value;
            console.log(value);
            ipcRenderer.send("themeChange", value);
        }

        console.log("Settings button beeeeeen clicked");
        ipcRenderer.send("getPing", null, null);
    });
}

ipcRenderer.on("gotPing", (event, arg) => 
{
    console.log(arg);//Should be pong
});