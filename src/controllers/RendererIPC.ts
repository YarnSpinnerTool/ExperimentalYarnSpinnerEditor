import { ipcRenderer } from "electron";
import { YarnFile } from "../models/YarnFile";
import { YarnFileManager } from "../models/YarnFileManager";
import { EditorController } from "./EditorController";
import { setActiveFile, addFileToDisplay } from "./DomHelpers";
import { ThemeReader } from "./themeReader";
import settings from "electron-settings";

export class RendererIPC {
    yarnFileManager: YarnFileManager
    editor: EditorController
    themeReader: ThemeReader

    constructor(fileManager: YarnFileManager, editor: EditorController) {
        this.yarnFileManager = fileManager;
        this.editor = editor;
        this.themeReader = new ThemeReader();

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

        ipcRenderer.on("themeRequestChange", (event, arg) => {
            console.log("Got request for " + arg);
            console.log(this.themeReader.returnThemeOnStringName(arg));
            console.log(typeof (this.themeReader.returnThemeOnStringName(arg)));
            this.updateTheme(this.themeReader.returnThemeOnStringName(arg));
        });

        ipcRenderer.on("fontChangeRequest", (event, arg) => {
            console.log("Request to change font to: " + arg);
            this.updateFont(arg.toString());
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
            this.saveAsEmitter();
        });

        ipcRenderer.on("mainRequestSave", () => {
            this.saveEmitter();
        });

        ipcRenderer.on("mainRequestUnsavedFiles", () => {
            this.getUnsavedFiles();
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
    createNewFile(): void {
        // this.yarnFileManager.createEmptyFile();
        addFileToDisplay(this.yarnFileManager.createEmptyFile());
        this.editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
        this.editor.setReadOnly(false);
    }

    /**
 * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
 * 
 * @returns {void}
 */
    saveAsEmitter(): void {
        ipcRenderer.send("fileSaveToMain", null, this.yarnFileManager.getCurrentOpenFile().getContents());
    }

    /**
     * Emits an event containing the contents of the editor, instructing the main process to perform the Save As function.
     * 
     * @returns {void}
     */
    saveEmitter(): void {
        ipcRenderer.send("fileSaveToMain", this.yarnFileManager.getCurrentOpenFile().getPath(), this.yarnFileManager.getCurrentOpenFile().getContents());
    }

    /**
     * Creates a list of unsaved files open in the editor and sends the info to main.
     * 
     * @returns {void}
     */
    getUnsavedFiles(): void {
        const unsaved: string[][] = [[], [], [], []];

        this.yarnFileManager.getFiles().forEach((value) => {
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
    openFileEmitter(filepath?: string[]): void {
        ipcRenderer.send("fileOpenToMain", filepath);
    }

    /**
 * Updates the theme based on parameter choice
 * @param {string} theme String representation of theme choice
 * @returns {void}
 */
updateTheme(theme: Record<string,string>): void 
{
    console.log("TODO IMPLEMENT UPDATE THEME");
    document.documentElement.style.setProperty("--editor", theme.editor);
    document.documentElement.style.setProperty("--editorMinimap", theme.editorMinimap);
    document.documentElement.style.setProperty("--topSideEdit", theme.editor);
    document.documentElement.style.setProperty("--workingFile", theme.workingFile);
    document.documentElement.style.setProperty("--tabGap", theme.tabGap);
    document.documentElement.style.setProperty("--dividerColour", theme.invertDefault);
    document.documentElement.style.setProperty("--primary_text", theme.default);
    document.documentElement.style.setProperty("--secondary_text", theme.invertDefault);
    document.documentElement.style.setProperty("--selectedFileBg", theme.selectedFileBg);

    this.editor.setThemeOfEditor(theme);
}
    
    /**
 * Updates the font based on parameter choice
 * @param {string} font Font family to change to 
 * @returns {void}
 */
    updateFont(font: string): void
{
    document.documentElement.style.setProperty("--font_choice", settings.getSync("font.fontname").toString());
    this.editor.setFontOfEditor(font);
}
}
