/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

import Konva from "konva";
import { forEachChild } from "typescript";

const sceneWidth = 500;         // For comparing scale in responsizeSize()
var nodeMap = new Map();      // Map for storing all nodes.
var miniNodeMap = new Map();
let selectedNode: Konva.Group;  // Currently selected node for highlighting purposes.
let miniNodeY = 5;              // Variable to increment height of miniNodes.

//Create the main stage.
const stage: Konva.Stage = new Konva.Stage({
    container: "nodeContainer", // id of html element to contain the stage.
    width: sceneWidth,
    height: sceneWidth,
    draggable: true,            // Crucial. For panning the stage.
});

const miniStage: Konva.Stage = new Konva.Stage({
    container: "miniNodeContainer", //id of html element to contain the mini left stage.
    width: 35,
    height: 420,
});


const layer: Konva.Layer = new Konva.Layer();       //Main layer.
const miniLayer: Konva.Layer = new Konva.Layer();   //Mini layer.

//Add both layers to the stage.
stage.add(layer);
miniStage.add(miniLayer);

//Draw the layers.
layer.draw();

//Resize the stage appropriately, recall on window resize.
responsiveSize();
zoomOnCursor();
window.addEventListener("resize", responsiveSize);

/**  
 * Function for creating a new node, and related mini node, externally.
 * 
 * @param {string} title The title of the node.
 * 
 * @returns {void}
 */
export function newNode(title: string): void 
{
    var node: Konva.Group = createNewGroupNode(title, 70, 70);
    node.name(title);
    layer.add(node);
    layer.draw();

    var miniGroup = new Konva.Group({
        name: title,
    });
    var miniRect = new Konva.Rect({
        width: 30,
        height: 30,
        fill: "#f5f0b0",
        stroke: "#f2deac",
        strokeWidth: 2,
        shadowColor: "black",
        shadowBlur: 10,
        shadowOffset: { x: 1, y: 1 },
        shadowOpacity: 0.1,
        perfectDrawEnabled: false,
        x: miniStage.width() / 2 - (15),
        y: miniNodeY,
    });
    var miniText = new Konva.Text({
        name: "text",
        width: 30,
        height: 30,
        fill: "black",
        ellipsis: true,
        perfectDrawEnabled: false,
        text: title,
        wrap: "word",
        fontSize: 8,
        x: miniStage.width() / 2 - (15),
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
        const node = nodeMap.get(miniGroup.name());
        centerNode(node);

        //For highlighting the selected node.
        selectNode(node);

        //For bringing the selected node to the top layer.
        node.moveToTop();
    });
    miniLayer.draw();

    //Increment the y value at which the mini node is drawn.
    miniNodeY += 36;

    miniNodeMap.set(title,miniGroup);
}

/**  
 * Creating a new group with a rectangle and text shape.
 * TODO CHECK FOR DUPLICATE TITLE NAME
 * @param {string} text String: The text of the node
 * @param {number} height Int: The height of the node
 * @param {number} width Int: The width of the node
 * 
 * @returns {Konva.Group} Konva node group
 */
function createNewGroupNode(text: string, height: number, width: number) 
{
    const nodeGroup: Konva.Group = new Konva.Group({
        draggable: true,
        name: text
    });

    nodeGroup.x(Math.random() * stage.width());
    nodeGroup.y(Math.random() * stage.height());
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
            text: text,
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
    nodeGroup.moveToTop();

    nodeMap.set(text, nodeGroup);
    return nodeGroup;
}

/**  
 * Function for connecting two nodes with a line. 
 * @param {string} from The title of the node where the line starts.
 * @param {string} to The title of the node where the line ends.
 * 
 * @returns {void}
 */
