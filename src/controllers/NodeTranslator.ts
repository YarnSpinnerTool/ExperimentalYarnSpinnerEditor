/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
*/

export class NodeJump
{
    private sourceTitle: string;
    private targetTitle: string;
    private drawn = false;
    private isValidJump = false;

    constructor(sourceTitle: string, targetTitle: string)
    {
        this.sourceTitle = sourceTitle;
        this.targetTitle = targetTitle;
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

    isValidJumpCheck(): boolean
    {
        return this.isValidJump;
    }

    //TODO remainder of functions that this may need

}

export class YarnNode
{

    private title: string;
    private lineStart: number;
    private lineEnd: number;

    constructor(title: string, lineStart?: number, lineEnd?: number)
    {

        this.title = title;
        this.lineStart = -1;
        this.lineEnd = -1;

        if (lineStart)
        {
            this.lineStart = lineStart;
        }

        if (lineEnd)
        {
            this.lineEnd = lineEnd;
        }
    }

    getTitle(): string
    {
        return this.title;
    }

    getLineStart(): number
    {
        return this.lineStart;
    }

    getLineEnd(): number
    {
        return this.lineEnd;
    }

    setTitle(title: string): void
    {
        this.title = title;
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

    convertFromContentToNode(content: string) : void
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

        Title: 333
        headerTag: otherTest
        ---
        <<jump ttt>>
        ===

        Title: ttt
        headerTag: otherTest
        ---
        ===
        */

        const titleRegexExp = /(Title:.*)/g;//Get title match
        const endRegexExp = /===/g; //Get the end of the node match
        const jumpRegexExp = /<<jump.*?>>/; //Get the jump line match
        const jumpTitleRegexExp = /<<jump(.*?)>>/; //get the title from the jump command

        const allLines = content.split("\n");//Splits the content into a string array to increment over

        //Variables to hold to create new nodes
        let lastNode = "";

        //Should this just have another instance of the YarnNodeList object?
        const tempTitles = [] as string[];
        const newJumps = [] as NodeJump[];
        const newNode = new Map<string,YarnNode>();

        for (let i = 0; i < allLines.length; i++)
        {
            if (allLines[i].match(titleRegexExp))
            {
                let word = allLines[i]; //Get line match
                word = word.replace("Title:","").replace(" ", "");
                //word = word.replace(" ","");

                lastNode = word; //Assign lastNode as the last title found
                
                tempTitles.push(lastNode); //Push to title list

                newNode.set(lastNode, new YarnNode(lastNode, i+1)); //Set in map
            }
            
            else if (allLines[i].match(jumpRegexExp))
            {
                const w = allLines[i].match(jumpTitleRegexExp);
                if (w)
                {
                    newJumps.push(new NodeJump(lastNode, w[1]));
                }
            }

            else if (allLines[i].match(endRegexExp))
            {
                newNode.get(lastNode)?.setLineEnd(i + 1);
            }

        }

        //Run comparison
        this.compareTranslation(tempTitles, newNode, newJumps);

        console.log(this.nodes);
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

    compareTranslation(recentTitles: string[], recentTranslation: Map<string,YarnNode>, newJumps: NodeJump[]) : void
    {
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
                        console.log(title + " has been added");
                        this.notifyAddition(title);
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
                        console.log(title + " has been removed");
                        this.notifyRemoval(title);
                    }
                });
            }
            console.log("Nodes have been reassigned");
        }
        else if (recentTranslation.size === this.nodes.size)
        {
          
            //TODO SETH - adaptive title changes

            const oldTitle = "test";
            const newTitle = "newTest";

            this.notifyTitleChange(oldTitle, newTitle);
        }

        //Assign the new translation
        this.nodes = recentTranslation;
        this.jumps = newJumps;

        //Tell NodeView about the jumps
        this.notifyOfJumps();
    }


    //Disabling ESLint for now to prevent errors from unused vars and empty methods
    /* eslint-disable */
    /*
        For use with connecting NodeView with the Translated Nodes
    */
    notifyAddition(title: string): void
    {
        //Outputs the title of node to draw
    }

    notifyRemoval(title: string): void
    {
        //Outputs the title of node to undraw and remove
    }

    notifyTitleChange(newTitle: string, oldTitle: string): void
    {
        //Outputs the title to change of a node
    }

    notifyOfJumps(): void
    {
        this.validateJumps();

        //Outputs this.jumps to nodeView
    }

}
