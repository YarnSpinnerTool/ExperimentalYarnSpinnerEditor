import { ipcRenderer } from "electron";
import { YarnFile } from "../models/YarnFile";
import { YarnFileManager } from "../models/YarnFileManager";
import { EditorController } from "./EditorController";
import { setActiveFile, addFileToDisplay } from "./DomHelpers";

export class RendererIPC {
    yarnFileManager: YarnFileManager
    editor: EditorController

    constructor(fileManager: YarnFileManager, editor: EditorController) {
        this.yarnFileManager = fileManager;

        ipcRenderer.on("openFile", (event, files: { path: string, contents: string, name: string }[]) => {
            files.forEach(openedFileDetails => {
                if (!openedFileDetails.name) {
                    openedFileDetails.name = "New File";
                }

                const openedFile = new YarnFile(openedFileDetails.path, openedFileDetails.contents, openedFileDetails.name, Date.now());
                this.yarnFileManager.addToFiles(openedFile);
                this.yarnFileManager.setCurrentOpenYarnFile(openedFile.getUniqueIdentifier());
                addFileToDisplay(openedFile);
                editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
                editor.setReadOnly(false);

            });
        });


        ipcRenderer.on("fileSaveResponse", (event, response, filePath, fileName) => {
            if (response) {
                if (filePath) {
                    this.yarnFileManager.getCurrentOpenFile().setFilePath(filePath);
                }

                if (fileName) {
                    this.yarnFileManager.getCurrentOpenFile().setName(fileName);

                    const workingDetailDiv = document.getElementById(this.yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString());

                    if (workingDetailDiv) {
                        workingDetailDiv.children[0].innerHTML = this.yarnFileManager.getCurrentOpenFile().getName();
                    }
                }

                this.yarnFileManager.getCurrentOpenFile().fileSaved();

            }
            else {
                console.error("File save error occurred");
            }
        });

        ipcRenderer.on("setOpenFile", (event, uid) => {
            this.yarnFileManager.setCurrentOpenYarnFile(uid);
            editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
            editor.setReadOnly(false);
            setActiveFile(uid);
        });

        ipcRenderer.on("setFileSaved", (event, uid) => {
            this.yarnFileManager.getYarnFile(uid).fileSaved();
            const workingDetailDiv = document.getElementById(uid.toString());

            if (workingDetailDiv) {
                workingDetailDiv.children[0].innerHTML = this.yarnFileManager.getYarnFile(uid).getName();
            }
        });

        ipcRenderer.on("mainRequestSaveAs", () => {
            saveAsEmitter();
        });

        ipcRenderer.on("mainRequestSave", () => {
            saveEmitter();
        });

        ipcRenderer.on("mainRequestUnsavedFiles", () => {
            getUnsavedFiles(this.yarnFileManager);
        });

        ipcRenderer.on("mainRequestNewFile", () => {
            this.createNewFile();
        });

        ipcRenderer.on("mainRequestFind", () => {
            editor.showFindDialog();
        });

        ipcRenderer.on("mainRequestUndo", () => {
            editor.actionUndo();
        });

        ipcRenderer.on("mainRequestRedo", () => {
            editor.actionRedo();
        });

        ipcRenderer.on("mainRequestFindAndReplace", () => {
            editor.showFindAndReplaceDialog();
        });

        ipcRenderer.on("gotPing", (event, arg) => {
            console.log(arg);//Should be pong
        });
    }


    /**
     * Creates a new file and shows it in the display.
     * 
     * @returns {void}
     */
    createNewFile() {
        this.yarnFileManager.createEmptyFile();
        addFileToDisplay(this.yarnFileManager.createEmptyFile());
        this.editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
        this.editor.setReadOnly(false);
    }

}
/*
    ------------------------------------
                EMITTERS
    ------------------------------------
*/

/*
    FORMAT:
        EVENT LISTENER (EVENT, => {
            ipcRenderer.send(CHANNEL, ARGS)
        })
*/

/**
 * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
 * 
 * @returns {void}
 */
export function saveAsEmitter() {
    ipcRenderer.send("fileSaveToMain", null, this.yarnFileManager.getCurrentOpenFile().getContents());
}

/**
 * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
 * 
 * @returns {void}
 */
export function saveEmitter() {
    ipcRenderer.send("fileSaveToMain", this.yarnFileManager.getCurrentOpenFile().getPath(), this.yarnFileManager.getCurrentOpenFile().getContents());
}

/**
 * Creates a list of unsaved files open in the editor and sends the info to main.
 * 
 * @returns {void}
 */
export function getUnsavedFiles(yarnFileManager: YarnFileManager) {
    const unsaved: string[][] = [[], [], [], []];

    yarnFileManager.getFiles().forEach((value) => {
        console.log(value);
        if (!value.getSaved()) {
            unsaved[0].push(value.getUniqueIdentifier().toString());
            unsaved[1].push(value.getName());
            unsaved[2].push(value.getPath());
            unsaved[3].push(value.getContents());
        }
    });
    console.log(unsaved);
    ipcRenderer.send("returnUnsavedFiles", unsaved);
}


/**
 * Emits an event to request that main opens a file.
 * 
 * @param {string} filepath file path if available
 * @returns {void}
 */
export function openFileEmitter(filepath?: string[]) {
    ipcRenderer.send("fileOpenToMain", filepath);
}
