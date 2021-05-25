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
 * Writes a file to disk. Dynamically swaps between Save and Save As depending on value of filePathToWrite.
 * 
 * @param {string | null} filePathToWrite The path to write to. If this is a string, directly write the path supplied.
 *  If null, instead acts as Save As, and prompts the user for a file path.
 * 
 * @param {string} contentToWrite The content to write to the file.
 * 
 * @returns {boolean} Returns true if the file writes successfully, or false if an error occurs or
 * the user cancels the dialog.
 */
export function writeFile(filePathToWrite: string | null, contentToWrite: string): boolean 
{
    if (!filePathToWrite) 
    {
        const dialogResult = dialog.showSaveDialogSync(
            {
                filters: [{ name: "Yarn file", extensions: ["yarn"] },
                    { name: "Text file", extensions: ["txt"] }],    //! change before release
                defaultPath: path.join(__dirname, "../src/")
            });

        if (dialogResult) 
        {
            filePathToWrite = dialogResult;
        }
    }
    // Make sure user didn't cancel.
    if (filePathToWrite) 
    {
        fs.writeFileSync(filePathToWrite, contentToWrite);
        return true;
    }
    return false;
}