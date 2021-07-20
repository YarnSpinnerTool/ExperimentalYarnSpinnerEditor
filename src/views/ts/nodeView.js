import Konva from "konva";

var sceneWidth = 500;
var sceneHeight = 500;

var stage = new Konva.Stage({
  container: 'nodeContainer',   // id of container <div>
  width: sceneWidth,
  height: sceneHeight,
});
export function init() {
  
  var layer = new Konva.Layer();
  
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
  
  layer.add(rect);
  stage.add(layer);
  layer.draw();
  
  responsiveSize();
  window.addEventListener('resize', responsiveSize);
}

function responsiveSize() {
  var container = document.getElementById('nodeContainer');
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;
  var scale = containerWidth / sceneWidth;
  stage.width(containerWidth);
  stage.height(containerHeight);
  stage.scale({ x: scale, y: scale });
}