/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
*/

import * as monaco from "monaco-editor";
import { YarnNode } from "../models/YarnNode";
import { NodeJump } from "../models/NodeJump";

export enum ReturnCode {
    Error = -1,
    None = 0,
    Add = 1,
    Delete = 2,
    Update = 3,
    Jumps = 4,
    Content = 5
}

//TODO WORKING TITLE
export class ReturnObject 
{
    returnCode: ReturnCode;
    returnJumps?: NodeJump[];
    returnNode?: YarnNode;
    returnLineNumber?: number;
    returnLineContent?: string

    constructor(returnCode: ReturnCode, returnJumps?: NodeJump[], returnNode?: YarnNode, returnLineNumber?: number, returnLineContent?: string) 
    {
        this.returnCode = returnCode;
        if (returnJumps) 
        {
            this.returnJumps = returnJumps;
        }

        if (returnNode) 
        {
            this.returnNode = returnNode;
        }

        if (returnLineNumber)
        {
            this.returnLineNumber = returnLineNumber;
        }

        if (returnLineContent)
        {
            this.returnLineContent = returnLineContent;
        }
    }
}

let uniqueIncrement = 0;


class TemporaryNode 
{
    public currentTitleString = "";
    public titleLineNumber = -1;
    public startLineNumber = -1;
    public endLineNumber = -1;
    public metadata: Map<string, string> = new Map<string, string>();


    resetVariables(): void 
    {
        this.currentTitleString = "";
        this.titleLineNumber = -1;
        this.startLineNumber = -1;
        this.endLineNumber = -1;
        this.metadata = new Map<string, string>();
    }

    validateParameters(): boolean 
    {
        if (this.currentTitleString.length > 0 && this.titleLineNumber > -1 && this.startLineNumber > -1 && this.endLineNumber > -1) 
        {
            return true;
        }
        else 
        {
            return false;
        }
    }

    finalizeNode(): YarnNode 
    {
        return new YarnNode(
            uniqueIncrement,
            this.currentTitleString,
            this.titleLineNumber,
            this.startLineNumber,
            this.endLineNumber,
            this.metadata
        );
    }
}

export class YarnNodeList 
{
    private titles: string[];
    private nodes: Map<number, YarnNode>
    private jumps: NodeJump[];

    private titleRegexExp = /(title:.*)/g;//Get title match
    private dialogueDelimiterExp = /---/; //Get the --- of the node that begins the dialogue
    private metadataRegexExp = /(.*):(.*)/;//Get regex match UNTESTED
    private endRegexExp = /===/g; //Get the end of the node match
    private jumpRegexExp = /<<jump .*?>>/g; //Get the jump line match
    private jumpTitleRegexExp = /<<jump(.*?)>>/; //get the title from the jump command


    constructor() 
    {
        this.titles = [];
        this.nodes = new Map<number, YarnNode>();
        this.jumps = [] as NodeJump[];
    }

    /**
     * Increment Identifier, increments the number by one and returns.
     * @returns {number} the newly incremented unique identifier.
     */
    incrementAndReturnIdentifier(): number 
    {
        uniqueIncrement++;
        return uniqueIncrement;
    }

    /**
     * Returns the unique identifier number without incrementing it
     * @returns {number} The current unique identifier number
     */
    getUniqueIdentifier(): number 
    {
        return uniqueIncrement;
    }

    /**
     * Returns the current list of titles held by the Yarn Node List
     * @returns {string[]} The current list of titles in the YarnNode list
     */
    getTitles(): string[] 
    {
        return this.titles;
    }

    /**
     * Return the current map of YarnNodes
     * @returns {Map<number, YarnNode>} The current list of YarnNodes
     */
    getNodes(): Map<number, YarnNode> 
    {
        return this.nodes;
    }

    /**
     * Returns the current list of jumps found
     * @returns {NodeJump[]} The current list of jumps found
     */
    getJumps(): NodeJump[] 
    {
        return this.jumps;
    }

    /**
     * Takes the line that matches the title regex, and removes
     * the leading "Title:" and any leading or trailing whitespace.
     * @param {string} titleLine The matched line that hold's the title
     * @returns {string} The formatted title string
     */
    formatTitleString(titleLine: string): string 
    {
        let titleFound = titleLine.replace("title:", "");
        titleFound = titleFound.replace(" ", "");
        titleFound = titleFound.trim();
        return titleFound;
    }

