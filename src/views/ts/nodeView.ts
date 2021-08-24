/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

import Konva from "konva";
import { YarnNode } from "../../models/YarnNode";
import { NodeJump } from "../../models/NodeJump";

const sceneWidth = 500;         // For comparing scale in responsiveSize()
const nodeMap = new Map<number,Konva.Group>();      // Map for storing all nodes.
const miniNodeMap = new Map<number,Konva.Group>();

const jumpMap = new Map<Array<number>, Konva.Group>();

let selectedNode: Konva.Group;  // Currently selected node for highlighting purposes.
let miniNodeY = 5;              // Variable to increment height of miniNodes.
let miniMapDetails: {x: number, y: number, scale: number};          // Global variable for storing the top right of the minimap image.

//Create the main stage.
const stage: Konva.Stage = new Konva.Stage({
    container: "nodeContainer", // id of html element to contain the stage.
    width: sceneWidth,
    height: sceneWidth,
    draggable: true,            // Crucial. For panning the stage.
});

stage.on("dragend", function () 
{
    updateMapPort();
});

const miniStage: Konva.Stage = new Konva.Stage({
    container: "miniNodeContainer", //id of html element to contain the mini left stage.
    width: 35,
    height: 420,
});

const miniMapStage: Konva.Stage = new Konva.Stage({
    container: "miniMapContainer",  // id of html element to contain the minimap in the bottom left.
    width: 200,
    height: 130,
});

const layer: Konva.Layer = new Konva.Layer();       //Main layer.
const miniLayer: Konva.Layer = new Konva.Layer();   //Mini layer.
const miniMapLayer: Konva.Layer = new Konva.Layer();//Minimap Layer.
//Add layers to the stage.
stage.add(layer);
miniStage.add(miniLayer);
miniMapStage.add(miniMapLayer);

//Draw the layers.
layer.draw();

//Resize the stage appropriately, recall on window resize.
responsiveSize();
zoomOnCursor();
window.addEventListener("resize", responsiveSize);

/**  
 * Function for creating a new node, and related mini node, externally.
 * 
 * @param {YarnNode} newNode The title of the node.
 * 
 * @returns {void}
 */
export function newNode(newNode: YarnNode): void 
{
    const node: Konva.Group = createNewGroupNode(newNode, 70, 70);
    node.name(newNode.getTitle());
    layer.add(node);
    layer.draw();
    updateMiniMap();

    const miniNodeSize = 50;

    const miniGroup = new Konva.Group({
        name: newNode.getTitle(),
        id: newNode.getUniqueIdentifier().toString()
    });
    const miniRect = new Konva.Rect({
        width: miniNodeSize,
        height: miniNodeSize,
        fill: "#f5f0b0",
        stroke: "#f2deac",
        strokeWidth: 2,
        shadowColor: "black",
        shadowBlur: 10,
        shadowOffset: { x: 1, y: 1 },
        shadowOpacity: 0.1,
        perfectDrawEnabled: false,
        x: miniStage.width() / 2 - (miniNodeSize / 2),
        y: miniNodeY,
    });
    const miniText = new Konva.Text({
        name: "text",
        width: miniNodeSize,
        height: miniNodeSize,
        fill: "black",
        ellipsis: true,
        perfectDrawEnabled: false,
        text: newNode.getTitle(),
        wrap: "word",
        fontSize: 10,
        x: miniStage.width() / 2 - (miniNodeSize / 2),
        y: miniNodeY,
        strokeWidth: 0,
    });

    // Adds all onclick functionality for the mini node.

    miniText.moveToTop();
    miniGroup.add(miniRect);
    miniGroup.add(miniText);

    miniLayer.add(miniGroup);
    miniGroup.on("click", function () 
    {
        //For centering the selected node.
        const node = nodeMap.get(parseInt(miniGroup.id()));
        centerNode(node);

        //For highlighting the selected node.
        selectNode(node);

        //For bringing the selected node to the top layer.
        node.moveToTop();
    });
    miniLayer.draw();

    //Increment the y value at which the mini node is drawn.
    miniNodeMap.set(newNode.getUniqueIdentifier(), miniGroup);
    miniNodeY += 36;
}

/**  
 * Creating a new group with a rectangle and text shape.
 * @param {YarnNode} node YarnNode: The node to create
 * @param {number} height Int: The height of the node
 * @param {number} width Int: The width of the node
 * 
 * @returns {Konva.Group} Konva node group
 */
