import Konva from "konva";
export function init() {
    var stage = new Konva.Stage({
        container: 'nodeContainer',   // id of container <div>
        width: 500,
        height: 1000
      });
      // then create layer
      var layer = new Konva.Layer();
      // create our shape
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
      // add the shape to the layer
      layer.add(rect);
      // add the layer to the stage
      stage.add(layer);
      // draw the image
      layer.draw();
}