    /**
     * Searches the YarnNode map with the title parameter to match
     * @param {string} title The title of the YarnNode to search for.
     * @returns {YarnNode | null} The matched YarnNode, if any
     */
    getNodeByTitle(title: string): YarnNode | null 
    {
        let returnedNode: YarnNode | null = null;

        this.nodes.forEach((node) => 
        {
            if (title.trim() == node.getTitle().trim()) 
            {
                returnedNode = node;
            }
        });

        return returnedNode;
    }

    /**
     * Renames a YarnNode
     * @param {YarnNode} node The node to rename
     * @param {string} content The document content in string form
     * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
     * @param {ReturnObject[]} listOfReturns List of return objects to notify the NodeView on changes made.
     * @returns {void}
     */
    renameNodeTitle(node: YarnNode, content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): void 
    {
        const nodeEdited = node;
        this.titles.splice(this.titles.indexOf(node.getTitle()), 1); //Remove from reference
     
        const titleFound = this.formatTitleString(content.split("\n")[contentChangeEvent.changes[0].range.startLineNumber - 1]);
        console.log("Renaming " + nodeEdited.getTitle() + " with: " + titleFound.trim());
        this.titles.push(titleFound.trim());
        node.setTitle(titleFound.trim());

        listOfReturns.push(this.notifyTitleChange(nodeEdited));
    }
     
    /**
          * Function to see if the title found is for a new node, returns true if it is a new node, false if it already exists.
          * @param {string} content Whole document in string form
          * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
          * @param {ReturnObject[]} listOfReturns List of return objects to notify the NodeView on changes made.
          * @returns {boolean} True if the title is new (i.e., doesn't exist yet)
          */
    checkIfNewTitle(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): boolean 
    {
        let nodeEdited;
     
        this.nodes.forEach((node) => 
        {
            if (node.getLineTitle() === contentChangeEvent.changes[0].range.endLineNumber) 
            {
                this.renameNodeTitle(node, content, contentChangeEvent, listOfReturns);
                nodeEdited = node;
            }
     
        });
     
        if (nodeEdited) 
        {
            return false;
        }
        else 
        {
            return true;
        }
    }


    //---------------------------------------------------------------------

    /*
    test string to copy paste in
    #This is a file tag
    //This is a comment
title: abc
headerTag: otherTest
xpos: 1
ypos: 1
---
<<jump 333>>
<<jump ttt>>
===

preceedingTag: wahoo
title: 333
headerTag: tester
---
<<jump ttt>>
===

title: ttt
headerTag: otherTest
---
===

title: ttt2ElectricBoogaloo
headerTag: otherTest
--- 
=== 
            */



    convertFromNodeToContent(): void 
    {
        console.log("TODO, convert node content with metadta into a full text thing");
    }

    /**
     * Main function to convert the Monaco document into YarnNode objects, in order to pass them through to the Node View
     * for graphical representation.
     * @param {string} content The text editor's content.
     * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
     * @returns {ReturnObject[]} List of return objects to notify the NodeView on changes made.
     */
    convertFromContentToNode(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): ReturnObject[] 
    {

        const listOfReturns: ReturnObject[] = [];
        //console.log(contentChangeEvent);

        const allLines = content.split("\n");//Splits the content into a string array to increment over
        allLines.unshift("JUNK LINE TO ALLIGN CONTENT");
        let runRegexCheck = true;

        if(contentChangeEvent.changes[0].text.split(contentChangeEvent.eol).length > 1) 
        {
            const pastedLines = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol);

            pastedLines.forEach( (lineContent, lineNumber) => 
            {
                if(lineContent.match(this.endRegexExp)) 
                {
                    this.reverseSearchTextForNode(allLines, lineNumber + contentChangeEvent.changes[0].range.startLineNumber, listOfReturns);
                }
            });
            runRegexCheck = false;
        }

        else
        {
            if (allLines[contentChangeEvent.changes[0].range.startLineNumber].match(this.titleRegexExp))
            {
                const title = this.formatTitleString(allLines[contentChangeEvent.changes[0].range.startLineNumber]);

                if (this.checkIfNewTitle(content,contentChangeEvent, listOfReturns))
                {
                    console.log("title is a new title");
                    if (title.length > 1)
                    {
                        console.log("Finding node");
                        this.forwardSearchTextForNode(allLines, listOfReturns,contentChangeEvent.changes[0].range.startLineNumber, allLines);
                        runRegexCheck = false;
                    }
                }
            }
        }


