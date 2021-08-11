import * as monaco from "monaco-editor";
import * as yarnSpinner from "../YarnSpinner/yarnSpinnerMonarch";
import * as nodeView from "../views/ts/nodeView";
import { YarnFileManager } from "../models/YarnFileManager";
import { YarnFile } from "../models/YarnFile";
import { ReturnCode, ReturnObject, YarnNodeList } from "./NodeTranslator";

export class EditorController 
{
    editor: monaco.editor.IStandaloneCodeEditor;
    yarnFileManager: YarnFileManager;
    yarnNodeList: YarnNodeList;

    constructor(editorContainerId: string, theme: Record<string, string>, yarnFileManager: YarnFileManager, yarnNodeList: YarnNodeList) 
    {
        this.yarnFileManager = yarnFileManager;
        this.yarnNodeList = yarnNodeList;
        const containerElement = document.getElementById(editorContainerId);

        if (!containerElement) 
        {
            throw new Error("Container element not found");
        }
        //Register our new custom language
        monaco.languages.register({ id: "yarnSpinner" });
        //set the tokeniser
        monaco.languages.setMonarchTokensProvider("yarnSpinner", yarnSpinner.tokens);
        //set the configuration
        monaco.languages.setLanguageConfiguration("yarnSpinner", yarnSpinner.config);
        //set the completions NOT WORKING CURRENTLY
        monaco.languages.registerCompletionItemProvider("yarnSpinner", yarnSpinner.completions);

        //monaco.editor.defineTheme("yarnSpinnerTheme", yarnSpinner.theme);

        //Utilising theme we can get the variable information from themeReader

        monaco.editor.defineTheme("customTheme", {
            base: "vs",
            inherit: true,
            rules: [
                //{ background: 'CFD8DC'},
                { token: "body.bold", foreground: theme.default, fontStyle: "bold" },
                { token: "body.underline", foreground: theme.default, fontStyle: "underline" },
                { token: "body.italic", foreground: theme.default, fontStyle: "italic" },

                { token: "Commands", foreground: theme.commands },
                { token: "CommandsInternals", foreground: theme.commandsInternal },
                { token: "VarAndNum", foreground: theme.varAndNum },
                { token: "Options", foreground: theme.options },
                { token: "Interpolation", foreground: theme.interpolation },
                { token: "Strings", foreground: theme.strings },
                { token: "Metadata", foreground: theme.metadata },
                { token: "Comments", foreground: theme.comments },
                { token: "Default", foreground: theme.default },

                { token: "Invalid", foreground: "#931621" }

            ],
            // * A list of colour names: https://github.com/Microsoft/monaco-editor/blob/main/test/playground.generated/customizing-the-appearence-exposed-colors.html
            colors: {
                "editor.foreground": theme.default,
                "editor.background": theme.editor,
                "editorCursor.foreground": theme.invertDefault,
                //"editor.lineHighlightBackground": theme.invertDefault, //Removed from parameter

                //Shows indentation
                "editorIndentGuide.background": theme.metadata,

                //lineNumberColour
                "editorLineNumber.foreground": theme.default,
                //Changes bgColour of lineNumbers
                "editorGutter.background": theme.editorMinimap,

                "editor.selectionBackground": theme.invertDefault,
                "editor.inactiveSelectionBackground": theme.editor,
                "minimap.background": theme.editorMinimap

            }
        });

        this.editor = monaco.editor.create(containerElement, {
            //theme: "yarnSpinnerTheme",
            theme: "customTheme",
            value: "".toString(),
            language: "yarnSpinner",
            automaticLayout: true,
            fontFamily: "Courier New",
            fontSize: 20,
            mouseWheelZoom: true,
            wordWrap: "on",
            wrappingIndent: "same",
            renderLineHighlight: "none",
            lineNumbersMinChars: 1
        });

        //Instantiate with new empty file
        this.editor.setValue(yarnFileManager.getCurrentOpenFile().getContents());

        this.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => this.modelChangeHandler(e));

