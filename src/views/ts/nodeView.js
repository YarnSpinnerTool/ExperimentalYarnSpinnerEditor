/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

import Konva from "konva";

var sceneWidth = 500;
var sceneHeight = 500;

var stage = new Konva.Stage({
  container: 'nodeContainer',   // id of container <div>
  width: sceneWidth,
  height: sceneHeight,
});
var layer = new Konva.Layer();
stage.add(layer);
layer.draw();

// * Initialise and draw the Konva stage.
export function init() {
  
  //Add the layer to the stage.
  stage.add(layer);

  //Draw the layer.
  layer.draw();

  //Resize the stage appropriately, recall on window resize.
  responsiveSize();
  window.addEventListener('resize', responsiveSize);
}

/**  
 * * Function for creating a new node externally.
 * @param title String: The title of the node.
 */
export function newNode(title) {
  var node = createNewGroupNode(title, 70, 70);
  node.name(title);
  layer.add(node);
  layer.draw();
}

/**  
 * * Creating a new group with a rectangle and text shape.
 * @param text String: The text of the node
 * @param height Int: The height of the node
 * @param width Int: The width of the node
 */
function createNewGroupNode(text, height, width) {
  var nodeGroup = new Konva.Group({
    draggable: true,
    name: text
  });

  var randX = Math.random() * stage.width();
  var randY = Math.random() * stage.height();
  // Add the rectangle using both h + w parameters.
  nodeGroup.add(
    new Konva.Rect({
      x: randX,
      y: randY,
      width: width,
      height: height,
      fill: '#f5f0b0',
      stroke: '#f2deac',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 3, y: 3 },
      shadowOpacity: 0.2,
    })
  );

  nodeGroup.add(
    new Konva.Rect({
      x: randX,
      y: randY,
      width: width,
      height: height/5,
      fill: '#f2deac',
      stroke: '#f2deac',
      strokeWidth: 1,
    })
  );

  if (text.length > 12) {
    text = text.substring(0, 10);
    text += "...";
  };


  // Add text using the parameter.
  nodeGroup.add(
    new Konva.Text({
      x: randX + 1,
      // + ((width / 2) - (text.length * 2.75))
      y: randY + 2,
      width: width,
      height: height/5,
      text: text,
      fill: "black",
      stroke: "black",
      strokeWidth: 0,
    })
  );
  return nodeGroup;
}

/**  
 * * Function for connecting two nodes with a line. 
 * @param from String: The title of the node where the line starts.
 * @param to String: The title of the node where the line ends.
 */
export function connectNodes(from, to) {
  
  var nodeFrom = stage.findOne("."+from);
  var nodeTo = stage.findOne("."+to);
  
  // ! DEBUG
  console.log(stage.findOne("."+from));

  var nodeCenterLength = nodeTo.width() / 2;

  //Draw the line between the center of each node. 
  var line = new Konva.Line({
    points: [nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength],
    stroke: 'black',
    tension: 1
  });  
  //Redraw the line when moving the from node.
  nodeFrom.on("dragmove", () => {
    line.points([nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength]);
    layer.draw();
  });

  //Redraw the line when moving the to node.
  nodeTo.on("dragmove", () => {
    line.points([nodeFrom.x() + nodeCenterLength, nodeFrom.y() + nodeCenterLength, nodeTo.x() + nodeCenterLength, nodeTo.y() + nodeCenterLength]);
    layer.draw();
  });
}

/**  
 * * Function for responsively resizing the Konva stage.
 */
function responsiveSize() {
  //Retrieves the element that the Konva stage is in.
  var container = document.getElementById('nodeContainer');

  //Gets the width and height of the element.
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;

  //Sets the width and height of the stage to fit the element, scales the layer appropriately.
  var scale = containerWidth / sceneWidth;
  stage.width(containerWidth);
  stage.height(containerHeight);
  stage.scale({ x: scale, y: scale });
}