        if (runRegexCheck) 
        {
            const splitLinesToRegexCheck = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol);
            const lineStart = contentChangeEvent.changes[0].range.startLineNumber;

            /**
             * Handles veritcal line number changes, additive and substractive
             * -------------------------------------------------
             */
            
            //Deletion may have occured
            
            if (contentChangeEvent.changes[0].text === "") 
            {
                this.recalculateLineNumbersSub(allLines, contentChangeEvent, listOfReturns);
            }
            

            //else if (splitLinesToRegexCheck.length > 1) 
            else if (splitLinesToRegexCheck.length > 1) 
            {
                //Additions may have occured - This just adjusts all nodes line information accordingly
                this.recalculateLineNumbersAdd(contentChangeEvent);
            }

            // End of adjusting lines
            // -------------------------------------------------

            /**
             * Handles regex running to add new nodes and update existing 
             */

            if (allLines[lineStart].match(this.metadataRegexExp) && !allLines[lineStart].match(this.titleRegexExp)) 
            {
                console.log("Metadata regex has been found on line " + lineStart);
                this.checkForMetadataUpdate(allLines, contentChangeEvent);
            }

            if (allLines[lineStart].match(this.endRegexExp)) 
            {
                console.log("End regex has been found on line " + lineStart);
                this.reverseSearchTextForNode(allLines, contentChangeEvent.changes[0].range.startLineNumber, listOfReturns);
            }

