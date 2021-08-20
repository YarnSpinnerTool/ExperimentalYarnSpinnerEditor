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
    Jumps = 4
}

//TODO WORKING TITLE
export class ReturnObject 
{
    returnCode: ReturnCode;
    returnJumps: NodeJump[];
    returnNode?: YarnNode;
    returnTitles?: [string, string];//  [0] old title, [1] new title

    constructor(returnCode: ReturnCode, returnJumps: NodeJump[], returnNode?: YarnNode, returnTitles?: [string, string]) 
    {
        this.returnCode = returnCode;
        this.returnJumps = returnJumps;

        if (returnNode) 
        {
            this.returnNode = returnNode;
        }

        if (returnTitles) 
        {
            this.returnTitles = returnTitles;
        }
    }
}

let uniqueIncrement = 0;


class TemporaryNode
{
    public currentTitle = "";
    public currentLineTitle = -1;
    public currentLineStart = -1;
    public currentLineEnd = -1;
	public metadata: Map<string, string> = new Map<string, string>();


	resetVariables(): void
	{
	    this.currentTitle = "";
	    this.currentLineTitle = -1;
	    this.currentLineStart = -1;
	    this.currentLineEnd = -1;
	    this.metadata = new Map<string, string>();
	}

	validateParameters(): boolean
	{
	    if( this.currentTitle.length > 0 &&  this.currentLineTitle > -1 &&  this.currentLineStart > -1 &&  this.currentLineEnd > -1) 
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
	        this.currentTitle,
	        this.currentLineTitle,
	        this.currentLineStart,
	        this.currentLineEnd,
	        this.metadata
	    );
	}
}


/*
    TODO
        - add to titles and nodes
        - add jumps to jumps
        - pass node in "found", "deleted" and modified
        - adaptive title change

*/
export class YarnNodeList 
{
    private titles: string[];
    private nodes: Map<number, YarnNode>
    private jumps: NodeJump[];

    private titleRegexExp = /(Title:.*)/g;//Get title match
    private dialogueDelimiterExp = /---/; //Get the --- of the node that begins the dialogue
    private metadataRegexExp = /(.*):(.*)/;//Get regex match UNTESTED
    private endRegexExp = /===/g; //Get the end of the node match
    private jumpRegexExp = /<<jump.*?>>/; //Get the jump line match
    private jumpTitleRegexExp = /<<jump(.*?)>>/; //get the title from the jump command


    constructor() 
    {
        this.titles = [];
        this.nodes = new Map<number, YarnNode>();
        this.jumps = [] as NodeJump[];
    }

    incrementIdentifier(): number
    {
        uniqueIncrement++;
        return uniqueIncrement;
    }

    getUniqueIdentifier(): number
    {
        return uniqueIncrement;
    }

    getTitles(): string[] 
    {
        return this.titles;
    }

    getNodes(): Map<number, YarnNode> 
    {
        return this.nodes;
    }

    getJumps(): NodeJump[] 
    {
        return this.jumps;
    }

    formatTitleString(titleLine: string): string
    {
        let titleFound = titleLine.replace("Title:", "");
        titleFound = titleFound.replace(" ", "");
        titleFound = titleFound.trim();
        return titleFound;
    }

    searchJumpsForTitleAndReplaceTitle(oldTitle: string, newTitle: string): void 
    {
        this.jumps.forEach(jump => 
        {
            if (jump.getTarget() === oldTitle) 
            {
                jump.setTarget(newTitle);
            }
        });
    }


    getNodeByTitle(title: string): YarnNode | null
    {
        let returnedNode: YarnNode | null  = null;

        this.nodes.forEach((node) => 
        {
            if (title.trim() == node.getTitle().trim())
            {
                returnedNode = node;
            }
        });

        return returnedNode;
    }


