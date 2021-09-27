import { ipcRenderer } from "electron";
import { YarnFile } from "../models/YarnFile";
import { YarnFileManager } from "../models/YarnFileManager";
import { EditorController } from "./EditorController";
import { setActiveFile, addFileToDisplay } from "./DomHelpers";

export class WebIPC 
{
    yarnFileManager: YarnFileManager
    editor: EditorController
    fileOpenCount : number

    constructor(fileManager: YarnFileManager, editor: EditorController) 
    {
        this.yarnFileManager = fileManager;
        this.editor = editor;
        this.fileOpenCount = 0;

        
        ipcRenderer.on("openFile", (event, files: { path: string, contents: string, name: string }[]) => 
        {
            files.forEach(openedFileDetails => 
            {
                if (!openedFileDetails.name) 
                {
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


        ipcRenderer.on("fileSaveResponse", (event, response, filePath, fileName) => 
        {
            if (response) 
            {
                if (filePath) 
                {
                    this.yarnFileManager.getCurrentOpenFile().setFilePath(filePath);
                }

                if (fileName) 
                {
                    this.yarnFileManager.getCurrentOpenFile().setName(fileName);

                    const workingDetailDiv = document.getElementById(this.yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString());

                    if (workingDetailDiv) 
                    {
                        workingDetailDiv.children[0].innerHTML = this.yarnFileManager.getCurrentOpenFile().getName();
                    }
                }

                this.yarnFileManager.getCurrentOpenFile().fileSaved();

            }
            else 
            {
                console.error("File save error occurred");
            }
        });

        ipcRenderer.on("setOpenFile", (event, uid) => 
        {
            this.yarnFileManager.setCurrentOpenYarnFile(uid);
            editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
            editor.setReadOnly(false);
            setActiveFile(uid);
        });

        ipcRenderer.on("setFileSaved", (event, uid) => 
        {
            this.yarnFileManager.getYarnFile(uid).fileSaved();
            const workingDetailDiv = document.getElementById(uid.toString());

            if (workingDetailDiv) 
            {
                workingDetailDiv.children[0].innerHTML = this.yarnFileManager.getYarnFile(uid).getName();
            }
        });
    }


    /**
     * Creates a new file and shows it in the display.
     * 
     * @returns {void}
     */
    createNewFile(): void 
    {
        // this.yarnFileManager.createEmptyFile();
        addFileToDisplay(this.yarnFileManager.createEmptyFile());
        this.editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
        this.editor.setReadOnly(false);
    }

    /**
 * Web has no differentiation between save and save as.
 * 
 * @returns {void}
 */
    saveAsEmitter(): void 
    {
        this.saveEmitter();
    }

    /**
     * Emits an event containing the contents of the editor, instructing the main process to perform the Save function.
     * 
     * @returns {void}
     */
    saveEmitter(): void 
    {
        ipcRenderer.send("fileSaveToMain", this.yarnFileManager.getCurrentOpenFile().getPath(), this.yarnFileManager.getCurrentOpenFile().getContents());
    }

    /**
     * Creates a list of unsaved files open in the editor and sends the info to main.
     * 
     * @returns {void}
     */
    getUnsavedFiles(): void 
    {
        const unsaved: string[][] = [[], [], [], []];

        this.yarnFileManager.getFiles().forEach((value) => 
        {
            console.log(value);
            if (!value.getSaved()) 
            {
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
     * @param {string} filePath file path if available
     * @returns {void}
     */
    openFileEmitter(filePath?: string[]): void 
    {
        console.log(filePath);
        document.getElementById("file-input").addEventListener("change", this.readFile.bind(this), false);
        document.getElementById("file-input").click();
    }

    readFile(e : Event) : void
    {

        const target = e.target as HTMLInputElement;
        const file = target.files[0];
        if (!file) 
        {
            return;
        }
        
        const reader = new FileReader();
        reader.onload =  (e) => 
        {
            const contents = e.target.result;
            const newFile = new YarnFile(file.path, contents.toString(), file.name, Date.now());
            this.yarnFileManager.addToFiles(newFile);
            this.yarnFileManager.setCurrentOpenYarnFile(newFile.getUniqueIdentifier());
            addFileToDisplay(newFile);
            this.editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
            this.editor.setReadOnly(false);
        };
        
        reader.readAsText(file);
    }

}
