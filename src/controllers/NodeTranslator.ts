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
	returnJumps?: NodeJump[];
	returnNode?: YarnNode;

	constructor(returnCode: ReturnCode, returnJumps?: NodeJump[], returnNode?: YarnNode) 
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

	private titleRegexExp = /(Title:.*)/g;//Get title match
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


	recalculateLineNumbersSub(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): void 
	{
	    const numberOfChange = contentChangeEvent.changes[0].range.endLineNumber - contentChangeEvent.changes[0].range.startLineNumber;
	    if (numberOfChange != 0) 
	    {
	        //Deletion of lines have occured
	        console.log("Vertical deletion detected");

	        this.forwardSearchTextRangeForNodes_Removal(allLines, contentChangeEvent, listOfReturns, 1, allLines.length);
	    }
	    else 
	    {
	        //Deletion of lines have no occured
	        console.log("Horizontal deletion detected");
	    }
	}

	recalculateLineNumbersAdd(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): void 
	{
	    const numberOfNewLines = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol).length - 1;

	    this.nodes.forEach((node) => 
	    {
	        console.log(node);

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

	renameNodeTitle(node: YarnNode, titles: string[], content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): void 
	{
	    const nodeEdited = node;
	    this.titles.splice(this.titles.indexOf(node.getTitle()), 1); //Remove from reference

	    const titleFound = this.formatTitleString(content.split("\n")[contentChangeEvent.changes[0].range.startLineNumber - 1]);
	    console.log("Renaming " + nodeEdited.getTitle() + " with: " + titleFound.trim());
	    this.titles.push(titleFound.trim());
	    node.setTitle(titleFound.trim());
	}

	checkForNewTitle(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): boolean 
	{
	    let nodeEdited;
	    console.log("Checking for title update");

	    this.nodes.forEach((node) => 
	    {
	        if (node.getLineTitle() === contentChangeEvent.changes[0].range.endLineNumber) 
	        {
	            this.renameNodeTitle(node, this.titles, content, contentChangeEvent);
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

	checkForMetadataUpdate(allLines: string[], content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): void 
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

	//TODO implement metadata collection, cos rn it stops when the title is found

	/**
	 * Reverses (decrement) through the allLines string array, to build a node from the end delimiter to the title
	 */
	reverseSearchTextForNode(allLines: string[], lineNumber: number, listOfReturns: ReturnObject[]): void 
	{
	    let searchingStatus = true;
	    const originalLineNumber = lineNumber;

	    const reverseNodeUnderConstruction = new TemporaryNode();
	    reverseNodeUnderConstruction.endLineNumber = lineNumber;

	    while (searchingStatus) 
	    {
	        console.log(reverseNodeUnderConstruction);

	        console.log("Currently searching " + lineNumber);
	        console.log(allLines[lineNumber]);
	        if (allLines[lineNumber].match(this.dialogueDelimiterExp)) 
	        {
	            console.log("Delimiter found");
	            reverseNodeUnderConstruction.startLineNumber = lineNumber;
	        }

	        if (allLines[lineNumber].match(this.titleRegexExp)) 
	        {
	            const titleFound = this.formatTitleString(allLines[lineNumber]);
	            const returnNode = this.getNodeByTitle(titleFound);

	            if (returnNode != null) 
	            {
	                searchingStatus = false;
	            }
	            else 
	            {
	                reverseNodeUnderConstruction.currentTitleString = titleFound;
	                reverseNodeUnderConstruction.titleLineNumber = lineNumber;
	            }
	        }

	        if (allLines[lineNumber].match(this.metadataRegexExp)) 
	        {
	            if (reverseNodeUnderConstruction.startLineNumber !== -1) 
	            {
	                const lineSplit = allLines[lineNumber].split(":");
	                reverseNodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
	            }
	        }

	        if (allLines[lineNumber].match(this.endRegexExp) && (lineNumber !== originalLineNumber)) 
	        {
	            console.log("found end of other node, cancelling");
	            //End of another node found, preventing creation
	            searchingStatus = false;
	        }

	        if (!searchingStatus && reverseNodeUnderConstruction.validateParameters()) 
	        {
	            console.log("Creating node");
	            this.nodes.set(this.incrementIdentifier(), reverseNodeUnderConstruction.finalizeNode());

	            this.titles.push(reverseNodeUnderConstruction.currentTitleString);

	            //Push to nodeView
	            const newAddition = this.nodes.get(this.getUniqueIdentifier());
	            if (newAddition) 
	            {
	                listOfReturns.push(this.notifyAddition(newAddition));
	            }
	            searchingStatus = false;
	        }

	        lineNumber--;

	        if (lineNumber <= 0) 
	        {
	            console.log("back at start of document, cancelling");
	            if(reverseNodeUnderConstruction.validateParameters()) 
	            {
	                this.nodes.set(this.incrementIdentifier(), reverseNodeUnderConstruction.finalizeNode());
	            }
	            searchingStatus = false;
	        }
	    }
	}

	forwardSearchTextRangeForNodes_Removal(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[], lineStart: number, lineEnd: number): void 
	{

	    let newNodeBuildStatus = false;
	    const nodeUnderConstruction = new TemporaryNode();
	    const temporaryTitles: (string)[] = [];

	    lineStart = lineStart - 1;
	    lineEnd = lineEnd - 1;

	    for (let documentLineNumber = lineStart; documentLineNumber < lineStart + lineEnd; documentLineNumber++) 
	    {
	        if (allLines[documentLineNumber].match(this.titleRegexExp)) 
	        {
	            const titleFound = this.formatTitleString(allLines[documentLineNumber]);
	            newNodeBuildStatus = true;
	            nodeUnderConstruction.currentTitleString = titleFound;
	            nodeUnderConstruction.titleLineNumber = documentLineNumber + 1;

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
	                nodeUnderConstruction.startLineNumber = documentLineNumber + 1;
	            }

	            if (allLines[documentLineNumber].match(this.endRegexExp)) 
	            {
	                nodeUnderConstruction.endLineNumber = documentLineNumber + 1;
	            }

	            if (nodeUnderConstruction.validateParameters()) 
	            {

	                temporaryTitles.push(nodeUnderConstruction.currentTitleString);

	                newNodeBuildStatus = false;
	                nodeUnderConstruction.resetVariables();

	            }
	        }

	        //Debug output at end of loop
	        if (documentLineNumber === lineStart + lineEnd) 
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
	                        listOfReturns.push(this.notifyRemoval(node));
	                    }
	                });
	            }
	        }
	    }
	}


	forwardSearchTextRangeForNodes_Addition(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[], lineStart: number, lineEnd: number): void 
	{
	    let newNodeBuildStatus = false;
	    const nodeUnderConstruction = new TemporaryNode();

	    for (let documentLineNumber = lineStart - 1; documentLineNumber < lineStart + lineEnd - 1; documentLineNumber++) 
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
	                nodeUnderConstruction.titleLineNumber = documentLineNumber + 1;
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
	                nodeUnderConstruction.startLineNumber = documentLineNumber + 1;
	            }

	            if (allLines[documentLineNumber].match(this.endRegexExp)) 
	            {
	                nodeUnderConstruction.endLineNumber = documentLineNumber + 1;
	            }

	            if (nodeUnderConstruction.validateParameters()) 
	            {

	                this.nodes.set(this.incrementIdentifier(), nodeUnderConstruction.finalizeNode());

	                this.titles.push(nodeUnderConstruction.currentTitleString);

	                //Push to nodeView
	                const newAddition = this.nodes.get(this.getUniqueIdentifier());
	                if (newAddition) 
	                {
	                    listOfReturns.push(this.notifyAddition(newAddition));
	                }

	                newNodeBuildStatus = false;
	                nodeUnderConstruction.resetVariables();

	            }
	        }


	        //Debug output at end of loop
	        if (documentLineNumber === lineStart + lineEnd - 1) 
	        {
	            console.log(this.nodes);
	        }
	    }
	}

	forwardSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[], lineStart: number, splitLinesToRegexCheck: string[]): void 
	{
	    this.forwardSearchTextRangeForNodes_Addition(allLines, contentChangeEvent, listOfReturns, lineStart, splitLinesToRegexCheck.length);
	}

	divideAndConquerSearchTextForNode(allLines: string[], contentChangeEvent: monaco.editor.IModelContentChangedEvent, listOfReturns: ReturnObject[]): void 
	{
	    const lineNumber = contentChangeEvent.changes[0].range.startLineNumber;
	    let incrementNumber = lineNumber;//Goes down the document
	    let decrementNumber = lineNumber;//Goes up the document

	    let searchingStartOfDocument = true;
	    let searchingEndOfDocument = true;

	    const divideAndConquerBuildNode = new TemporaryNode();
	    divideAndConquerBuildNode.startLineNumber = lineNumber + 1;

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
	            console.log("Finished searching downwards wiuth node status of:");
	            console.log(divideAndConquerBuildNode);
	        }

	    }

	    while (searchingEndOfDocument) 
	    {
	        console.log("searching downwards");

	        if (allLines[incrementNumber].match(this.endRegexExp)) 
	        {
	            divideAndConquerBuildNode.endLineNumber = incrementNumber + 1;
	        }

	        incrementNumber++;

	        if (incrementNumber >= allLines.length) 
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

	        this.titles.push(divideAndConquerBuildNode.currentTitleString);

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

	convertFromContentToNode(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): ReturnObject[] 
	{
	    const listOfReturns: ReturnObject[] = [];
	    console.log(this.titles);
	    console.log(this.nodes);

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
	                console.log("lineNumber is " + (lineNumber + contentChangeEvent.changes[0].range.startLineNumber));
	                console.log("lineContent is " + allLines[lineNumber + contentChangeEvent.changes[0].range.startLineNumber]);
	                this.reverseSearchTextForNode(allLines, lineNumber + contentChangeEvent.changes[0].range.startLineNumber, listOfReturns);
	            }
	        });
	        runRegexCheck = false;
	    }
		
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
	            this.recalculateLineNumbersSub(allLines, contentChangeEvent, listOfReturns);
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

	        console.log(allLines[lineStart - 1]);

	        if (allLines[lineStart - 1].match(this.titleRegexExp)) 
	        {
	            if (this.checkForNewTitle(content, contentChangeEvent)) 
	            {
	                this.forwardSearchTextForNode(allLines, contentChangeEvent, listOfReturns, lineStart, splitLinesToRegexCheck);
	            }
	            else 
	            {
	                const nodeOfTitleChange = this.getNodeByTitle(this.formatTitleString(allLines[lineStart - 1]));
	                if (nodeOfTitleChange) 
	                {
	                    listOfReturns.push(this.notifyTitleChange(nodeOfTitleChange));
	                }
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
	            this.reverseSearchTextForNode(allLines, contentChangeEvent.changes[0].range.startLineNumber, listOfReturns);
	        }

	        if (allLines[lineStart - 1].match(this.dialogueDelimiterExp)) 
	        {
	            console.log("Dialogue delimiter found on line: " + lineStart);
	            this.divideAndConquerSearchTextForNode(allLines, contentChangeEvent, listOfReturns);
	        }

	        if (allLines[lineStart - 1].match(this.jumpRegexExp)) 
	        {
	            //TODO - still need to reimplement the jump regex checking
	            console.log("jump found");
	        }

	    }

	    this.searchDocumentForJumps(allLines);

	    return listOfReturns;
	}

	searchDocumentForJumps(allLines: string[]): void 
	{

	    this.jumps = [];

	    let lastNodeFound: YarnNode | null = null;

	    for (let documentLineNumber = 0; documentLineNumber < allLines.length; documentLineNumber++) 
	    {
	        if (allLines[documentLineNumber].match(this.titleRegexExp)) 
	        {
	            console.log("Matched a title");
	            console.log(allLines[documentLineNumber]);
	            const titleFound = this.formatTitleString(allLines[documentLineNumber]);
	            lastNodeFound = this.getNodeByTitle(titleFound.trim());
	            console.log(this.nodes);
	            console.log(lastNodeFound);
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
	            console.log("End of loop, debug status, outputting all jumps:");
	            console.log(this.jumps);
	        }
	    }

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
		//TODO PASS THE CREATION AND THIS.NODES and THIS.TITLES INTO HERE
		return new ReturnObject(ReturnCode.Add, undefined, newNode);
	}

	notifyRemoval(delNode: YarnNode): ReturnObject {
		this.titles.splice(this.titles.indexOf(delNode.getTitle()), 1); //Remove from reference
		this.nodes.delete(delNode.getUniqueIdentifier());
		//Outputs the title of node to undraw and remove
		return new ReturnObject(ReturnCode.Delete, undefined, delNode);
	}

	notifyTitleChange(titleNode: YarnNode): ReturnObject {
		//Outputs the title to change of a node
		//PASS THE RENAME FUNCTION INTO HERE
		console.log("Notifying of title change");
		return new ReturnObject(ReturnCode.Update, undefined, titleNode);
	}

	notifyOfJumps(): ReturnObject {
		this.validateJumps();

		return new ReturnObject(ReturnCode.Jumps, this.jumps);
		//Outputs this.jumps to nodeView
	}

}
