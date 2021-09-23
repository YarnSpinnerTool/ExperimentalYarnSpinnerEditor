import * as monaco from "monaco-editor";
import * as yarnSpinner from "../YarnSpinner/yarnSpinnerMonarch";
import { completions } from "../YarnSpinner/yarnSpinnerCompletions";
import * as nodeView from "../views/ts/nodeView";
import { YarnFileManager } from "../models/YarnFileManager";
import { YarnFile } from "../models/YarnFile";
import { ReturnCode, ReturnObject, YarnNodeList } from "./NodeTranslator";
import { YarnNode } from "../models/YarnNode";

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
        // @ts-expect-error Forge
        monaco.languages.registerCompletionItemProvider("yarnSpinner", completions);

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

        const eventHandler = document.getElementById("miniNodeContainer");
        eventHandler.addEventListener("newNode", function(e: CustomEvent)
        {
            console.log("Editor controller : NEW NODE HAS BEEN CLICKED " + e);

            const insertNode = [
                "title: ",
                "xpos: ",
                "ypos: ",
                "---",
                " ",
                "===",
                " "
            ];

            const allLines = this.editor.getValue().split("\n");

            let lineToInsert = allLines.length - 1;

            for (let n = allLines.length - 1; n > 0; n--)
            {
                if (allLines[n] === "")
                {
                    lineToInsert = n;
                }

                else
                {
                    n = 0;
                }
            }

            for (let i = 0; i < insertNode.length; i++)
            {
                allLines.splice(lineToInsert + i, 0, insertNode[i]);
            }

            this.editor.setValue(allLines.join("\n"));
            this.editor.focus();
            this.editor.setPosition({column: 8, lineNumber: lineToInsert + 1});

        }.bind(this));

        eventHandler.addEventListener("nodeMovement", function()
        {
            console.log("Updating position of node based on movement");
            this.editor.setValue(this.editor.getValue());

        }.bind(this));

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


    setThemeOfEditor(theme: Record<string,string>): void
    {
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

        this.editor.updateOptions({
            theme: "customTheme"
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
       

        //TODO pass in the insertions here (the reassigning of the editor content) with a check to prevent the convert from content to node being ran on this run
        // As changing the content will call this again, prevents a double run (which wont cause any problems, just will make it more efficient)

        const allLines = this.editor.getValue().split("\n");
        const titleRegexExp = /(title:.*)/g;//Get title match

        let lastNodeTitle = "";
        let lastNode: YarnNode = null;
        let metadata: Map<string, string>;


        
        
    
        const returnedObjectList = this.yarnNodeList.convertFromContentToNode(this.editor.getValue(), e);
            
    
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
                        nodeView.removeNode(currentObject.returnNode);
                    }
                    break;
                case ReturnCode.Update:
                    console.log("Updating node");
                    if(currentObject.returnNode)
                    {
                        nodeView.changeNodeName(currentObject.returnNode);   
                    }
                    break;
                case ReturnCode.Jumps:
                    console.log("Doing the jumps");
                    //if (currentObject.returnJumps.length !== 0)
                    //{
                    nodeView.receiveJumps(currentObject.returnJumps);
    
                    //}
                    break;
                case ReturnCode.Content:
    
                    console.log("We are setting content");
                    console.log(currentObject.returnLineContent);
                    // eslint-disable-next-line no-case-declarations
                    const operation: monaco.editor.IIdentifiedSingleEditOperation = {
                        range: {
                            startLineNumber: currentObject.returnLineNumber,
                            endLineNumber: currentObject.returnLineNumber,
                            startColumn: 1,
                            endColumn: currentObject.returnLineContent.length + 1,
                        },
                        text: currentObject.returnLineContent
                    };
    
                    this.editor.executeEdits(currentObject.returnLineContent, [operation]);
                    break;
                }
            }
        }
        
        const listOfNodes = nodeView.getAllNodes();
        //Another line to get a new node?

        let changesOccured = false;

        if (listOfNodes.size !== 0)
        {
            for (let i = 0; i < allLines.length; i++)
            {
                if (allLines[i].match(titleRegexExp))
                {
                    //TODO pop the last node found out of the list of nodes
    
                    lastNodeTitle = this.yarnNodeList.formatTitleString(allLines[i]);
                        
                    listOfNodes.forEach((node) => 
                    {
                        if (node.getTitle() === lastNodeTitle)
                        {
                            lastNode = node;
                            metadata = node.getMetaData();
                        }    
                    });
                }
    
                else if (lastNodeTitle !== "")
                {
                    if (allLines[i].match(/---/))
                    {
                        //End of metadata and can then insert above this line, any metadata that wasn't identified to exist
                        if (metadata !== null && metadata.size !== 0)
                        {
                            let increment = 0;
                            metadata.forEach((value, key) => 
                            {
                                const stringToInsert = key + ": " + value;
                                allLines.splice(i + increment, 0, stringToInsert);
                                increment++;
    
                                changesOccured = true;
                                metadata.delete(key.trim());
                            });
                            //Assign the lines
                        }
                    }
    
                    if (allLines[i].match(/(.*):(.*)/) && !allLines[i].match(titleRegexExp))
                    {
                        //Matches metadata but not title
                        const lineSplit = allLines[i].split(":");
                        

                        if (metadata !== null && metadata.get(lineSplit[0].trim()))
                        {
                            //Metadata exists in node, so update the line
                            const metaValue = metadata.get(lineSplit[0].trim());

                            if (lineSplit[1].trim() !== metaValue)
                            {
                                allLines[i] = lineSplit[0] + ": " + metaValue;
                                changesOccured = true;
                            }
                            metadata.delete(lineSplit[0].trim());//Remove the metadata from the list
                        }
                    }
    
                    if (allLines[i].match(/===/))
                    {
                        if (lastNode !== null)
                        {
                            listOfNodes.delete(lastNode.getUniqueIdentifier());
                        }
    
                        lastNodeTitle = "";
                        metadata = null;
                        lastNode = null;
                    }
                }
            }
    
            console.log(listOfNodes);
        }
    
        if (changesOccured)
        {
            console.log("Resetting editor value");
            this.editor.setValue(allLines.join("\n"));
            changesOccured = false;
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

    // nodeViewToEditorPass(devString: string)
    // {
    //     console.log(devString);
    // }


    /**
 * 
 * @param {YarnFile} fileToAdd The file of which contents to push to the editor
 * @returns {void}
 */
    updateEditor(fileToAdd: YarnFile): void 
    {
        //TODO Swap to push edit operations? https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
        // this.setValue("");

        this.setValue(fileToAdd.getContents());
        this.setReadOnly(false);
    }

    setReadOnly(value: boolean): void 
    {
        this.editor.updateOptions({ readOnly: value });
    }

    setValue(value: string): void 
    {
        this.editor.setValue("");
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