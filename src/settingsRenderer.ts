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
import settings from "electron-settings";

let loaded = false;


if (!loaded)
{
    const optionsForTheme = document.getElementById("ThemeValue") as HTMLSelectElement;
    if (optionsForTheme)
    {
        optionsForTheme.value = settings.getSync("theme.name").toString();
        loaded = true;
    }

    
}


const debugButton = document.getElementById("debugButton");
if (debugButton)
{
    debugButton.addEventListener("click", (event) =>
    {
        console.log("clicked debugButton " + event);
        loadSettings();
    });
}

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

            settings.setSync("theme", {
                name: value,
                code: {
                    themeName: value
                }
            });

            ipcRenderer.send("themeChange", value);

        }


        const fontSelectElement: HTMLSelectElement = document.getElementById("FontValue") as HTMLSelectElement;
        if (fontSelectElement)
        {
            const value = fontSelectElement.options[fontSelectElement.selectedIndex].value;
            console.log(value);

            settings.setSync("font", {
                fontname: value,
                code: {
                    fontname: value
                }
            });

            ipcRenderer.send("fontChange", value);

        }

        console.log("Settings button been clicked " + event );
        ipcRenderer.send("getPing", null, null); 
        window.close();
        
    });
}

ipcRenderer.on("gotPing", (event, arg) => 
{
    console.log(arg);//Should be pong
});

// eslint-disable-next-line valid-jsdoc
/**
 * Simple function to check if the settings file has a theme content
 * @returns {Promise<boolean>}
 */
function checkIfSettingsExist(): boolean
{
    return settings.hasSync("theme.name");
} 

/**
 * Loads setting from file with a file exist check
 * @returns {void}
 */
function loadSettings(): void
{
    if (checkIfSettingsExist())
    {
        console.log("This should only be shown on creation of window");
        console.log("Getting settings");
        console.log(settings.get("theme.name"));
        console.log(settings.file());
    }
    else
    {
        console.log(settings.file());
    }
}