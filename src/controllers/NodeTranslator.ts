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
export class ReturnObject {
    returnCode: ReturnCode;
    returnJumps: NodeJump[];
    returnNode?: YarnNode;
    returnTitles?: [string, string];//  [0] old title, [1] new title

    constructor(returnCode: ReturnCode, returnJumps: NodeJump[], returnNode?: YarnNode, returnTitles?: [string, string]) {
        this.returnCode = returnCode;
        this.returnJumps = returnJumps;

        if (returnNode) {
            this.returnNode = returnNode;
        }

        if (returnTitles) {
            this.returnTitles = returnTitles;
        }
    }
}

let uniqueIncrement = 0;


class TemporaryNode{
    public currentTitle = "";
    public currentLineTitle = -1;
    public currentLineStart = -1;
    public currentLineEnd = -1;
	public metadata: Map<string, string> = new Map<string, string>();


    resetVariables(): void{
        this.currentTitle = "";
        this.currentLineTitle = -1;
        this.currentLineStart = -1;
        this.currentLineEnd = -1;
		this.metadata = new Map<string, string>()
    }

    validateParameters(): boolean{
        if( this.currentTitle.length > 0 &&  this.currentLineTitle > -1 &&  this.currentLineStart > -1 &&  this.currentLineEnd > -1) {
            return true;
        } else {
            return false;
        }
    }
    
    finalizeNode(): YarnNode {
        return new YarnNode(
			uniqueIncrement,
            this.currentTitle,
            this.currentLineTitle,
            this.currentLineStart,
            this.currentLineEnd,
            this.metadata
        )
    }
}


/*
    TODO
        - add to titles and nodes
        - add jumps to jumps
        - pass node in "found", "deleted" and modified
        - adaptive title change

*/
export class YarnNodeList {
    private titles: string[];
    private nodes: Map<number, YarnNode>
    private jumps: NodeJump[];

    constructor() {
        this.titles = [];
        this.nodes = new Map<number, YarnNode>();
        this.jumps = [] as NodeJump[];
    }

    incrementIdentifier(): number{
        uniqueIncrement++;
        return uniqueIncrement;
    }

    getUniqueIdentifier(): number{
        return uniqueIncrement;
    }

    getTitles(): string[] {
        return this.titles;
    }

    getNodes(): Map<number, YarnNode> {
        return this.nodes;
    }

    getJumps(): NodeJump[] {
        return this.jumps;
    }

    formatTitleString(titleLine: string): string{
        let titleFound = titleLine.replace("Title:", "");
        titleFound = titleFound.replace(" ", "");
        titleFound = titleFound.trim();
        return titleFound;
    }

    searchJumpsForTitleAndReplaceTitle(oldTitle: string, newTitle: string): void {
        this.jumps.forEach(jump => {
            if (jump.getTarget() === oldTitle) {
                jump.setTarget(newTitle);
            }
        });
    }


    getNodeByTitle(title: string): YarnNode | null{

        let returnedNode: YarnNode | null  = null;

        this.nodes.forEach((node, key) => {
            if (title.trim() == node.getTitle().trim()){
                returnedNode = node;
            }
        });

        return returnedNode;
    }


    recalculateLineNumbersSub(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) {
        let numberOfChange = contentChangeEvent.changes[0].range.endLineNumber - contentChangeEvent.changes[0].range.startLineNumber;
        if (numberOfChange != 0) {
            //Deletion of lines have occured
            console.log("Vertical deletion detected");
            this.nodes.forEach((node, key) => {
                console.log(node);
                //Title line
                if (node.getLineTitle() > contentChangeEvent.changes[0].range.startLineNumber) {
                    node.setLineTitle(node.getLineTitle() - numberOfChange);
                }

                //Line start
                if (node.getLineStart() > contentChangeEvent.changes[0].range.startLineNumber) {
                    node.setLineStart(node.getLineStart() - numberOfChange);
                }

                //Line end
                if (node.getLineEnd() > contentChangeEvent.changes[0].range.startLineNumber) {
                    node.setLineEnd(node.getLineEnd() - numberOfChange);
                }

            });
        }
        else {
            //Deletion of lines have no occured
            console.log("Horizontal deletion detected");
        }
    }

    recalculateLineNumbersAdd(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) {
        let numberOfNewLines = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol).length -1;

