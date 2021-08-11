/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
*/

import * as monaco from "monaco-editor";

export enum ReturnCode{
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


export class NodeJump
{
    private sourceTitle: string;
    private targetTitle: string;
    private drawn = false;
    private isValidJump = false;

    constructor(sourceTitle: string, targetTitle: string)
    {
        this.sourceTitle = sourceTitle.trim();
        this.targetTitle = targetTitle.trim();
    }

    getSource(): string
    {
        return this.sourceTitle;
    }

    getTarget(): string
    {
        return this.targetTitle;
    }

    setSource(source: string): void
    {
        this.sourceTitle = source;
    }

    setTarget(target: string): void
    {
        this.targetTitle = target;
    }

    drawJump(): void
    {
        this.drawn = true;
    }

    removeDrawnJump(): void
    {
        this.drawn = false;
    }

    isDrawn() : boolean
    {
        return this.drawn;
    }

    validateJump(): void
    {
        this.isValidJump = true;
    }

    invalidateJump(): void
    {
        this.isValidJump = false;
    }

    //TODO make into some sane function rather than a shallow return
    isValidJumpCheck(): boolean
    {
        return this.isValidJump;
    }

    //TODO remainder of functions that this may need

}

let uniqueIncrement = 0;

export class YarnNode
{

    private title: string;
    private lineTitle: number;//Holds the line that the title of the node resides on
    private lineStart: number;//Holds the first instance of a header, including title
    private lineEnd: number;//Holds the end '==='
    private metadata: Map<string,string>;//first string is metadata name, second is metadata content
    private uniqueIdentifier = uniqueIncrement++;

    constructor(title: string, lineTitle: number,lineStart?: number, lineEnd?: number, metadata: Map<string,string>)
    {

        this.title = title;
        this.lineTitle = lineTitle;
        this.lineStart = -1;
        this.lineEnd = -1;
        this.metadata = new Map<string,string>();

        if (lineStart)
        {
            this.lineStart = lineStart;
        }

        if (lineEnd)
        {
            this.lineEnd = lineEnd;
        }

        if (metadata)
        {
            this.metadata = metadata;
        }
    }

    getTitle(): string
    {
        return this.title;
    }

    getLineTitle(): number
    {
        return this.lineTitle;
    }

    getLineStart(): number
    {
        return this.lineStart;
    }

    getLineEnd(): number
    {
        return this.lineEnd;
    }

    getUniqueIdentifier(): number
    {
        return this.uniqueIdentifier;
    }

    setTitle(title: string): void
    {
        this.title = title;
    }

    setLineTitle(lineTitle: number): void
    {
        this.lineTitle = lineTitle;
    }

    setLineStart(lineStart: number): void
    {
        this.lineStart = lineStart;
    }

