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

// * Initialise and draw the Konva stage.
export function init() {


  /*
   * CONNECTED NODES DEMO
  //Create a square.
  var rect = new Konva.Rect({
    x: stage.width() / 2,
    y: stage.height() / 2,
    width: 70,
    height: 70,
    fill: '#f5f0b0',
    stroke: '#f2deac',
    strokeWidth: 1,
    draggable: true,
  });

  //Create a second square.
  var rect2 = new Konva.Rect({
    x: 50,
    y: stage.height() / 2,
    width: 70,
    height: 70,
    fill: '#f5f0b0',
    stroke: '#f2deac',
    strokeWidth: 1,
    draggable: true,
  });

  //Create a line between the centerpoints of the two squares.
  var line = new Konva.Line({
    points: [rect.x() + (rect.width() / 2), rect.y() + (rect.width() / 2), rect2.x() + (rect.width() / 2), rect2.y() + (rect.width() / 2)],
    stroke: 'black',
    tension: 1
  });

  //When dragging the rectangle, move the line to the centerpoint of both nodes.
  rect.on("dragmove", () => {
    var nodeCenterLength = rect.width() / 2;
    line.points([rect.x() + nodeCenterLength, rect.y() + nodeCenterLength, rect2.x() + nodeCenterLength, rect2.y() + nodeCenterLength]);
    layer.draw();
  });

  //When dragging rectangle 2, move the line to the centerpoint of both nodes.
  rect2.on("dragmove", () => {
    var nodeCenterLength = rect.width() / 2;
    line.points([rect.x() + nodeCenterLength, rect.y() + nodeCenterLength, rect2.x() + nodeCenterLength, rect2.y() + nodeCenterLength]);
    layer.draw();
  });
  //Add all of the shapes to the layer.
  layer.add(line);
  layer.add(rect);
  layer.add(rect2);
*/
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
 * @param title The text in the node.
 */
export function newNode(title) {
  var node = createNewGroupNode(title, 70, 70);
  layer.add(node);
  layer.draw();
}

/**  
 * * Creating a new group with a rectangle and text shape.
 * @param text The text of the node
 * @param height The height of the node
 * @param width The width of the node
 */
function createNewGroupNode(text, height, width) {
  var nodeGroup = new Konva.Group({
    draggable: true,
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