        //Override monaco's default commands to add our own
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I, () => 
        {
            this.wrapTextWithTag("[i]", "[\\i]");
        });

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U, () => 
        {
            this.wrapTextWithTag("[u]", "[\\u]");
        });

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B, () => 
        {
            this.wrapTextWithTag("[b]", "[\\b]");
        });
    }

    /**
    * Generic function for inserting at the front and the end of a selection.
    *
    * @param {string} textFront The tag to insert at the front of the selection 
    * @param {string} textBack The tag to insert at the back of the selection 
    * 
    * @returns {void}
    */
    wrapTextWithTag(textFront: string, textBack: string): void 
    {

        const selection = this.editor.getSelection() as monaco.IRange;
        const selectFront = new monaco.Selection(selection.startLineNumber, selection.startColumn, selection.startLineNumber, selection.startColumn);
        const selectBack = new monaco.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);


        const frontString = textFront.concat("");//Needs to concat an empty character in order to set the cursor properly

        //In this order, so when nothing is selected, textFront is prepended after textBack is inserted
        this.editor.focus();//Set focus back to editor

        this.editor.executeEdits("", [{ range: selectBack, text: textBack as string }]);//Set textBack
        this.editor.setPosition(new monaco.Position(selectFront.startLineNumber, selectFront.startColumn));//reset cursor to behind textFront input
        this.editor.executeEdits("", [{ range: selectFront, text: frontString as string }]);//Set textFront
        this.editor.setSelection(new monaco.Selection(selection.startLineNumber, selection.startColumn + frontString.length, selection.startLineNumber, selection.startColumn + frontString.length));
        //Reset collection to an empty range


        this.editor.focus();
    }

    //Editor specific events
    modelChangeHandler(e: monaco.editor.IModelContentChangedEvent): void 
    {
        //TODO SETH - Maybe pass the ILineChange event info into this method too?
        
        var returnedObjectList = this.yarnNodeList.convertFromContentToNode(this.editor.getValue(), e);


        for (let i = 0; i < returnedObjectList.length; i++) 
        {
            const currentObject: ReturnObject = returnedObjectList[i];

            if (currentObject.returnCode) 
            {
                switch (currentObject.returnCode) 
                {
                case ReturnCode.Error:
                    //Do smth
                    throw new Error("how did we let this happen");
                    break;
                case ReturnCode.Add:
                    console.log("Adding node");
                    if (currentObject.returnNode) 
                    {
                        nodeView.addNode(currentObject.returnNode);
                    }
                    break;
                case ReturnCode.Delete:
                    console.log("Delete node");
                    if (currentObject.returnNode) 
                    {
                        nodeView.removeNode(currentObject.returnNode.getTitle());
                    }
                    break;
                case ReturnCode.Update:
                    console.log("Updating node");
                    if(currentObject.returnTitles)
                    {
                        nodeView.changeNodeName(currentObject.returnTitles[0], currentObject.returnTitles[1]);   
                    }
                    break;
                case ReturnCode.Jumps:
                    console.log("Doing the jumps");
                    console.log(currentObject.returnJumps[0].getTarget());

                    nodeView.receiveJumps(currentObject.returnJumps);
                    break;
                    // case ReturnCode.None:
                    //     //TODO something here, maybe a return from nodeView to get metadata info from nodes
                    //     break;
                }
            }
        }

        // Leaving this here to stop eslint complaining about unused vars
        //console.log(e);
        const workingDetailDiv = document.getElementById(this.yarnFileManager.getCurrentOpenFile().getUniqueIdentifier().toString());

        this.syncCurrentFile();//Update the contents at each point
        const unsavedIdentifier = "*";//Can change to anything

        if (workingDetailDiv) 
        {
            const paraElementContent = workingDetailDiv.children[0].innerHTML;//Access the paragraph text

            //Checks if it is not saved
            if (this.yarnFileManager.getCurrentOpenFile().getSaved() === false) 
            {
                if (paraElementContent.substr(paraElementContent.length - unsavedIdentifier.length) !== unsavedIdentifier) 
                {
                    workingDetailDiv.children[0].innerHTML = paraElementContent.concat(unsavedIdentifier);
                }
            }
            //Checks if it is saved
            else if (this.yarnFileManager.getCurrentOpenFile().getSaved()) 
            {
                //check if it is saved, but still has the *
                if (paraElementContent.substr(paraElementContent.length - unsavedIdentifier.length) === unsavedIdentifier) 
                {
                    workingDetailDiv.children[0].innerHTML = paraElementContent.slice(0, - unsavedIdentifier.length);
                }
            }
        }
    }

    /**
 * 
 * @param {YarnFile} fileToAdd The file of which contents to push to the editor
 * @returns {void}
 */
    updateEditor(fileToAdd: YarnFile): void 
    {
        //TODO Swap to push edit operations? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
        this.setValue(fileToAdd.getContents());
        this.setReadOnly(false);
    }

    setReadOnly(value: boolean): void 
    {
        this.editor.updateOptions({ readOnly: value });
    }

    setValue(value: string): void 
    {
        this.editor.setValue(value);
    }

    getValue(): string 
    {
        return this.editor.getValue();
    }


    /**
     * Shows the Find dialog in the editor.
     * 
     * @returns {void}
     */
    showFindDialog(): void 
    {
        this.editor.focus();
        this.editor.trigger(null, "actions.find", null);
    }

    /**
     * Shows the Find and Replace dialog in the editor.
     * 
     * @returns {void}
     */
    showFindAndReplaceDialog(): void 
    {
        this.editor.focus();
        this.editor.trigger(null, "editor.action.startFindReplaceAction", null);
    }

    /**
     * Executes the undo function from within the editor.
     * 
     * @returns {void}
     */
    actionUndo(): void 
    {
        this.editor.focus();
        this.editor.trigger("keyboard", "undo", null);
    }

    /**
     * Executes the redo function from within the editor.
    * 
     * @returns {void}
     */
    actionRedo(): void 
    {
        this.editor.focus();
        this.editor.trigger("keyboard", "redo", null);
    }

    /**
     * Update the file manager file to match the code editor.
     * 
     * @returns {void}
     */
    syncCurrentFile(): void 
    {
        this.yarnFileManager.getCurrentOpenFile().setContents(this.editor.getValue());
    }

}