    setLineEnd(lineEnd: number): void
    {
        this.lineEnd = lineEnd;
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
    private titles : string[];
    private nodes: Map<string, YarnNode>
    private jumps : NodeJump[];

    constructor()
    {
        this.titles = [];
        this.nodes = new Map<string, YarnNode>();
        this.jumps = [] as NodeJump[];
    }

    getTitles(): string[]
    {
        return this.titles;
    }

    getNodes(): Map<string, YarnNode>
    {
        return this.nodes;
    }
    
    getJumps(): NodeJump[]
    {
        return this.jumps;
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

    convertFromContentToNode(content: string, e :monaco.editor.IModelContentChangedEvent) : ReturnObject[]
    {
        /*

        test string to copy paste in

#This is a file tag
//This is a comment
Title: eee
headerTag: otherTest
---
<<jump 333>>
<<jump ttt>>
===

preceedingTag; wahoo
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

        //Variables to hold to create new nodes
        let lastNode = "";
        let currentNodeFinishedState = false;
        let lastNodeFinishedState = false;
        let dialogueStartFound = false;
        let ignoreNode = false;

        let titleLineNumber = -1;
        let nodeStartNumber = -1;
        

        //Should this just have another instance of the YarnNodeList object?
        const tempTitles = [] as string[];
        const newJumps = [] as NodeJump[];
        const newNode = new Map<string,YarnNode>();
        let newMetadata = new Map<string,string>();

        const runRegexCheck = true;

        if (runRegexCheck)
        {
            for (let documentLineNumber = 0; documentLineNumber < allLines.length; documentLineNumber++)
            {
                if (documentLineNumber === e.changes[0].range.startLineNumber)
                {
                    if (allLines[documentLineNumber].match(titleRegexExp))
                    {
                        let titleFound = allLines[documentLineNumber];
                        titleFound = titleFound.replace("Title:","");
                        titleFound = titleFound.replace(" ", "");
                        titleFound.trim();

                        console.log("TODO IMPLEMENT TITLE CHANGE");
                        documentLineNumber = allLines.length;
                        console.log("Skipping loop because user is still typing title");
                        console.log("EVENT OUTPUT");
                        console.log(e);
                    }
                    
                }
    
                //Cases
                /*
                    ! Title:
                        Store title and line number until === is found
                            May need to also find --- to confirm? ValidNode = startHyphensFound == endFound
    
                    ! Any header
                        Store this metadata in the map, left name of data, right the data
                    
                    If these have not been found, it doesn't begin
    
                TODO    If a title has been found, and the end hasn't been found, "complete" the node but set it to an invalid node and don't pass it through
    
                */
    
                if (allLines[documentLineNumber].match(metadataRegexExp))
                {
                    if (lastNode === "" && dialogueStartFound === false)
                    {
                        //If these are both set to default empty values (lastNode and dialogue) then we are outside a node?
                        const splitInfo = allLines[documentLineNumber].split(":");
                        newMetadata.set(splitInfo[0], splitInfo[1]);
                    }
                    else
                    {
                        //ignore this because we should be inside a node
                    }
                    
                }
    
                if (allLines[documentLineNumber].match(titleRegexExp))
                {
                       
                    let titleFound = allLines[documentLineNumber];
                    titleFound = titleFound.replace("Title:","");
                    titleFound = titleFound.replace(" ", "");
                    titleFound.trim();
    
    
                    if (titleFound !== lastNode && currentNodeFinishedState == false)
                    {
                        //TODO Last node is now invalid and a new one begins
                        lastNodeFinishedState = false;
                        dialogueStartFound = false;
                    }
    
                    if (this.nodes.get(titleFound.trim()))
                    {
                        console.log("FOUND this node and not caring about the regex:");
                        console.log(this.nodes.get(lastNode));
                        ignoreNode = true;
                    }

                    

                    tempTitles.push(titleFound);
                    lastNode = titleFound;
                    titleLineNumber = documentLineNumber + 1;
    
                }
    
                if (allLines[documentLineNumber].match(dialogueDeliminterExp))
                {
                    dialogueStartFound = true;
                    nodeStartNumber = documentLineNumber + 1;
                }
    
                if (allLines[documentLineNumber].match(jumpRegexExp))
                {
                    const w = allLines[documentLineNumber].match(jumpTitleRegexExp);
                    if (w)
                    {
                        newJumps.push(new NodeJump(lastNode.trim(), w[1].trim()));
                    }
                }
    
                if (allLines[documentLineNumber].match(endRegexExp))
                {
                    console.log("STATE OF IGNORE NODE " + ignoreNode);
                    if (dialogueStartFound && !ignoreNode)
                    {
                        newNode.set(lastNode.trim(), new YarnNode(
                            lastNode.trim(),
                            titleLineNumber,
                            nodeStartNumber,
                            documentLineNumber + 1,
                            newMetadata
                        ));
                        //Assign current node to the last node
    
                        
    
                        console.log("TITLE MATCHED and node added");
                    }
                    else if (ignoreNode)
                    {
                        const existingNode = this.nodes.get(lastNode.trim());
                        if (existingNode)
                        {
                            console.log("Node exists adding:");
                            console.log(existingNode);
                            newNode.set(lastNode.trim(), existingNode);
                        }
                    }

                    currentNodeFinishedState = false;
                    dialogueStartFound = false;
                    ignoreNode = false;
                    lastNodeFinishedState = true;
                    newMetadata = new Map<string,string>();
                    lastNode = "";
                }
            }
        }

        

        
        
        // //! NEEDS TO BE REMADE, REDONE, REBUILT
        // for (let i = 0; i < allLines.length; i++)
        // {
        //     if (allLines[i].match(titleRegexExp))
        //     {
        //         let word = allLines[i]; //Get line match
        //         word = word.replace("Title:","");
        //         word = word.replace(" ","");
        //         word.trim();

        //         lastNode = word; //Assign lastNode as the last title found

        //         if (word.length > 1)
        //         {
        //             tempTitles.push(lastNode); //Push to title list
        //             newNode.set(lastNode, new YarnNode(lastNode, i+1)); //Set in map
        //         }
        //     }
            
        //     else if (allLines[i].match(jumpRegexExp))
        //     {
        //         const w = allLines[i].match(jumpTitleRegexExp);
        //         if (w)
        //         {
        //             newJumps.push(new NodeJump(lastNode.trim(), w[1].trim()));
        //         }
        //     }

        //     else if (allLines[i].match(endRegexExp))
        //     {
        //         newNode.get(lastNode)?.setLineEnd(i + 1);
        //     }

        // }

        console.log(newNode);

        //Run comparison
        return this.compareTranslation(tempTitles, newNode, newJumps);
    }

    convertFromNodeToContent(): string
    {
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

    compareTranslation(recentTitles: string[], recentTranslation: Map<string,YarnNode>, newJumps: NodeJump[]) : ReturnObject[]
    {

        const returnList = [] as ReturnObject[];

        if (recentTranslation.size !== this.nodes.size)
        {
            // * Changes are afoot

            //First case: new title - notify renderer
            if (recentTranslation.size >= this.nodes.size)
            {
                recentTranslation.forEach((node,title) => 
                {
                    if (!this.nodes.has(title))
                    {
                        console.log(node + " has been added");
                        returnList.push(this.notifyAddition(node));
                    }
                });
            }

            //Second case: removed title - notify renderer
            else if (recentTranslation.size <= this.nodes.size)
            {
                this.nodes.forEach((node,title) => 
                {
                    if (!recentTranslation.has(title))
                    {
                        console.log(node + " has been removed");
                        returnList.push(this.notifyRemoval(node));
                    }
                });
            }
            console.log("Nodes have been reassigned");
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
        this.nodes = recentTranslation;
        this.titles = recentTitles;
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
    notifyAddition(newNode: YarnNode): ReturnObject
    {
        //Outputs the title of node to draw

        return new ReturnObject(ReturnCode.Add, this.jumps, newNode);
    }

    notifyRemoval(delNode: YarnNode): ReturnObject
    {
        //Outputs the title of node to undraw and remove
        return new ReturnObject(ReturnCode.Delete, this.jumps, delNode);
    }

    notifyTitleChange(oldTitle: string, newTitle: string): ReturnObject
    {
        //Outputs the title to change of a node
        return new ReturnObject(ReturnCode.Update, this.jumps, undefined, [oldTitle, newTitle]);
    }

    notifyOfJumps(): ReturnObject
    {
        this.validateJumps();
        
        return new ReturnObject(ReturnCode.Jumps, this.jumps);
        //Outputs this.jumps to nodeView
    }

}
