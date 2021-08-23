/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */




import { dialog } from "electron";
import * as path from "path";
import * as fs from "fs";

/**
 * Function for opening a file and returning the contents as a string.
 * 
 * @param {string} filePath file path to file (if available)
 * @return {string} The string contents of the file selected to open or null if the user cancels the dialog.
 */
export function openFile(filePath? : string): { path: string; contents: string; name: string } | null 
{

    if(!filePath)
    {
        const openFileResult = dialog.showOpenDialogSync(
            {
                filters: [{ name: "Yarn file", extensions: ["txt", "yarn"] }],
                properties: ["openFile", "createDirectory"],
                defaultPath: path.join(__dirname, "../src/Test.txt")	//!change before release!
            });

        if (openFileResult && openFileResult[0])
        {
            filePath = openFileResult[0];
        }
    }

    if(filePath)
    {
        const toReturn = { path: "", contents: "", name: "" };
        toReturn.contents = fs.readFileSync(filePath).toString();
        toReturn.path = filePath;
        toReturn.name = path.basename(filePath);
        return toReturn;
    }

    return null;
}