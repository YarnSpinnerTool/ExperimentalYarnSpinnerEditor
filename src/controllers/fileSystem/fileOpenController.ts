import { dialog } from "electron";
import * as path from "path";
import * as fs from "fs";

/**
 * Function for opening a file and returning the contents as a string.
 * 
 * @return {string} The string contents of the file selected to open or null if the user cancels the dialog.
 */
export function openFile(): string | null 
{
    const openFileResult = dialog.showOpenDialogSync(
        {
            filters: [{ name: "Yarn file", extensions: ["txt", "yarn"] }],
            properties: ["openFile", "createDirectory"],
            defaultPath: path.join(__dirname, "../src/Test.txt")	//!change before release!
        });

    if (openFileResult && openFileResult[0]) 
    {
        return fs.readFileSync(openFileResult[0]).toString();

    }

    return null;
}