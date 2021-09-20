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