            if (allLines[lineStart].match(this.dialogueDelimiterExp)) 
            {
                console.log("Dialogue delimiter found on line: " + lineStart);
                this.divideAndConquerSearchTextForNode(allLines, contentChangeEvent, listOfReturns);
            }
        }

        this.searchDocumentForJumps(allLines, listOfReturns);

        console.log(this.titles);
        console.log(this.nodes);
        return listOfReturns;
    }

    //LINE NUMBER ADJUSTMENT METHODS
    
    /**
     * Called on vertical line deletion, handles the running of removing nodes.
     * @param {string[]} allLines Pre-split (by newline) string array of the document content
     * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's change event
     * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
     * @returns {void}
     */
    recalculateLineNumbersSub(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): void 
    {
        const numberOfChange = contentChangeEvent.changes[0].range.endLineNumber - contentChangeEvent.changes[0].range.startLineNumber;
        if (numberOfChange != 0) 
        {
            //Deletion of lines have occured
            console.log("Deleted lines: " + numberOfChange);
            this.forwardSearchTextRangeForNodes_Removal(allLines, listOfReturns, 1, allLines.length);
        }
        else 
        {
            //Deletion of lines have no occured
        }
    }

    /**
     * Called on vertical line addition, handles the adjusting of line values for each node affected
     * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
     * @returns {void}
     */
    recalculateLineNumbersAdd(contentChangeEvent: monaco.editor.IModelContentChangedEvent): void 
    {
        console.log("In recalculating line number add");

        const numberOfNewLines = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol).length - 1;

        this.nodes.forEach((node) => 
        {

            //Title line
            if (node.getLineTitle() >= contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineTitle(node.getLineTitle() + numberOfNewLines);
            }


            //Line start
            if (node.getLineStart() >= contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineStart(node.getLineStart() + numberOfNewLines);
            }


            //Line end
            if (node.getLineEnd() >= contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineEnd(node.getLineEnd() + numberOfNewLines);
            }

        });
    }


    //ADDITIONS TO THE FILE

    addYarnNodeToTitleAndList(constructionNode: TemporaryNode, listOfReturns: ReturnObject[]) : void
    {
        console.log(constructionNode);
                 
        this.nodes.set(this.incrementAndReturnIdentifier(), constructionNode.finalizeNode());

        //Push to nodeView
        const newAddition = this.nodes.get(this.getUniqueIdentifier());
        if (newAddition) 
        {
            listOfReturns.push(this.notifyAddition(newAddition));
        }

        console.log("Added node : " + constructionNode.currentTitleString);
        console.log(constructionNode);
        this.titles.push(constructionNode.currentTitleString);
    }

    /**
     * Reverse search (decrement) through the document to build/find YarnNodes
     * @param {string[]} allLines Newline delimited document content
     * @param {number} startLineNumber Number to start the reverse search from
     * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
     * @returns {void}
     */
    reverseSearchTextForNode(allLines: string[], startLineNumber: number, listOfReturns: ReturnObject[]): void 
    {

        console.log("Reverse searching text for node");
        let searchingStatus = true;
        let currentLineNumber = startLineNumber;
 
        const reverseNodeUnderConstruction = new TemporaryNode();
        reverseNodeUnderConstruction.endLineNumber = startLineNumber;
 
        while (searchingStatus) 
        {
            if (allLines[currentLineNumber].match(this.dialogueDelimiterExp)) 
            {
                reverseNodeUnderConstruction.startLineNumber = currentLineNumber;
            }
 
            if (allLines[currentLineNumber].match(this.titleRegexExp)) 
            {
                const titleFound = this.formatTitleString(allLines[currentLineNumber]);
                const returnNode = this.getNodeByTitle(titleFound);
 
                if (returnNode != null) 
                {
                    searchingStatus = false;
                }
                else 
                {
                    reverseNodeUnderConstruction.currentTitleString = titleFound;
                    reverseNodeUnderConstruction.titleLineNumber = currentLineNumber;
                }
            }
 
            if (allLines[currentLineNumber].match(this.metadataRegexExp) && !allLines[currentLineNumber].match(this.titleRegexExp)) 
            {
                if (reverseNodeUnderConstruction.startLineNumber !== -1) 
                {
                    const lineSplit = allLines[currentLineNumber].split(":");
                    reverseNodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
                }
            }
 
            if ((allLines[currentLineNumber].match(this.endRegexExp) && (currentLineNumber !== startLineNumber))) 
            {
                //End of another node found, preventing creation
                searchingStatus = false;
            }
 
            if (!searchingStatus && reverseNodeUnderConstruction.validateParameters()) 
            {
                this.addYarnNodeToTitleAndList(reverseNodeUnderConstruction, listOfReturns);
 
                searchingStatus = false;
            }
 
 
            currentLineNumber--;
 
            if (currentLineNumber <= 0) 
            {

                if(reverseNodeUnderConstruction.validateParameters())
                {
                    this.addYarnNodeToTitleAndList(reverseNodeUnderConstruction, listOfReturns);
                }

                searchingStatus = false;
            }
        }
    }


    /**
     * Forward searches (incremental) through the range of document lines to add/find YarnNodes, starting from lineStart through to lineEnd (excluding)
     * @param {string[]} allLines Newline delimited document content
     * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
     * @param {number} lineStart Line number to begin the forward search (inclusive)
     * @param {number} lineEnd Line number to end the forward search on (excluding, e.g., i < lineEnd)
     * @returns {void}
     */
    forwardSearchTextRangeForNodes_Addition(allLines: string[],  listOfReturns: ReturnObject[], lineStart: number, lineEnd: number): void 
    {
        console.log("Forward searching text for node RANGE");

        let newNodeBuildStatus = false;
        const nodeUnderConstruction = new TemporaryNode();

        for (let documentLineNumber = lineStart; documentLineNumber < lineStart + lineEnd -1; documentLineNumber++) 
        {
            console.log("Searching LINE: " + allLines[documentLineNumber]);

            if (allLines[documentLineNumber] != undefined)
            {
                if (allLines[documentLineNumber].match(this.titleRegexExp)) 
                {
    
                    const titleFound = this.formatTitleString(allLines[documentLineNumber]);
                    const returnNode = this.getNodeByTitle(titleFound);
    
                    if (returnNode != null) 
                    {
                        newNodeBuildStatus = false;
                    }
                    else 
                    {
                        newNodeBuildStatus = true;
                        nodeUnderConstruction.currentTitleString = titleFound;
                        nodeUnderConstruction.titleLineNumber = documentLineNumber;
                    }
                }
    
                if (newNodeBuildStatus) 
                {
                    // Doesn't find nodes before title.
                    if (allLines[documentLineNumber].match(this.metadataRegexExp) && !allLines[documentLineNumber].match(this.titleRegexExp)) 
                    {
                        const lineSplit = allLines[documentLineNumber].split(":");
                        nodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
                    }
    
                    if (allLines[documentLineNumber].match(this.dialogueDelimiterExp)) 
                    {
                        nodeUnderConstruction.startLineNumber = documentLineNumber;
                    }
    
                    if (allLines[documentLineNumber].match(this.endRegexExp)) 
                    {
                        nodeUnderConstruction.endLineNumber = documentLineNumber;
                    }
    
                    if (nodeUnderConstruction.validateParameters()) 
                    {
                        this.addYarnNodeToTitleAndList(nodeUnderConstruction,listOfReturns);
    
                        newNodeBuildStatus = false;
                        nodeUnderConstruction.resetVariables();
                    }
                }
    
                //Debug output at end of loop
                if (documentLineNumber === lineStart + lineEnd - 2) 
                {
                    console.log(this.nodes);
                }
            }
        }
    }


    /**
     * Forward searches the text starting from lineStart to add/find YarnNodes
     * @param {string[]} allLines Newline delimited document content
     * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
     * @param {number} lineStart Line number to begin the forward search (inclusive)
     * @param {string[]} splitLinesToRegexCheck The added lines in array form, adding either by loading a file or pasting
     * @returns {void}
     */
    forwardSearchTextForNode(allLines: string[], listOfReturns: ReturnObject[], lineStart: number, splitLinesToRegexCheck: string[]): void 
    {
        console.log("Forward searching text for node");

        this.forwardSearchTextRangeForNodes_Addition(allLines, listOfReturns, lineStart, splitLinesToRegexCheck.length);

    }
 
    /**
      * Divides the search (one searched backwards (decrement) and other searches forward (increment)) to add / find YarnNodes
      * @param {string[]} allLines Newline delimited document content
      * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
      * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
      * @returns {void}
      */
    divideAndConquerSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): void 
    {
        console.log("Divide and conquer search");

        const lineNumber = contentChangeEvent.changes[0].range.startLineNumber;
        let incrementNumber = lineNumber;//Goes down the document
        let decrementNumber = lineNumber;//Goes up the document
 
        let searchingStartOfDocument = true;
        let searchingEndOfDocument = true;
 
        const divideAndConquerBuildNode = new TemporaryNode();
        divideAndConquerBuildNode.startLineNumber = lineNumber;
 
        while (searchingStartOfDocument) 
        {
            if (allLines[decrementNumber].match(this.titleRegexExp)) 
            {
                const titleFound = this.formatTitleString(allLines[decrementNumber]);
                const returnNode = this.getNodeByTitle(titleFound);
 
                if (returnNode != null) 
                {
                    searchingStartOfDocument = false;
                    searchingEndOfDocument = false;
                    //Node title already exists, therefore shouldn't do anything
                }
                else 
                {
                    divideAndConquerBuildNode.currentTitleString = titleFound;
                    divideAndConquerBuildNode.titleLineNumber = decrementNumber + 1;
                }
            }
 
            if (allLines[decrementNumber].match(this.metadataRegexExp) && !allLines[decrementNumber].match(this.titleRegexExp)) 
            {
                const lineSplit = allLines[decrementNumber].split(":");
                divideAndConquerBuildNode.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            }
 
            decrementNumber--;
 
            if (decrementNumber < 0) 
            {
                searchingStartOfDocument = false;
            }
 
        }
 
        while (searchingEndOfDocument) 
        {
            if (allLines[incrementNumber].match(this.endRegexExp))
            {
                divideAndConquerBuildNode.endLineNumber = incrementNumber + 1;
            }
 
            incrementNumber++;
 
            if (incrementNumber >= allLines.length) 
            {
                searchingEndOfDocument = false;
            }
        }
 
        if (divideAndConquerBuildNode.validateParameters()) 
        {
            this.nodes.set(this.incrementAndReturnIdentifier(), divideAndConquerBuildNode.finalizeNode());
 
            this.titles.push(divideAndConquerBuildNode.currentTitleString);
 
            //Push to nodeView
            const newAddition = this.nodes.get(this.getUniqueIdentifier());
            if (newAddition) 
            {
                listOfReturns.push(this.notifyAddition(newAddition));
            }
 
            divideAndConquerBuildNode.resetVariables();
        }
    }

    //REMOVALS TO THE FILE

    /**
     * Checks the document/YarnNode range for metadataand assigns it to the appropriate YarnNode
     * @param {string[]} allLines Newline delimited document content
     * @param {monaco.editor.IModelContentChangedEvent} contentChangeEvent Monaco's content change event
     * @returns {void}
     */
    checkForMetadataUpdate(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent): void 
    {
        let currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1;
        let nodeTitle = "";
        let node: YarnNode | null;
        const metadata = new Map<string, string>();

        while (!allLines[currentCursor].match(this.dialogueDelimiterExp)) 
        {

            if (allLines[currentCursor].match(this.titleRegexExp)) 
            {
                nodeTitle = allLines[currentCursor];
            }

            if (allLines[currentCursor].match(this.metadataRegexExp) && !allLines[currentCursor].match(this.titleRegexExp)) 
            {
                const lineSplit = allLines[currentCursor].split(":");
                metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            }
            currentCursor++;
        }

        currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1;

        while (!allLines[currentCursor].match(this.endRegexExp) && currentCursor > 0) 
        {
            if (allLines[currentCursor].match(this.titleRegexExp)) 
            {
                nodeTitle = allLines[currentCursor];
            }

            if (allLines[currentCursor].match(this.metadataRegexExp) && !allLines[currentCursor].match(this.titleRegexExp)) 
            {
                const lineSplit = allLines[currentCursor].split(":");
                metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            }
            currentCursor--;
        }

        nodeTitle = this.formatTitleString(nodeTitle);

        // eslint-disable-next-line prefer-const
        node = this.getNodeByTitle(nodeTitle);

        if (node) 
        {
            node.setMetadata(metadata);
        }
    }

    

    /**
     * Forward searches (incremental) through the range of document lines to remove/check for YarnNodes to remove those from the list that
     * no longer exist, starting from lineStart through to lineEnd (excluding)
     * @param {string[]} allLines Newline delimited document content
     * @param {ReturnObject[]} listOfReturns List of returns to pass back to the editor controller
     * @param {number} lineStart Line number to begin the forward search (inclusive)
     * @param {number} lineEnd Line number to end the forward search on (excluding, e.g., i < lineEnd)
     * @returns {void}
     */
    forwardSearchTextRangeForNodes_Removal(allLines: string[], listOfReturns: ReturnObject[], lineStart: number, lineEnd: number): void 
    {
        let newNodeBuildStatus = false;
        const nodeUnderConstruction = new TemporaryNode();
        const temporaryTitles: (string)[] = [];

        for (let documentLineNumber = lineStart; documentLineNumber < lineStart + lineEnd; documentLineNumber++) 
        {
            if (allLines[documentLineNumber] != undefined)
            {
                if (allLines[documentLineNumber].match(this.titleRegexExp)) 
                {
                    const titleFound = this.formatTitleString(allLines[documentLineNumber]);
                    newNodeBuildStatus = true;
                    nodeUnderConstruction.currentTitleString = titleFound;
                    nodeUnderConstruction.titleLineNumber = documentLineNumber;
    
                }
    
                if (newNodeBuildStatus) 
                {
                    // Doesn't find nodes before title.
                    if (allLines[documentLineNumber].match(this.metadataRegexExp) && !allLines[documentLineNumber].match(this.titleRegexExp)) 
                    {
                        const lineSplit = allLines[documentLineNumber].split(":");
                        nodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
                    }
    
                    if (allLines[documentLineNumber].match(this.dialogueDelimiterExp)) 
                    {
                        nodeUnderConstruction.startLineNumber = documentLineNumber;
                    }
    
                    if (allLines[documentLineNumber].match(this.endRegexExp)) 
                    {
                        nodeUnderConstruction.endLineNumber = documentLineNumber;
                    }
    
                    if (nodeUnderConstruction.validateParameters()) 
                    {
    
                        temporaryTitles.push(nodeUnderConstruction.currentTitleString);
    
                        newNodeBuildStatus = false;
                        nodeUnderConstruction.resetVariables();
    
                    }
                }
    
                //Debug output at end of loop
                if (documentLineNumber === lineStart + lineEnd - 2) 
                {
                    //Minuses the titles found with titles that exist
                    const difference = this.titles.filter(x => !temporaryTitles.includes(x));
    
                    if (difference.length >= 1) 
                    {
                        difference.forEach(title => 
                        {
                            const node = this.getNodeByTitle(title.trim());
                            if (node) 
                            {
                                console.log("Removing node: " + node.getTitle());
                                listOfReturns.push(this.notifyRemoval(node));
                            }
                        });
                    }
                }
            }
        }
    }

    /**
     * Searched the document for any NodeJumps
     * @param {string[]} allLines New line delimited document.
     * @param {ReturnObject[]} returnList List of returns to pass back to the editor controller 
     * @returns {void} 
     */
    searchDocumentForJumps(allLines: string[], returnList: ReturnObject[]): void 
    {

        this.jumps = [];

        let lastNodeFound: YarnNode | null = null;

        for (let documentLineNumber = 0; documentLineNumber < allLines.length; documentLineNumber++) 
        {
            if (allLines[documentLineNumber].match(this.titleRegexExp)) 
            {
                const titleFound = this.formatTitleString(allLines[documentLineNumber]);
                lastNodeFound = this.getNodeByTitle(titleFound.trim());
            }

            if (allLines[documentLineNumber].match(this.endRegexExp)) 
            {
                //We are outside of a node now
                lastNodeFound = null;
            }

            if (allLines[documentLineNumber].match(this.jumpRegexExp) && lastNodeFound) 
            {
                //Start adding jumps
                const jumpLine = allLines[documentLineNumber].match(this.jumpRegexExp);
                if (jumpLine) 
                {

                    //Clean title from jump
                    let titleFound = jumpLine[0];
                    titleFound = titleFound.substr(7); // Cut "<<jump " off the start 
                    titleFound = titleFound.substr(0, titleFound.length - 2); // Cut ">>" off the end
                    titleFound = titleFound.trim(); // Remove any whitespace
                    
                    const nodeFound = this.getNodeByTitle(titleFound);
                    if (nodeFound) 
                    {
                        this.jumps.push(new NodeJump(lastNodeFound.getUniqueIdentifier(), nodeFound.getUniqueIdentifier()));
                    }
                }

            }

            if (documentLineNumber === allLines.length - 1) 
            {
                returnList.push(this.notifyOfJumps());
            }
        }
    }

    /**
     * Validates the NodeJumps in the YarnNodeList to ensure targets exist.
     * @returns {void}
     */
    validateJumps(): void 
    {
        this.getJumps().forEach(jump => 
        {
            if (this.nodes.get(jump.getTarget()))
            {
                jump.validateJump();
            }
            else 
            {
                jump.invalidateJump();
            }


            console.log(jump);
        });
    }

    /*
        For use with connecting NodeView with the Translated Nodes
    */

    /**
     * Notify the Node View of a Node addition
     * @param {YarnNode} newNode the Node to pass through to Node View to draw up  
     * @returns {ReturnObject} A correctly assigned return object for addition of nodes
     */
    notifyAddition(newNode: YarnNode): ReturnObject 
    {
        //Outputs the title of node to draw
        return new ReturnObject(ReturnCode.Add, undefined, newNode);
    }

    /**
     * Notify the Node View of a Node removal
     * @param {YarnNode} delNode the Node to pass through to Node View to inform that it is deleted / removed
     * @returns {ReturnObject} A correctly assigned return object for addition of nodes
     */
    notifyRemoval(delNode: YarnNode): ReturnObject 
    {
        this.titles.splice(this.titles.indexOf(delNode.getTitle()), 1); //Remove from reference
        this.nodes.delete(delNode.getUniqueIdentifier());
        //Outputs the title of node to undraw and remove
        return new ReturnObject(ReturnCode.Delete, undefined, delNode);
    }

    /**
     * Notify the Node View of a Node title change
     * @param {YarnNode} titleNode the Node to pass through to Node View to inform that it has been renamed
     * @returns {ReturnObject} A correctly assigned return object for addition of nodes
     */
    notifyTitleChange(titleNode: YarnNode): ReturnObject 
    {
        return new ReturnObject(ReturnCode.Update, undefined, titleNode);
    }

    /**
     * Notify the Node View of Node Jumps
     * @returns {ReturnObject} A correctly assigned return object for passing through the node jumps
     */
    notifyOfJumps(): ReturnObject 
    {
        this.validateJumps();

        console.log(this.jumps);
        return new ReturnObject(ReturnCode.Jumps, this.jumps);
        //Outputs this.jumps to nodeView
    }

    notifyContentChange(lineNumber: number, content: string): ReturnObject
    {
        return new ReturnObject(ReturnCode.Content, undefined, undefined, lineNumber, content);
    }

}
