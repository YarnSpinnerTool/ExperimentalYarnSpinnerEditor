import { dialog, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs";


export class FileOpenController 
{

    public openFile() : any
    {

        const currentFocused = BrowserWindow.getFocusedWindow();

        if (currentFocused) 
        {
            const openFileResult = dialog.showOpenDialog(
                currentFocused,
                {
                    filters: [{ name: "Yarn file", extensions: ["txt", "yarn"] }],
                    properties: ["openFile", "createDirectory"],
                    defaultPath: path.join(__dirname, "/Test.txt")	//!change before release!
                });

            openFileResult.then(result => 
            {
                const contents = fs.readFileSync(result.filePaths[0]).toString();
                return contents;
            });
        }

    }
}