function createNewGroupNode(node: YarnNode, height: number, width: number) 
{
    const nodeGroup: Konva.Group = new Konva.Group({
        draggable: true,
        name: node.getTitle(),
        id: node.getUniqueIdentifier().toString()
    });

    nodeGroup.x(-stage.x() * stage.scaleX() + (Math.random() * stage.width()));
    nodeGroup.y(-stage.y() * stage.scaleX() + (Math.random() * stage.height()));
    // Add the rectangle using both h + w parameters.
    nodeGroup.add(
        new Konva.Rect({
            name: "bigSquare",
            width: width,
            height: height,
            fill: "#f5f0b0",
            stroke: "#f2deac",
            strokeWidth: 2,
            shadowColor: "black",
            shadowBlur: 10,
            shadowOffset: { x: 3, y: 3 },
            shadowOpacity: 0.2,
            perfectDrawEnabled: false,
        })
    );

    nodeGroup.add(
        new Konva.Rect({
            width: width,
            height: height / 5,
            fill: "#f2deac",
            stroke: "#f2deac",
            strokeWidth: 1,
            perfectDrawEnabled: false,
        })
    );

    // Add text using the parameter.
    nodeGroup.add(
        new Konva.Text({
            x: 1,
            // + ((width / 2) - (text.length * 2.75))
            y: 2,
            name: "text",
            width: width,
            height: height / 5,
            text: node.getTitle(),
            fill: "black",
            stroke: "black",
            strokeWidth: 0,
            perfectDrawEnabled: false,
            ellipsis: true,
        })
    );

    //* Node Mouse Event
    // show software reaction to selection
    nodeGroup.on("click", function () 
    {
        selectNode(this);
    });

    // double click to center on screen [test]
    nodeGroup.on("dblclick", function () 
    {
        centerNode(this);
    });

    //Move selected node to top.
    nodeGroup.on("click", function () 
    {
        nodeGroup.moveToTop();
    });

    nodeGroup.on("dragend", function () 
    {
        updateMiniMap();
    });
    nodeGroup.moveToTop();

    nodeMap.set(node.getUniqueIdentifier(), nodeGroup);
    return nodeGroup;
}

/**  
 * Function for connecting two nodes with a line. 
 * @param {string} from The title of the node where the line starts.
 * @param {string} to The title of the node where the line ends.
 * 
 * @returns {void}
 */
export function connectNodes(from: number, to: number): void 
{

    const nodeFrom: Konva.Group = nodeMap.get(from);
    const nodeTo: Konva.Group = nodeMap.get(to);
    const arrow = new Konva.Group();
    const nodeCenterLength: number = nodeTo.getChildren()[0].width() / 2;
    if (nodeFrom === nodeTo)
    {
        const circle = new Konva.Circle({
            radius: 35,
            x: nodeTo.x() + nodeCenterLength * 2,
            y: nodeTo.y(),
            stroke: "black",
            perfectDrawEnabled: false,
        });
        const arrow2 = new Konva.Arrow({
            points: [nodeFrom.x() + nodeCenterLength * 2, nodeFrom.y() + nodeCenterLength, nodeFrom.x() + nodeCenterLength * 2 + 10, nodeFrom.y() + nodeCenterLength - 2],
            stroke: "black",
            tension: 1,
            pointerLength: 15,
            pointerWidth: 15,
            fill: "black",
            perfectDrawEnabled: false,
            pointerAtBeginning: true,
            pointerAtEnding: false,
        }
        );
        arrow.add(arrow2);
        arrow.add(circle);
        nodeFrom.on("dragmove", () => 
        {
            const nodeCenterLength: number = nodeTo.getChildren()[0].width() / 2;
            arrow2.points([nodeFrom.x() + nodeCenterLength * 2, nodeFrom.y() + nodeCenterLength, nodeFrom.x() + nodeCenterLength * 2 + 10, nodeFrom.y() + nodeCenterLength - 2]);
            circle.x(nodeTo.x() + nodeCenterLength * 2);
            circle.y(nodeTo.y());
            layer.draw();
        });
    }
    else
    {
    //Draw the line between the center of each node. 
        const line = new Konva.Arrow({
            points: [nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength],
            stroke: "black",
            tension: 1,
            pointerLength: 50,
            pointerWidth: 15,
            fill: "black",
            perfectDrawEnabled: false,
        });
        //Add to the layer
        arrow.add(line);
        
        //Redraw the line when moving the from node.
        nodeFrom.on("dragmove", () => 
        {
            const nodeCenterLength: number = nodeTo.getChildren()[0].width() / 2;
            line.points([(nodeFrom.x() + nodeCenterLength), (nodeFrom.y() + nodeCenterLength), (nodeTo.x() + nodeCenterLength), (nodeTo.y() + nodeCenterLength)]);
            layer.draw();
        });

        //Redraw the line when moving the to node.
        nodeTo.on("dragmove", () => 
        {
            const nodeCenterLength: number = nodeTo.getChildren()[0].width() / 2;
            line.points([(nodeFrom.x() + nodeCenterLength), (nodeFrom.y() + nodeCenterLength), (nodeTo.x() + nodeCenterLength), (nodeTo.y() + nodeCenterLength)]);
            layer.draw();
        });
    }
    //Add to the map of jumps
    jumpMap.set([from, to], arrow);
    layer.add(arrow);
    arrow.moveToBottom();
    layer.draw;
    updateMiniMap();
}

