/**
 * Generates a random integer based on min and max range
 * @param {number} min Minimum number to begin the range from
 * @param {number} max Maximum number to end the range on
 * @returns {number} Randomised number between min and max (inclusive of max)
 */
function getRandomIntInclusive(min : number, max : number): number
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // max & min both included 
}


class NodeTranslationTemporaryObject
{
    parentNode?: NodeObject;
    identificationNumber = -1;
    title?: string;

    isObjectNodeReady()
    {
        if (this.identificationNumber === -1)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    
    attemptConversionToNodeObject()
    {
        if (this.isObjectNodeReady())
        {
            return this.convertToNodeObject();
        }
        else
        {
            return null;
        }
    }

    convertToNodeObject()
    {
        return new NodeObject(this.identificationNumber, this.title, this.parentNode);
    }
}

export class NodeObject
{
    parentNode?: NodeObject;
    children: NodeObject[];
    
    familyHierarchyPath: number[]; //Uses the ID numbers
    identificationNumber: number;
    title?: string;

    xPosition?: number;
    yPosition?: number;

    constructor(identificationNumber: number, title?: string, parentNode?: NodeObject)
    {
        this.identificationNumber = identificationNumber;
        if (title)
        {
            this.title = title;
        }

        if (parentNode)
        {
            this.parentNode = parentNode;
        }

        this.children = [];
        this.buildFamilyHierarchy();
    }

    getParentNode()
    {
        return this.parentNode;
    }

    getChildren()
    {
        return this.children;
    }

    getFamilyHierarchyPath()
    {
        return this.familyHierarchyPath;
    }

    getIdentificationNumber()
    {
        return this.identificationNumber;
    }

    getTitle()
    {
        return this.title;
    }

    getXPosition()
    {
        return this.xPosition;
    }

    getYPosition()
    {
        return this.yPosition;
    }

    setParentNode(parent: NodeObject)
    {
        this.parentNode = parent;
    }

    setChildren(children: NodeObject[])
    {
        this.children = children;
    }

    setFamilyHierarchyPath(path: number[])
    {
        this.familyHierarchyPath = path;
    }

    setIdentificationNumber(identificationNumber: number)
    {
        this.identificationNumber = identificationNumber;
    }

    setTitle(title: string)
    {
        this.title = title;
    }

    setPosition(xPosition: number, yPosition: number)
    {
        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    buildFamilyHierarchy()
    {
        let nodeToCheck: NodeObject = this.parentNode;
        const newPath: number[] = [];

        while (nodeToCheck != null && !newPath.includes(nodeToCheck.identificationNumber))
        {
            newPath.push(nodeToCheck.getIdentificationNumber());
            nodeToCheck = nodeToCheck.getParentNode();
        }

        if (newPath.length > 0)
        {
            //Ensures that the first element is it's oldest ancestor
            if (newPath[0] !== this.parentNode.identificationNumber)
            {
                newPath.reverse();
            }
        }

        this.setFamilyHierarchyPath(newPath);
    }

    addChild(child: NodeObject)
    {
        this.children.push(child);
        child.setParentNode(this);
        child.buildFamilyHierarchy();
    }

    //! Untested
    removeChild(child: NodeObject)
    {
        this.children.splice(this.children.indexOf(child) , 1);
    }

    returnNodeLevel()
    {
        this.buildFamilyHierarchy();
        return this.familyHierarchyPath.length;
    }
}

export class TreeRepresentationOfGraph
{
    rootNode: NodeObject;
    allNodes: Map<number, NodeObject> = new Map<number,NodeObject>();
    deepestLevel = 0;

    constructor(rootNode?: NodeObject)
    {

        if (rootNode)
        {
            this.rootNode = rootNode;
            this.allNodes.set(rootNode.getIdentificationNumber(), rootNode);
            this.deepestLevel = 1;
        }

        console.log("Creating tree");
    }

    setRootNode(rootNode: NodeObject)
    {
        this.rootNode = rootNode;
    }

    addChildToNodeList(nodeToAdd: NodeObject)
    {
        this.allNodes.set(nodeToAdd.getIdentificationNumber(), nodeToAdd);
    }

    addChildToNode(parentNode: NodeObject, childNode: NodeObject)
    {
        parentNode.addChild(childNode);
        this.allNodes.set(childNode.getIdentificationNumber(), childNode);

        this.checkAndSetNewDeepestLevel(parentNode.getIdentificationNumber());
    }

    addChildToNodeParentID(parentNode: number, childNode: NodeObject)
    {
        this.allNodes.get(parentNode).addChild(childNode);
        this.allNodes.set(childNode.getIdentificationNumber(), childNode);

        this.checkAndSetNewDeepestLevel(parentNode);
    }

    addChildIDToNodeParentID(parentNode: number, childNode: number)
    {
        this.allNodes.get(parentNode).addChild(this.allNodes.get(childNode));
        this.checkAndSetNewDeepestLevel(parentNode);
    }

    checkAndSetNewDeepestLevel(nodeToCheckID: number)
    {
        if (this.allNodes.get(nodeToCheckID).returnNodeLevel() + 1 > this.deepestLevel)
        {
            this.deepestLevel = this.allNodes.get(nodeToCheckID).returnNodeLevel() + 1;
        }
    }

    buildTreeCoordinates(nodeWidth: number, nodeHeight: number,marginHorizontal: number, marginVertical: number)
    {
        const levels: NodeObject[][] = [];

        console.log("deepestLevel: " + this.deepestLevel);

        this.rootNode.parentNode = undefined;
        this.rootNode.buildFamilyHierarchy();

        for(let i = 0; i <= this.deepestLevel; i++)
        {
            levels.push([]);
        }

        this.allNodes.forEach((node, idNumber) => {

            levels[node.returnNodeLevel()].push(node);            
        });

        let levelWithHighestLength = 0;

        for (let i = 0; i < levels.length; i++)
        {
            if (levels[levelWithHighestLength].length < levels[i].length)
            {
                levelWithHighestLength = i;
            }


            console.log("Level: " + i + " with: " + levels[i].length + " nodes");
        }
        
        console.log("Level with the highest length: " + levelWithHighestLength);
        console.log("With: " + levels[levelWithHighestLength].length);


        for (let i = 0; i < levels.length; i++)
        {
            for (let j = 0; j < levels[i].length; j++)
            {
                this.allNodes.get(levels[i][j].getIdentificationNumber()).setPosition(((marginHorizontal + nodeWidth) * j), (i * (nodeHeight + marginVertical)) );
            }
        }


    }
}
