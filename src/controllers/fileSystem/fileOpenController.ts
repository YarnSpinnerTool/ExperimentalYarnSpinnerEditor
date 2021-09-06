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
 * @param {string} filePaths file path to file (if available)
 * @return {string} The string contents of the file selected to open or null if the user cancels the dialog.
 */
export function openFile(filePaths?: string|string[]): { path: string; contents: string; name: string }[] | null 
{

    const toReturn = [] as { path: string; contents: string; name: string }[];
    if (!filePaths) 
    {
        const openFileResult = dialog.showOpenDialogSync(
            {
                filters: [{ name: "Yarn file", extensions: ["txt", "yarn"] }],
                properties: ["openFile", "createDirectory", "multiSelections"],
                defaultPath: path.join(__dirname, "../src/Test.txt")	//!change before release!
            });

        if (openFileResult && openFileResult[0]) 
        {
            filePaths = openFileResult;
        }
    }

    if (filePaths) 
    {
        if(!Array.isArray(filePaths)) 
        {
            filePaths = [filePaths];
        }
        filePaths.forEach(filePath => 
        {
            const toAdd = { path: "", contents: "", name: "" };
            toAdd.contents = fs.readFileSync(filePath).toString();
            toAdd.path = filePath;
            toAdd.name = path.basename(filePath);
            toReturn.push(toAdd);
        });
        return toReturn;
    }

    return null;
}