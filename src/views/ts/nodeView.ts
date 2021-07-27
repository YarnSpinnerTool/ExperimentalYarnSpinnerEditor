/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

import Konva from "konva";

const sceneWidth  = 500;
const sceneHeight  = 500;
let selectedNode : Konva.Group; //selected node

const stage : Konva.Stage = new Konva.Stage({
    draggable: true,
    container: "nodeContainer",   // id of container <div>
    width: sceneWidth,
    height: sceneHeight,
});

const layer : Konva.Layer = new Konva.Layer();
stage.add(layer);
layer.draw();

// * Stage Mouse Events
// Zoom in/out by mouse scroll event

const scaleBy = 1.1;
stage.on("wheel", (e) => 
{
    e.evt.preventDefault();
    const scrollDirection = e.evt.deltaY;
    const oldScale = stage.scaleX();
    const mPos = stage.getPointerPosition();

    if(mPos)
    {
        const mousePosition = {
            x: (mPos.x - stage.x()) / oldScale,
            y: (mPos.y - stage.y()) / oldScale
        };

        if (scrollDirection > 0 && oldScale < 4)
        {
            stage.scale({x:(oldScale * scaleBy), y:(oldScale * scaleBy)});
        }
        else if (scrollDirection < 0 && oldScale > 0.5)
        {
            stage.scale({x:(oldScale / scaleBy), y:(oldScale / scaleBy)});
        }

        stage.x(mPos.x - mousePosition.x * stage.scaleX());
        stage.y(mPos.y - mousePosition.y * stage.scaleY());
    }
 
});

/**
 * Initialise and draw the konva stage
 * 
 * @returns {void}
 */
export function init() : void 
{
  
    //Add the layer to the stage.
    stage.add(layer);

    //Draw the layer.
    layer.draw();

    //Resize the stage appropriately, recall on window resize.
    responsiveSize();
    window.addEventListener("resize", responsiveSize);
}

/**  
 * Function for creating a new node externally.
 * 
 * @param {string} title The title of the node.
 * 
 * @returns {void}
 */
export function newNode(title : string) : void
{
    const node : Konva.Group = createNewGroupNode(title, 70, 70);
    node.name(title);
    layer.add(node);
    layer.draw();
}

/**  
 * Creating a new group with a rectangle and text shape.
 * 
 * @param {string} text String: The text of the node
 * @param {number} height Int: The height of the node
 * @param {number} width Int: The width of the node
 * 
 * @returns {Konva.Group} Konva node group
 */
function createNewGroupNode(text: string, height: number, width: number) 
{
    const nodeGroup : Konva.Group = new Konva.Group({
        draggable: true,
        name: text
    });

    nodeGroup.x(Math.random() * stage.width());
    nodeGroup.y(Math.random() * stage.height());
    // Add the rectangle using both h + w parameters.
    nodeGroup.add(
        new Konva.Rect({
            name:"bigSquare",
            width: width,
            height: height,
            fill: "#f5f0b0",
            stroke: "#f2deac",
            strokeWidth: 2,
            shadowColor: "black",
            shadowBlur: 10,
            shadowOffset: { x: 3, y: 3 },
            shadowOpacity: 0.2,
        })
    );
    
    nodeGroup.add(
        new Konva.Rect({
            width: width,
            height: height/5,
            fill: "#f2deac",
            stroke: "#f2deac",
            strokeWidth: 1,
        })
    );

    if (text.length > 12) 
    {
        text = text.substring(0, 10);
        text += "...";
    }


    // Add text using the parameter.
    nodeGroup.add(
        new Konva.Text({
            x: 1,
            // + ((width / 2) - (text.length * 2.75))
            y: 2,
            width: width,
            height: height/5,
            text: text,
            fill: "black",
            stroke: "black",
            strokeWidth: 0,
        })
    );

    //* Node Mouse Event
    // show software reaction to selection
    nodeGroup.on("click", function() 
    {
        let selectedSquare : Konva.Shape;
        if(selectedNode)
        {
            selectedSquare = selectedNode.findOne(".bigSquare");
            selectedSquare.shadowColor("black");
            selectedSquare.shadowOpacity(0.2);
        }

        selectedNode = this;
        selectedSquare = this.findOne(".bigSquare");
        selectedSquare.shadowColor("yellow");
        selectedSquare.shadowOpacity(0.8);
    });

    // double click to center on screen [test]
    nodeGroup.on("dblclick", function() 
    {
        const portCenter = {
            x: stage.width() / 2,
            y: stage.height() / 2,
        };

        const nodeCenter = {
            x: width / 2,
            y: height / 2,    // TODO: work out a better way to center the shape vertically
        };

        stage.x(-this.x() * stage.scaleX() + portCenter.x - (nodeCenter.x * stage.scaleX()));
        stage.y(-this.y() * stage.scaleY() + portCenter.y - (nodeCenter.y * stage.scaleY()));
    });
    return nodeGroup;
}

/**  
 * Function for connecting two nodes with a line. 
 * @param {string} from The title of the node where the line starts.
 * @param {string} to The title of the node where the line ends.
 * 
 * @returns {void}
 */
export function connectNodes(from : string, to : string) : void
{
  
    const nodeFrom = stage.findOne("."+from);
    const nodeTo = stage.findOne("."+to);
  
    // ! DEBUG
    console.log(stage.findOne("."+from));

    const nodeCenterLength = nodeTo.width() / 2;

    //Draw the line between the center of each node. 
    const line = new Konva.Line({
        points: [nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength],
        stroke: "black",
        tension: 1
    });  
    //Redraw the line when moving the from node.
    nodeFrom.on("dragmove", () => 
    {
        line.points([nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength]);
        layer.draw();
    });

    //Redraw the line when moving the to node.
    nodeTo.on("dragmove", () => 
    {
        line.points([nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength]);
        layer.draw();
    });
}

/**  
 * Function for responsively resizing the Konva stage.
 * 
 * @returns {void}
 */
function responsiveSize() : void
{
    //Retrieves the element that the Konva stage is in.
    const container = document.getElementById("nodeContainer");

    //Gets the width and height of the element.
    if (container != null)
    {
        const containerWidth : number = container.offsetWidth;
        const containerHeight : number = container.offsetHeight;
    
        const scale = containerWidth / sceneWidth;
        //Sets the width and height of the stage to fit the element, scales the layer appropriately.
        stage.width(containerWidth);
        stage.height(containerHeight);
        stage.scale({ x: scale, y: scale });
    }
  
}