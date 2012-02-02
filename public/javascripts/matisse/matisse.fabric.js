/* fabric related methods */

define(["matisse", "matisse.util", "matisse.palettes.properties", "matisse.ui", "matisse.events"], function (matisse, util, properties, ui, events) {
	
	'use strict';
    /**
     *  Check for the event fired by fabric when any of the canvas objects modified and apply update properites panel accordingly
     *  @method  observe
     *  @param eventName
     */
	return {
		observe: function (eventName) {
			canvas.observe(eventName, function (e) {
				switch (eventName) {
				case "object:modified":
					if (canvas.getActiveGroup()) {
						events.notifyServerGroupMoved();
						return;
					}
					var obj = e.memo.target;
					matisse.comm.sendDrawMsg({
						action: "modified",
						name: obj.name,
						palette: obj.palette,
						path: obj.path,
						args: [{
							uid: obj.uid,
							object: obj
						}] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
					});
					matisse.hLine.set('top', -10);
					matisse.vLine.set('left', -10);
					properties.updatePropertyPanel(obj);
					break;
				case "selection:cleared":
					$('#prop').remove();
					$('#propdiv').dialog('close');
					break;
				case 'path:created':
					canvas.isSelectMode = true;
					canvas.isDrawingMode = false;
					ui.resetIconSelection();
					matisse.drawShape = false;
					document.getElementById("c").style.cursor = 'default';
                    var pathObj = e.memo.path;
                    pathObj.uid = util.uniqid();
                    pathObj.name = "drawingpath";
                    pathObj.palette = matisse.paletteName;
					matisse.comm.sendDrawMsg({
						action: 'drawpath',
						palette: matisse.paletteName,
						args: [{
                            uid: pathObj.uid,
                            left: pathObj.left,
                            top: pathObj.top,
                            width: pathObj.width,
                            height: pathObj.height,
                            path: pathObj.path,
                            name: pathObj.name,
							palette: matisse.paletteName
						}]
					});
					matisse.xPoints = [];
					matisse.yPoints = [];
					break;
				case 'object:selected':
                    var selectedObj = e.memo.target;
                    if (canvas.getActiveGroup()) {
                        return;
                    }
                    properties.createPropertiesPanel(selectedObj);
                    break;
                case 'object:moving':
                    var movingObj = e.memo.target;
                    checkAlign(movingObj);
                    break;
				}
			});
		}
	};
	/* Get all objects from canvas and check if borders of any of them matches with active object borders
	 */
	function checkAlign(obj) {
        var hLine = matisse.hLine,
			vLine = matisse.vLine;
        hLine.set('top', -10);
        vLine.set('left', -10);
        var movingObjLeft = Math.round(obj.left - (obj.width * obj.scaleX) / 2),
			movingObjTop = Math.round(obj.top - (obj.height * obj.scaleY) / 2),
			movingObjRight = Math.round(obj.left + (obj.width * obj.scaleX) / 2),
			movingObjBottom = Math.round(obj.top + (obj.height * obj.scaleY) / 2),
			canvasObjects = canvas.getObjects(),
			i = 0;
        for (i; i < canvasObjects.length; i++) {
            var otherObjLeft = Math.round(canvasObjects[i].left - (canvasObjects[i].width * canvasObjects[i].scaleX) / 2),
				otherObjTop = Math.round(canvasObjects[i].top - (canvasObjects[i].height * canvasObjects[i].scaleY) / 2),
				otherObjRight = Math.round(canvasObjects[i].left + (canvasObjects[i].width * canvasObjects[i].scaleX) / 2),
				otherObjBottom = Math.round(canvasObjects[i].top + (canvasObjects[i].height * canvasObjects[i].scaleY) / 2);
			if (canvasObjects[i] !== obj && canvasObjects[i].name !== 'vline' && canvasObjects[i].name !== 'hline') { /* this LEFT matches with Other LEFT */
				if (otherObjLeft - 1 === movingObjLeft || otherObjLeft + 1 === movingObjLeft) {
					showAlginLine(obj, "left", "minus");
				} /* this RIGHT matches with Other RIGHT */
				if (otherObjRight - 1 === movingObjRight || otherObjRight + 1 === movingObjRight) {
					showAlginLine(obj, "left", "plus");
				} /* this TOP matches with Other TOP */
				if (otherObjTop - 1 === movingObjTop || otherObjTop + 1 === movingObjTop) {
					showAlginLine(obj, "top", "minus");
				} /* this BOTTOM matches with Other BOTTOM */
				if (otherObjBottom - 1 === movingObjBottom || otherObjBottom + 1 === movingObjBottom) {
					showAlginLine(obj, "top", "plus");
				} /* this LEFT matches with Other RIGHT */
				if (otherObjRight - 1 === movingObjLeft || otherObjRight + 1 === movingObjLeft) {
					showAlginLine(obj, "left", "minus");
				} /* this RIGHT matches with Other LEFT */
				if (otherObjLeft - 1 === movingObjRight || otherObjLeft + 1 === movingObjRight) {
					showAlginLine(obj, "left", "plus");
				} /* this TOP matches with Other BOTTOM */
				if (otherObjBottom - 1 === movingObjTop || otherObjBottom + 1 === movingObjTop) {
					showAlginLine(obj, "top", "minus");
				} /* this BOTTOM matches with Other TOP */
				if (otherObjTop - 1 === movingObjBottom || otherObjTop + 1 === movingObjBottom) {
					showAlginLine(obj, "top", "plus");
				}
			}
		}
		return null;
	}

    function showAlginLine(obj, position, operator) {
        var vLine = matisse.vLine;
        var hLine = matisse.hLine;
        switch (position) {
        case "left":
            (operator === "plus") ? vLine.set('left', obj.left + (obj.width * obj.scaleX) / 2) : vLine.set('left', obj.left - (obj.width * obj.scaleX) / 2);
		break;
        case "top":
            (operator === "plus") ? hLine.set('top', obj.top + (obj.height * obj.scaleY) / 2) : hLine.set('top', obj.top - (obj.height * obj.scaleY) / 2);
        break;
        }
		canvas.bringForward(vLine);
		canvas.bringForward(hLine);
		vLine.setCoords();
        hLine.setCoords();
		canvas.renderAll();
        
    }
});