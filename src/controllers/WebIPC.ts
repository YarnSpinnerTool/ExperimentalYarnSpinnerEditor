import { YarnFile } from "../models/YarnFile";
import { YarnFileManager } from "../models/YarnFileManager";
import { EditorController } from "./EditorController";
import { addFileToDisplay } from "./DomHelpers";

export class WebIPC 
{
    yarnFileManager: YarnFileManager
    editor: EditorController

    constructor(fileManager: YarnFileManager, editor: EditorController) 
    {
        this.yarnFileManager = fileManager;
        this.editor = editor;
        document.getElementById("file-input").addEventListener("change", this.readFile.bind(this), false);
    }

    /**
     * Creates a new file and shows it in the display.
     * 
     * @returns {void}
     */
    createNewFile(): void 
    {
        addFileToDisplay(this.yarnFileManager.createEmptyFile());
        this.editor.setValue(this.yarnFileManager.getCurrentOpenFile().getContents());
        this.editor.setReadOnly(false);
    }
    
    /**
     * Emits an event containing the contents of the editor, instructing the main process to perform the Save function.
     * 
     * @returns {void}
     */
    saveEmitter(): void 
    {
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.editor.getValue()));
        element.setAttribute("download", this.yarnFileManager.getCurrentOpenFile().getName() + ".yarn");
      
        element.style.display = "none";
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }

    /**
     * Emits an event to request that main opens a file.
     * 
     * @returns {void}
     */
    openFileEmitter(): void 
    {
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