export function connectNodes(from: string, to: string): void 
{

    const nodeFrom: Konva.Group = nodeMap.get(from);
    const nodeTo: Konva.Group = nodeMap.get(to);

    const nodeCenterLength : number = nodeTo.getChildren()[0].width() / 2;
    
    console.log(nodeTo);

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
    layer.add(line);
    line.moveToBottom();
    layer.draw;

    //Redraw the line when moving the from node.
    nodeFrom.on("dragmove", () => 
    {
        const nodeCenterLength : number = nodeTo.getChildren()[0].width() / 2;
        line.points([ (nodeFrom.x() + nodeCenterLength), (nodeFrom.y() + nodeCenterLength), (nodeTo.x() + nodeCenterLength), (nodeTo.y() + nodeCenterLength)]);
        layer.draw();
    });

    //Redraw the line when moving the to node.
    nodeTo.on("dragmove", () => 
    {
        const nodeCenterLength : number = nodeTo.getChildren()[0].width() / 2;
        line.points([ (nodeFrom.x() + nodeCenterLength), (nodeFrom.y() + nodeCenterLength), (nodeTo.x() + nodeCenterLength), (nodeTo.y() + nodeCenterLength)]);
        layer.draw();
    });
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
        }
    
    });
}

/**
 * * Center Node
 *   Center a node in the stage.
 *   @param {Konva.Group} focus node that will become center of the stage
 *   @returns {void}
 */
function centerNode(focus : Konva.Group): void
{
    const width = focus.getChildren()[0].width();
    const portCenter = {
        x: stage.width() / 2,
        y: stage.height() / 2,
    };

    const nodeCenter = {
        x: width / 2,
        y: width / 2,  // TODO: work out a better way to center the shape vertically
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
function selectNode(node : Konva.Group): void
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
function responsiveSize(): void 
{
    //Retrieves the element that the Konva stage is in.
    const container = document.getElementById("nodeContainer");
    const miniContainer = document.getElementById("miniNodeContainer");

    //Gets the width and height of the element.
    if (container != null) 
    {
        const containerWidth: number = container.offsetWidth;
        const containerHeight: number = container.offsetHeight;

        const scale = containerWidth / sceneWidth;
        //Sets the width and height of the stage to fit the element, scales the layer appropriately.
        stage.width(containerWidth);
        stage.height(containerHeight);
        stage.scale({ x: scale, y: scale });
    }
    if (miniContainer != null)
    {
        const miniContainerWidth: number = miniContainer.offsetWidth;
        const miniContainerHeight: number = miniContainer.offsetHeight;

        //Sets the width and height of the stage to fit the element, scales the layer appropriately.
        miniStage.width(miniContainerWidth);
        miniStage.height(miniContainerHeight);
    }

}


/**  
 * * Function for updating the name of a node.
 * TODO CHECK FOR DUPLICATE TITLE NAME
 * @param {string} oldName The current name of the node.
 * @param {string} newName The new name to update the node to.
 * @returns {void}
 */
export function changeNodeName(oldName: string, newName: string) 
{
    //get value from both miniNodeMap and nodeMap
    const tempNode : Konva.Group = nodeMap.get(oldName);
    const tempMiniNode : Konva.Group = miniNodeMap.get(oldName);

    
    //update the text 
    // ! Type mismatch, findOne returns any shape
    tempNode.findOne(".text").text(newName);
    tempMiniNode.findOne(".text").text(newName);
      
    //update the name
    tempNode.name(newName);
    tempMiniNode.name(newName);

    //change the reference in the maps to the new name
    nodeMap.set(newName, tempNode);
    miniNodeMap.set(newName, tempMiniNode);

    //delete old values
    nodeMap.delete(oldName);
    nodeMap.delete(oldName);
}

/**  
 * * Function for getting info on all nodes, including x & y position, and title.
 * Behaviour not finalised.
 * @returns {string}
 */
export function printAll(){
    var output : string = "";

    nodeMap.forEach((node) => {
        output += "Title: " + node.name() + ", x value: " + node.x() + ", y value: " + node.y() + "\n";
    });
    return (output);
}
/**  
 * * Function for getting the x, y position of one node, given the title.
 *  Behaviour not finalised.
 * 
 * @param {string} name The name of the node to be printed
 * 
 * @returns {string}
 */
export function printByName(name : string) {
    const node = nodeMap.get(name);
    var output : string = "Title: " + node.name() + ", x value: " + node.x() + ", y value: " + node.y() + "\n";
    return output;
}