/**
 * * Zooming Functionality
 *   Zoom's relative to the cursor position.
 *   @returns {void}
 */
function zoomOnCursor() 
{
    const scaleBy = 1.1;
    stage.on("wheel", (e) => 
    {
        e.evt.preventDefault();
        const scrollDirection = e.evt.deltaY;
        const oldScale = stage.scaleX();
        const mPos = stage.getPointerPosition();

        if (mPos) 
        {
            const mousePosition = {
                x: (mPos.x - stage.x()) / oldScale,
                y: (mPos.y - stage.y()) / oldScale
            };

            if (scrollDirection > 0 && oldScale < 4) 
            {
                stage.scale({ x: (oldScale * scaleBy), y: (oldScale * scaleBy) });
            }
            else if (scrollDirection < 0 && oldScale > 0.5) 
            {
                stage.scale({ x: (oldScale / scaleBy), y: (oldScale / scaleBy) });
            }

            stage.x(mPos.x - mousePosition.x * stage.scaleX());
            stage.y(mPos.y - mousePosition.y * stage.scaleY());
            updateMapPort();
        }

    });
}

/**
 * * Center Node
 *   Center a node in the stage.
 *   @param {Konva.Group} focus node that will become center of the stage
 *   @returns {void}
 */
function centerNode(focus: Konva.Group): void 
{
    const width = focus.getChildren()[0].width();

    const portCenter = {
        x: stage.width() / 2,
        y: stage.height() / 2,
    };

    const nodeCenter = {
        x: width / 2,
        y: width / 2,
    };

    stage.x(-focus.x() * stage.scaleX() + portCenter.x - nodeCenter.x * stage.scaleX());
    stage.y(-focus.y() * stage.scaleY() + portCenter.y - nodeCenter.y * stage.scaleY());
}

/**
 * * On Select Node
 *   Update selected and changes visual state as node is clicked/selected.
 *   @param {Konva.Group} node the node being selected
 *   @returns {void}
 */
function selectNode(node: Konva.Group): void 
{
    let selectedSquare: Konva.Shape;
    if (selectedNode) 
    {
        selectedSquare = selectedNode.findOne(".bigSquare");
        selectedSquare.shadowColor("black");
        selectedSquare.shadowOpacity(0.2);
    }

    selectedNode = node;
    selectedSquare = node.findOne(".bigSquare");
    selectedSquare.shadowColor("yellow");
    selectedSquare.shadowOpacity(0.8);
}

/**  
 * * Function for responsively resizing the Konva stage.
 * 
 * @returns {void}
 */
export function responsiveSize(): void 
{
    //Retrieves the element that the Konva stage is in.
    const container = document.getElementById("nodeContainer");
    const miniContainer = document.getElementById("miniNodeContainer");
    const miniMapContainer = document.getElementById("miniMapContainer");

    //Gets the width and height of the element.
    if (container && miniContainer && miniMapContainer) 
    {
        const miniNodeWidth = 75;
        miniStage.width(miniNodeWidth);

        const parentContainer = container.parentElement;

        if (parentContainer && parentContainer.offsetHeight) 
        {
            // const containerWidth: number = container.clientWidth;
            const containerWidth: number = parentContainer.offsetWidth - miniNodeWidth;
            const containerHeight: number = parentContainer.offsetHeight;

            console.log("Width is: " + containerWidth);
            //Sets the width and height of the stage to fit the element, scales the layer appropriately.
            
            stage.width(containerWidth);
            stage.height(containerHeight);
            
            // To scale on screen resize, uncomment.
            // const scale = (containerWidth - miniNodeWidth) / sceneWidth; 
            // stage.scale({ x: scale, y: scale });
            
            if(parentContainer.offsetWidth < 400) 
            {
                miniMapContainer.style.display = "none";
            }
            else 
            {
                miniMapContainer.style.removeProperty("display");
            }
            
        }
    }

}

/**
 * Mini Map Update function updates the view on the mini map on each call
 * 
 * @returns {void}
 */