        this.nodes.forEach((node, key) => {
            console.log(node);

            //Title line
            if (node.getLineTitle() > contentChangeEvent.changes[0].range.startLineNumber) {
                node.setLineTitle(node.getLineTitle() + numberOfNewLines);
            }


            //Line start
            if (node.getLineStart() > contentChangeEvent.changes[0].range.startLineNumber) {
                node.setLineStart(node.getLineStart() + numberOfNewLines);
            }


            //Line end
            if (node.getLineEnd() > contentChangeEvent.changes[0].range.startLineNumber) {
                node.setLineEnd(node.getLineEnd() + numberOfNewLines);
            }

        });
    }
    
    checkForTitleUpdate(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) {
        let nodeEdited;
        
        this.nodes.forEach((node, key) => {

            if(node.getLineTitle() === contentChangeEvent.changes[0].range.startLineNumber) {
                nodeEdited = node;
                this.titles.splice(this.titles.indexOf(node.getTitle()), 1); //Remove from reference

                let titleFound = this.formatTitleString(content.split("\n")[contentChangeEvent.changes[0].range.startLineNumber - 1]);
                
                this.titles.push(titleFound.trim());
                node.setTitle(titleFound.trim());
            }
        });
        
        if (nodeEdited){
        }
        else{
            console.log("Title not found, creating node GOTO line whateever " + contentChangeEvent.changes[0].range.startLineNumber);
        }
    }
	
	checkForMetadataUpdate(allLines: string[], content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent) {
		let currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1
		let nodeTitle = '';
		let node: YarnNode | null;
		let metadata = new Map<string, string>();

		while (!allLines[currentCursor].match(/---/)) {

			if (allLines[currentCursor].match(/(Title:.*)/g)) {
				nodeTitle = allLines[currentCursor];
			}

			if (allLines[currentCursor].match(/(.*):(.*)/) && !allLines[currentCursor].match(/(Title:.*)/g)) {
				let lineSplit = allLines[currentCursor].split(':');
				metadata.set(lineSplit[0].trim(), lineSplit[1].trim())
			}
			currentCursor++;
		}
		
		currentCursor = contentChangeEvent.changes[0].range.startLineNumber - 1

		while (!allLines[currentCursor].match(/===/) && currentCursor > 0) {
			if (allLines[currentCursor].match(/(Title:.*)/g)) {
				nodeTitle = allLines[currentCursor];
			}

			if (allLines[currentCursor].match(/(.*):(.*)/) && !allLines[currentCursor].match(/(Title:.*)/g)) {
				let lineSplit = allLines[currentCursor].split(':');
				metadata.set(lineSplit[0].trim(), lineSplit[1].trim())
			}
			currentCursor--;
		}

		nodeTitle = this.formatTitleString(nodeTitle);
		
		node = this.getNodeByTitle(nodeTitle);
		if(node) {
			node.setMetadata(metadata);
		}
	}



    
    convertFromContentToNode(content: string, contentChangeEvent: monaco.editor.IModelContentChangedEvent): ReturnObject[] {

        let listOfReturns: ReturnObject[] = [];

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

        const titleRegexExp = /(Title:.*)/g;//Get title match
        const dialogueDeliminterExp = /---/; //Get the --- of the node that begins the dialogue
        const metadataRegexExp = /(.*):(.*)/;//Get regex match UNTESTED
        const endRegexExp = /===/g; //Get the end of the node match
        const jumpRegexExp = /<<jump.*?>>/; //Get the jump line match
        const jumpTitleRegexExp = /<<jump(.*?)>>/; //get the title from the jump command

        const allLines = content.split("\n");//Splits the content into a string array to increment over


        let newMetadata = new Map<string, string>();

        let runRegexCheck = encodeURI(contentChangeEvent.changes[0].text) === "%0D%0A" ? true : false;

        runRegexCheck = true;


        //We dont need to loop after the initial build, we just keep checking the change line range
        // Instead of whole loop, just start line -> end line check


        /**
         * DocumentLineNumber needs to have a +1 when doing comparison checks, as it is 0 indexed, and everything else is 1 indexed
         */

        if (runRegexCheck) {
            console.log(contentChangeEvent)
            
            let splitLinesToRegexCheck = contentChangeEvent.changes[0].text.split(contentChangeEvent.eol);
            let lineStart = contentChangeEvent.changes[0].range.startLineNumber;


            console.log(splitLinesToRegexCheck);

            /**
             * Handles veritcal line number changes, additive and substractive
             * -------------------------------------------------
             */
            if (contentChangeEvent.changes[0].text === "") {
                //Deletion may have occured
                this.recalculateLineNumbersSub(content, contentChangeEvent);
            }

            else if (splitLinesToRegexCheck.length > 1) {
                //Additions may have occured - This just adjusts all nodes line information accordingly
                this.recalculateLineNumbersAdd(content, contentChangeEvent);
            }
            // -------------------------------------------------
            
            /**
             * Handles regex running to add new nodes and update existing 
             */

            
            // console.log(allLines[contentChangeEvent.changes[0].range.startLineNumber - 1]);

            if (allLines[lineStart - 1].match(titleRegexExp))
            {
                this.checkForTitleUpdate(content, contentChangeEvent);
            }
			
			if (allLines[lineStart - 1].match(metadataRegexExp))
            {
                this.checkForMetadataUpdate(allLines, content, contentChangeEvent);
            }

            /**
                Three sections
                    - Updation
                        - On enter press - iterate over all nodes, if a line no is GREATER than where enter was pressed, update by range change
                    - Deletion
                    - Creation
                    */
            
            let newNodeBuildStatus = false;
            let nodeUnderConstruction = new TemporaryNode();

            //If the change is an addition
            for(let documentLineNumber = lineStart - 1; documentLineNumber < lineStart + splitLinesToRegexCheck.length - 1; documentLineNumber++){

                if (allLines[documentLineNumber].match(titleRegexExp)){

                    let titleFound = this.formatTitleString(allLines[documentLineNumber]);
                    let returnNode = this.getNodeByTitle(titleFound);

                    if (returnNode != null){
                        newNodeBuildStatus = false;
                    }
                    else{
                        newNodeBuildStatus = true;
                        nodeUnderConstruction.currentTitle = titleFound;
                        nodeUnderConstruction.currentLineTitle = documentLineNumber + 1;
                    }
                }

                if (newNodeBuildStatus){
					// Doesn't find nodes before title.
                    if (allLines[documentLineNumber].match(metadataRegexExp) && !allLines[documentLineNumber].match(titleRegexExp)){
						let lineSplit = allLines[documentLineNumber].split(':');
						nodeUnderConstruction.metadata.set(lineSplit[0].trim(), lineSplit[1].trim());
                    }
    
                    if (allLines[documentLineNumber].match(dialogueDeliminterExp)){
                        nodeUnderConstruction.currentLineStart = documentLineNumber + 1;
                    }
    
                    if (allLines[documentLineNumber].match(endRegexExp)){
                        nodeUnderConstruction.currentLineEnd = documentLineNumber + 1;
                    }
                    
                    if (nodeUnderConstruction.validateParameters()) {
    
                        console.log("Creating node");
                    
                        this.nodes.set(this.incrementIdentifier(), nodeUnderConstruction.finalizeNode());
    
                        this.titles.push(nodeUnderConstruction.currentTitle);
    
                        //Push to nodeView
                        let newAddition = this.nodes.get(this.getUniqueIdentifier());
                        if (newAddition) {
                            listOfReturns.push(this.notifyAddition(newAddition));
                        }
    
                        newNodeBuildStatus = false;
                        nodeUnderConstruction.resetVariables();
    
                        console.log(this.nodes);
                    }
                }
                

                //Debug output at end of loop
                if (documentLineNumber === lineStart + splitLinesToRegexCheck.length -1){
                    console.log("no more node");
                    console.log(this.nodes);
                }
            }

           
        }

        return listOfReturns;
        //Run comparison
        // return this.compareTranslation(tempTitles, newNodes, newJumps);
    }

    convertFromNodeToContent(): string {
        //TODO is this even needed following our circular one way direction design?

        return "TODO Not implemented";
    }


    //Should these be asynchronous? Wait for the update on addition and title change
    //in order to get the xPos and yPos? Or will something else handle that?
    //Such as:

    // waitForNodeUpdates(): void
    // {

    // }


    //------------------------


    validateJumps(): void {
        this.getJumps().forEach(jump => {
            if (this.titles.includes(jump.getTarget())) {
                jump.validateJump();
            }
            else {
                jump.invalidateJump();
            }
        });
    }

    compareTranslation(recentTitles: string[], recentTranslation: Map<number, YarnNode>, newJumps: NodeJump[]): ReturnObject[] {

        const returnList = [] as ReturnObject[];

        if (recentTranslation.size !== this.nodes.size) {
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
        else if (recentTranslation.size === this.nodes.size) {

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