    recalculateLineNumbersSub(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent)  : void
    {
        const numberOfChange = contentChangeEvent.changes[0].range.endLineNumber - contentChangeEvent.changes[0].range.startLineNumber;
        if (numberOfChange != 0) 
        {
            //Deletion of lines have occured
            console.log("Vertical deletion detected");
            this.nodes.forEach((node) => 
            {
                console.log(node);
                //Title line
                if (node.getLineTitle() > contentChangeEvent.changes[0].range.startLineNumber) 
                {
                    node.setLineTitle(node.getLineTitle() - numberOfChange);
                }

                //Line start
                if (node.getLineStart() > contentChangeEvent.changes[0].range.startLineNumber) 
                {
                    node.setLineStart(node.getLineStart() - numberOfChange);
                }

                //Line end
                if (node.getLineEnd() > contentChangeEvent.changes[0].range.startLineNumber) 
                {
                    node.setLineEnd(node.getLineEnd() - numberOfChange);
                }

            });
        }
        else 
        {
            //Deletion of lines have no occured
            console.log("Horizontal deletion detected");
        }
    }

    recalculateLineNumbersAdd(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) : void
    {
        const numberOfNewLines = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol).length -1;

        this.nodes.forEach((node) => 
        {
            console.log(node);

            //Title line
            if (node.getLineTitle() >= contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineTitle(node.getLineTitle() + numberOfNewLines);
            }


            //Line start
            if (node.getLineStart() > contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineStart(node.getLineStart() + numberOfNewLines);
            }


            //Line end
            if (node.getLineEnd() > contentChangeEvent.changes[0].range.startLineNumber) 
            {
                node.setLineEnd(node.getLineEnd() + numberOfNewLines);
            }

        });
    }
    
    renameNodeTitle(node: YarnNode, titles: string[], content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) : void
    {
        const nodeEdited = node;
        this.titles.splice(this.titles.indexOf(node.getTitle()), 1); //Remove from reference

        const titleFound = this.formatTitleString(content.split("\n")[contentChangeEvent.changes[0].range.startLineNumber - 1]);
        console.log("Renaming " + nodeEdited.getTitle() + " with: " + titleFound.trim());
        this.titles.push(titleFound.trim());
        node.setTitle(titleFound.trim());
    }

    checkForNewTitle(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) : boolean
    {
        let nodeEdited;
        console.log("Checking for title update");

        this.nodes.forEach((node) => 
        {
            if(node.getLineTitle() === contentChangeEvent.changes[0].range.endLineNumber) 
            {
                this.renameNodeTitle(node, this.titles, content, contentChangeEvent);
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
	
    checkForMetadataUpdate(allLines: string[], content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) : void 
    {
        let currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1;
        let nodeTitle = "";
        let node: YarnNode | null;
        const metadata = new Map<string, string>();

        while (!allLines[currentCursor].match(/---/)) 
        {

            if (allLines[currentCursor].match(/(Title:.*)/g)) 
            {
                nodeTitle = allLines[currentCursor];
            }

            if (allLines[currentCursor].match(/(.*):(.*)/) && !allLines[currentCursor].match(/(Title:.*)/g)) 
            {
                const lineSplit = allLines[currentCursor].split(":");
                metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            }
            currentCursor++;
        }
		
        currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1;

        while (!allLines[currentCursor].match(/===/) && currentCursor > 0) 
        {
            if (allLines[currentCursor].match(/(Title:.*)/g)) 
            {
                nodeTitle = allLines[currentCursor];
            }

            if (allLines[currentCursor].match(/(.*):(.*)/) && !allLines[currentCursor].match(/(Title:.*)/g)) 
            {
                const lineSplit = allLines[currentCursor].split(":");
                metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            }
            currentCursor--;
        }

        nodeTitle = this.formatTitleString(nodeTitle);
		
        // eslint-disable-next-line prefer-const
        node = this.getNodeByTitle(nodeTitle);

        if(node) 
        {
            node.setMetadata(metadata);
        }
    }

    reverseSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]) : void
    {
        let searchingStatus = true;
        let lineNumber = contentChangeEvent.changes[0].range.startLineNumber - 2;//No need to check for the -1 as it's the end regex

        const reverseNodeUnderConstruction = new TemporaryNode();
        reverseNodeUnderConstruction.currentLineEnd = contentChangeEvent.changes[0].range.startLineNumber;

        while (searchingStatus)
        {
            console.log(reverseNodeUnderConstruction);

            console.log("Currently searching " + lineNumber);
            if (allLines[lineNumber].match(this.dialogueDelimiterExp))
            {
                console.log("Delimiter found");
                reverseNodeUnderConstruction.currentLineStart = lineNumber + 1;
            }

            // if (allLines[lineNumber].match(metadataRegexExp) && !allLines[lineStart - 1].match(titleRegexExp))
            // {
            //     console.log("Metadata found");
            //     let lineSplit = allLines[lineNumber].split(':');
            // 	reverseNodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
            // }

            if (allLines[lineNumber].match(this.titleRegexExp))
            {
                console.log("Title found");
                const titleFound = this.formatTitleString(allLines[lineNumber]);
                const returnNode = this.getNodeByTitle(titleFound);

                if (returnNode != null)
                {
                    searchingStatus = false;
                }
                else
                {
                    reverseNodeUnderConstruction.currentTitle = titleFound;
                    reverseNodeUnderConstruction.currentLineTitle = lineNumber + 1;
                }
            }

            if (allLines[lineNumber].match(this.endRegexExp))
            {
                console.log("found end of other node, cancelling");
                //End of another node found, preventing creation
                searchingStatus = false;
            }

            if (reverseNodeUnderConstruction.validateParameters())
            {
                console.log("Creating node");
                this.nodes.set(this.incrementIdentifier(), reverseNodeUnderConstruction.finalizeNode());

                this.titles.push(reverseNodeUnderConstruction.currentTitle);

                //Push to nodeView
                const newAddition = this.nodes.get(this.getUniqueIdentifier());
                if (newAddition) 
                {
                    listOfReturns.push(this.notifyAddition(newAddition));
                }
                searchingStatus = false;
            }

            lineNumber--;

            if (lineNumber < 0)
            {
                console.log("back at start of document, cancelling");
                searchingStatus = false;
            }
        }
    }

    forwardSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[], lineStart: number, splitLinesToRegexCheck: string[]) : void
    {
        console.log("Beginning forward lookup");
        let newNodeBuildStatus = false;
        const nodeUnderConstruction = new TemporaryNode();

        //If the change is an addition
        for(let documentLineNumber = lineStart - 1; documentLineNumber < lineStart + splitLinesToRegexCheck.length - 1; documentLineNumber++)
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
                    nodeUnderConstruction.currentTitle = titleFound;
                    nodeUnderConstruction.currentLineTitle = documentLineNumber + 1;
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
                    nodeUnderConstruction.currentLineStart = documentLineNumber + 1;
                }

                if (allLines[documentLineNumber].match(this.endRegexExp))
                {
                    nodeUnderConstruction.currentLineEnd = documentLineNumber + 1;
                }
                
                if (nodeUnderConstruction.validateParameters()) 
                {

                    console.log("Creating node");
                
                    this.nodes.set(this.incrementIdentifier(), nodeUnderConstruction.finalizeNode());

                    this.titles.push(nodeUnderConstruction.currentTitle);

                    //Push to nodeView
                    const newAddition = this.nodes.get(this.getUniqueIdentifier());
                    if (newAddition) 
                    {
                        listOfReturns.push(this.notifyAddition(newAddition));
                    }

                    newNodeBuildStatus = false;
                    nodeUnderConstruction.resetVariables();

                    console.log(this.nodes);
                }
            }
            

            //Debug output at end of loop
            if (documentLineNumber === lineStart + splitLinesToRegexCheck.length -1)
            {
                console.log("no more node");
                console.log(this.nodes);
            }
        }
    }

    divideAndConquerSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]) : void
    {
        console.log("within method");

        const lineNumber = contentChangeEvent.changes[0].range.startLineNumber;
        let incrementNumber = lineNumber;//Goes down the document
        let decrementNumber = lineNumber;//Goes up the document

        let searchingStartOfDocument = true;
        let searchingEndOfDocument = true;

        const divideAndConquerBuildNode = new TemporaryNode();
        divideAndConquerBuildNode.currentLineStart = lineNumber + 1;

        while (searchingStartOfDocument)
        {
            console.log("searching upwards");

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
                    divideAndConquerBuildNode.currentTitle = titleFound;
                    divideAndConquerBuildNode.currentLineTitle = decrementNumber + 1;
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
                console.log("Finished searching downwards wiuth node status of:");
                console.log(divideAndConquerBuildNode);
            }

        }

        while (searchingEndOfDocument)
        {
            console.log("searching downwards");

            if (allLines[incrementNumber].match(this.endRegexExp))
            {
                divideAndConquerBuildNode.currentLineEnd = incrementNumber + 1;
            }

            incrementNumber++;

            if(incrementNumber >= allLines.length)
            {
                searchingEndOfDocument = false;
                console.log("Finished searching downwards at end of doc, with node status of:");
                console.log(divideAndConquerBuildNode);
            }
        }

        if (divideAndConquerBuildNode.validateParameters())
        {
            console.log("Creating node at split");
                
            this.nodes.set(this.incrementIdentifier(), divideAndConquerBuildNode.finalizeNode());

            this.titles.push(divideAndConquerBuildNode.currentTitle);

            //Push to nodeView
            const newAddition = this.nodes.get(this.getUniqueIdentifier());
            if (newAddition) 
            {
                listOfReturns.push(this.notifyAddition(newAddition));
            }

            divideAndConquerBuildNode.resetVariables();
        }
        else
        {
            console.log("Node is not valid / not found");
        }


    }
    
    convertFromContentToNode(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): ReturnObject[] 
    {

        const listOfReturns: ReturnObject[] = [];

        /*

        test string to copy paste in

#This is a file tag
//This is a comment
Title: abc
headerTag: otherTest
---
<<jump 333>>
<<jump ttt>>
===

preceedingTag: wahoo
Title: 333
headerTag: otherTest
---
<<jump ttt>>
===

Title: ttt
headerTag: otherTest
---
===


Title: ttt2ElectricBoogaloo
headerTag: otherTest
--- 
=== 
        */

        const allLines = content.split("\n");//Splits the content into a string array to increment over
        let runRegexCheck = encodeURI(contentChangeEvent.changes[0].text) === "%0D%0A" ? true : false;

        runRegexCheck = true;


        //We dont need to loop after the initial build, we just keep checking the change line range
        // Instead of whole loop, just start line -> end line check


        /**
         * DocumentLineNumber needs to have a +1 when doing comparison checks, as it is 0 indexed, and everything else is 1 indexed
         */

        if (runRegexCheck) 
        {
            const splitLinesToRegexCheck = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol);
            const lineStart = contentChangeEvent.changes[0].range.startLineNumber;

            /**
             * Handles veritcal line number changes, additive and substractive
             * -------------------------------------------------
             */
            if (contentChangeEvent.changes[0].text === "") 
            {
                //Deletion may have occured
                this.recalculateLineNumbersSub(content, contentChangeEvent);
            }

            else if (splitLinesToRegexCheck.length > 1) 
            {
                //Additions may have occured - This just adjusts all nodes line information accordingly
                this.recalculateLineNumbersAdd(content, contentChangeEvent);
            }

            // End of adjusting lines
            // -------------------------------------------------
            
            /**
             * Handles regex running to add new nodes and update existing 
             */

            
            // console.log(allLines[contentChangeEvent.changes[0].range.startLineNumber - 1]);


            console.log(allLines[lineStart - 1]);

            if (allLines[lineStart - 1].match(this.titleRegexExp))
            {
                if (this.checkForNewTitle(content, contentChangeEvent))
                {
                    this.forwardSearchTextForNode(allLines, contentChangeEvent, listOfReturns, lineStart, splitLinesToRegexCheck);
                }
            }
			
            if (allLines[lineStart - 1].match(this.metadataRegexExp) && !allLines[lineStart - 1].match(this.titleRegexExp))
            {
                console.log("Metadata regex has been found on line " + lineStart);
                this.checkForMetadataUpdate(allLines, content, contentChangeEvent);
            }

            if (allLines[lineStart - 1].match(this.endRegexExp))
            {
                console.log("End regex has been found on line " + lineStart);
                this.reverseSearchTextForNode(allLines, contentChangeEvent, listOfReturns);
            }

            if (allLines[lineStart - 1].match(this.dialogueDelimiterExp))
            {
                console.log("Dialogue delimiter found on line: " + lineStart);
                this.divideAndConquerSearchTextForNode(allLines, contentChangeEvent, listOfReturns);
            }

            //TODO - still need to reimplement the jump regex checking
            //TODO - still need to implement the notifying of title changes
            
        }

        return listOfReturns;
    }

    convertFromNodeToContent(): string 
    {
        return "TODO Not implemented";
    }

    //Should these be asynchronous? Wait for the update on addition and title change
    //in order to get the xPos and yPos? Or will something else handle that?
    //Such as:

    // waitForNodeUpdates(): void
    // {

    // }


    //------------------------


    validateJumps(): void 
    {
        this.getJumps().forEach(jump => 
        {
            if (this.titles.includes(jump.getTarget())) 
            {
                jump.validateJump();
            }
            else 
            {
                jump.invalidateJump();
            }
        });
    }

    compareTranslation(recentTitles: string[], recentTranslation: Map<number, YarnNode>, newJumps: NodeJump[]): ReturnObject[] 
    {

        const returnList = [] as ReturnObject[];

        if (recentTranslation.size !== this.nodes.size) 
        {
            // * Changes are afoot

            // //First case: new title - notify renderer
            // if (recentTranslation.size >= this.nodes.size) {
            //     recentTranslation.forEach((node, title) => {
            //         if (!this.nodes.has(title)) {
            //             returnList.push(this.notifyAddition(node));
            //         }
            //     });
            // }

            // //Second case: removed title - notify renderer
            // else if (recentTranslation.size <= this.nodes.size) {
            //     this.nodes.forEach((node, title) => {
            //         if (!recentTranslation.has(title)) {
            //             returnList.push(this.notifyRemoval(node));
            //         }
            //     });
            // }
        }
        else if (recentTranslation.size === this.nodes.size) 
        {

            //TODO SETH - adaptive title changes

            //Commenting for ESLint
            // const oldTitle = "test";
            // const newTitle = "newTest";


            //returnList.push(this.notifyTitleChange(oldTitle, newTitle));
        }

        //Assign the new translation
        // this.nodes = recentTranslation;
        // this.titles = recentTitles;
        this.jumps = newJumps;


        //Tell NodeView about the jumps
        returnList.push(this.notifyOfJumps());
        return returnList;
    }


    //Disabling ESLint for now to prevent errors from unused vars and empty methods
    /* eslint-disable */
    /*
        For use with connecting NodeView with the Translated Nodes
    */
    notifyAddition(newNode: YarnNode): ReturnObject {
        //Outputs the title of node to draw

        return new ReturnObject(ReturnCode.Add, this.jumps, newNode);
    }

    notifyRemoval(delNode: YarnNode): ReturnObject {
        //Outputs the title of node to undraw and remove
        return new ReturnObject(ReturnCode.Delete, this.jumps, delNode);
    }

    notifyTitleChange(oldTitle: string, newTitle: string): ReturnObject {
        //Outputs the title to change of a node
        return new ReturnObject(ReturnCode.Update, this.jumps, undefined, [oldTitle, newTitle]);
    }

    notifyOfJumps(): ReturnObject {
        this.validateJumps();

        return new ReturnObject(ReturnCode.Jumps, this.jumps);
        //Outputs this.jumps to nodeView
    }

}