function updateMiniMap() 
{
    const defaultScale = 0.2;
    const mapGroup: Konva.Group = new Konva.Group;

    let maxY: number = layer.getChildren()[0].y();   // for distance between shapes
    let minY: number = layer.getChildren()[0].y();
    let maxX: number = layer.getChildren()[0].x();
    let minX: number = layer.getChildren()[0].x();
    for (const i of layer.getChildren()) 
    {
        if (maxY < i.y()) { maxY = i.y(); }

        if (minY > i.y()) { minY = i.y(); }

        if (maxX < i.x()) { maxX = i.x(); }

        if (minX > i.x()) { minX = i.x(); }

        const clonedShape = i.clone();
        mapGroup.add(clonedShape);
    }

    // find the smallest ratio
    const idealScale = Math.min(
        miniMapStage.height() / (maxY - minY + 100),
        miniMapStage.width() / (maxX - minX + 100),
        defaultScale);  // if default scale is smaller, use that
    
    // store map details for view port estimates
    miniMapDetails = {
        x: minX,
        y: minY,
        scale: idealScale,
    };

    const layerCopy = mapGroup.toCanvas({
        pixelRatio: idealScale,
    });

    const mapCenter = {
        x: miniMapStage.width() / 2,
        y: miniMapStage.height() / 2
    };

    const imageCenter = {
        x: layerCopy.width / 2,
        y: layerCopy.height / 2,
    };

    if (!miniMapLayer.getChildren()[0])  // Initialise map image
    {
        miniMapLayer.add(   // add layer copy as image
            new Konva.Image({
                name: "background",
                image: layerCopy,
                x: mapCenter.x - imageCenter.x,
                y: mapCenter.y - imageCenter.y,
            })
        );

        miniMapLayer.add(   // add viewport square
            new Konva.Rect({
                name: "viewPort",
                stroke: "white",
                fill: "#abbec220",
                strokeWidth: 1,
                x: 0,
                y: 0,
                perfectDrawEnabled: false,
            })
        );
    }
    else 
    {
        const image: Konva.Image = miniMapLayer.findOne(".background");

        image.image(layerCopy);
        image.x(mapCenter.x - imageCenter.x);
        image.y(mapCenter.y - imageCenter.y);
    }
    updateMapPort();
}

/**
* * Update view port position
*   updates the position of the viewport in minimap
*   @returns {void}
*/
function updateMapPort() 
{
    if (miniMapLayer.findOne(".viewPort"))
    {
        const view = miniMapLayer.findOne(".viewPort"); // get view port square
        const back = miniMapLayer.findOne(".background");   // get the image of the background
        const relativePos = // get the position of the mini map image inside the stage
        {
            x: (stage.x() / stage.scaleX()) + miniMapDetails.x,
            y: (stage.y() / stage.scaleX()) + miniMapDetails.y
        };

        // position the view then incorporate the center distance of the image
        view.x((-relativePos.x * miniMapDetails.scale) + ((miniMapStage.width() - back.width()) / 2));
        view.y((-relativePos.y * miniMapDetails.scale) + ((miniMapStage.height() - back.height()) / 2));

        // make the view size relative to the main stage
        view.width((stage.width() / stage.scaleX()) * miniMapDetails.scale);
        view.height((stage.height() / stage.scaleX()) * miniMapDetails.scale);
    }
}

/**  
 * * Function for updating the name of a node.
 * @param {YarnNode} titleNode The node to rename
 * @returns {void}
 */
export function changeNodeName(titleNode: YarnNode) : void
{
    console.log("Changing node name");

    //get value from both miniNodeMap and nodeMap
    const tempNode: Konva.Group = nodeMap.get(titleNode.getUniqueIdentifier());
    const tempMiniNode: Konva.Group = miniNodeMap.get(titleNode.getUniqueIdentifier());

    console.log("mini node map");
    console.log(miniNodeMap);
    //update the text 
    // ! Type mismatch, findOne returns any shape
    //@ts-expect-error Forge
    tempNode.findOne(".text").text(titleNode.getTitle());
    
    //@ts-expect-error Forge
    tempMiniNode.findOne(".text").text(titleNode.getTitle());

    //update the name
    tempNode.name(titleNode.getTitle());
    tempMiniNode.name(titleNode.getTitle());
}

/**  
 * Function for getting info on all nodes, including x & y position, and title.
 * Behaviour not finalised.
 * @returns {string} String values of all nodes.
 */
export function printAll() : string
{
    let output = "";

    nodeMap.forEach((node) => 
    {
        output += "Title: " + node.name() + ", x value: " + node.x() + ", y value: " + node.y() + "\n";
    });
    return (output);
}
/**  
 * * Function for getting the x, y position of one node, given the title.
 *  Behaviour not finalised.
 * 
 * @param {number} idNumber The unique ID number of the node to print
 * 
 * @returns {string} The value the node.
 */
export function printByName(idNumber: number) : string
{
    const node = nodeMap.get(idNumber);
    const output: string = "Title: " + node.name() + ", x value: " + node.x() + ", y value: " + node.y() + "\n";
    return output;
}

/**  
 * * Function for removing a node.
 *  Behaviour not finalised.
 * 
 * @param {YarnNode} deletedNode The node that needs to be removed
 * 
 * @returns {void}
 */
export function removeNode(deletedNode: YarnNode) : void
{

    //REMOVE MINI NODE AND NORMAL NODE FROM MAP
    //REMOVE GROUP FROM LAYER 
    nodeMap.get(deletedNode.getUniqueIdentifier()).destroy();
    nodeMap.delete(deletedNode.getUniqueIdentifier());

    miniNodeMap.get(deletedNode.getUniqueIdentifier()).destroy();
    miniNodeMap.delete(deletedNode.getUniqueIdentifier());

    updateMiniMap();
    //TODO MOVE ALL MINI NODES

    //TODO REMOVE JUMPS
}


//TODO convert to full node passthrough for further functionality
/**
 * Add node to display.
 * 
 * @param {YarnNode} node The node to add.
 * 
 * @returns {void}
 */
export function addNode(node: YarnNode) : void
{
    newNode(node);
}

/**
 * Draw lines between nodes.
 * 
 * @param {NodeJump[]} jumps The list of jumps to draw.
 * 
 * @returns {void}
 */
export function receiveJumps(jumps: NodeJump[]) : void
{
    
    //DESTROY ALL THE ARROWS
    jumpMap.forEach(arrow => {
        arrow.destroy();
    });

    //CLEAR THE MAP
    jumpMap.clear();

    //DRAW ALL THE NEW ARROWS
    for (let i = 0; i < jumps.length ; i++)
    {
        connectNodes(jumps[i].getSource(), jumps[i].getTarget());
    }
    console.log("jumpMapLength HERE "+jumpMap.size); // ! DEBUG
    console.log("jumps param length here HERE "+jumps.length);
    /*
    const oldJumps = Array.from(jumpMap.keys());
    const newJumps = new Array<Array<number>>();

    //Receive new jumps from param for easier comparison
    for (let i = 0; i < jumps.length; i++) 
    {

        newJumps[i] = [jumps[i].getSource(), jumps[i].getTarget()];
        console.log("THIS IS NEW JUMPS " + newJumps[i]);
    }
    for (let i = 0; i < oldJumps.length ; i++) 
    {
        console.log("THIS IS OLD JUMPS" + oldJumps[i]);
    }
    //JUMPS THAT EXIST IN newJumps BUT NOT oldJumps
    const addedJumps = new Array<Array<number>>();
    newJumps.forEach(newJump =>
    {
        var contains: Boolean = false;
        oldJumps.forEach(oldJump =>
        {
           if(oldJump[0] == newJump[0] && oldJump[1] == newJump[1])
           {
                contains = true;
           }
        });

        if(contains == false)
        {
            console.log("adding jump " + newJump); // ! DEBUG
            addedJumps.push(newJump);
        }
    });
    
    //JUMPS THAT EXIST IN oldJumps BUT NOT newJumps
    const deletedJumps = new Array<Array<number>>();
    oldJumps.forEach(oldJump =>
    {
        var contains: Boolean = false;
        newJumps.forEach(newJump => 
        {
           if(oldJump[0] == newJump[0] && oldJump[1] == newJump[1])
           {
                contains = true;
           }
        });

        if(contains == false)
        {
            console.log("deleting jump " + oldJump); // ! DEBUG
            deletedJumps.push(oldJump);
        }
    });

    addedJumps.forEach(addedJump => {
        console.log("added jump"); // ! DEBUG
        connectNodes(addedJump[0], addedJump[1]);
    });

    deletedJumps.forEach(deletedJump => {
        console.log("removed jump"); // ! DEBUG
        removeJump(deletedJump[0], deletedJump[1]);
    });
    */
   
}

/**
 * Delete jumps
 * Should just be get([from,to]).destroy();
 * delete([from,to]);
 */
function removeJump(from: number, to: number){
    
    jumpMap.delete([from, to]);
    jumpMap.forEach((value, key) =>
    {
        if(key[0] == from && key[1] == to){
            value.destroy();
        }
    });
}