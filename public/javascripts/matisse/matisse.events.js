/*matisse.events*/

define(["matisse", "matisse.ui", "matisse.comm" ], function (matisse, ui, comm) {
	"use strict";
	return {
		/**
		 * Listen for keyboard events and do necessary action
		 * @method keyDown 
		 * @param e keyevent
		 */
		keyDown: function (e) {
            var evt = (e) ? e : (window.event) ? window.event : null;
            if (evt) {
                var key = (evt.charCode) ? evt.charCode : ((evt.keyCode) ? evt.keyCode : ((evt.which) ? evt.which : 0));
                if (key == "46" && evt.altKey) { // ALT + DELETE
                    matisse.main.deleteObjects();
                } else if (key == "38" && evt.ctrlKey) { // CONTROL + Up Arrow
                    var obj = canvas.getActiveObject();
                    if (obj) {
                        canvas.bringForward(obj);
						notifyZindexChange(obj, 'forward');
                    }
                } else if (key == "40" && evt.ctrlKey) { // CONTROL + Down Arrow
                    var obj = canvas.getActiveObject();
                    if (obj) {
                        canvas.sendBackwards(obj);
						notifyZindexChange(obj, 'backward');
                    }
                } else if (key == "27") { // when Escape key pressed
                    closePopup()
                } else if (key == "37" && evt.shiftKey) {
                    var obj = canvas.getActiveObject();
                    var objleft = obj.left;
                    obj.set('left', objleft - (matisse.horIndent * matisse.indentMultiplier));
                    onObjectMoveByKey(obj);
                } else if (key == "37") {
                    var obj = canvas.getActiveObject();
                    var objleft = obj.left;
                    obj.set('left', objleft - matisse.horIndent);
                    onObjectMoveByKey(obj)
                } else if (key == "39" && evt.shiftKey) {
                    var obj = canvas.getActiveObject();
                    var objleft = obj.left;
                    obj.set('left', objleft + (matisse.horIndent * matisse.indentMultiplier));
                    onObjectMoveByKey(obj);
                } else if (key == "39") {
                    var obj = canvas.getActiveObject();
                    var objleft = obj.left;
                    obj.set('left', objleft + matisse.horIndent);
                    onObjectMoveByKey(obj)
                } else if (key == "38" && evt.shiftKey) {
                    var obj = canvas.getActiveObject();
                    var objtop = obj.top;
                    obj.set('top', objtop - matisse.verIndent * matisse.indentMultiplier);
                    onObjectMoveByKey(obj)
                } else if (key == "38") {
                    var obj = canvas.getActiveObject();
                    var objtop = obj.top;
                    obj.set('top', objtop - matisse.verIndent);
                    onObjectMoveByKey(obj)
                } else if (key == "40" && evt.shiftKey) {
                    var obj = canvas.getActiveObject();
                    var objtop = obj.top;
                    obj.set('top', objtop + matisse.verIndent * matisse.indentMultiplier);
                    onObjectMoveByKey(obj)
                } else if (key == "40") {
                    var obj = canvas.getActiveObject();
                    var objtop = obj.top;
                    obj.set('top', objtop + matisse.verIndent);
                    onObjectMoveByKey(obj)
                }
            }
        },

        /**
         * Listen for mouse down(on canvas after shape tool is selected) event and do necessary action
         * @method mouseDown 
         * @param e mouseevent
         */
        mouseDown: function (event) {
            if (!canvas.isDrawingMode && matisse.drawShape) {
				matisse.points.x = event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - matisse.xOffset; //offset
                matisse.points.y = event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - matisse.yOffset; //offset
                matisse.shapeArgs[0].left = matisse.points.x;
                matisse.shapeArgs[0].top = matisse.points.y;
                matisse.shapeArgs[0].name = matisse.action;
                matisse.shapeArgs[0].palette = matisse.paletteName;
                matisse.palette[matisse.paletteName].shapes[matisse.action].toolAction.apply(this, matisse.shapeArgs);
                matisse.comm.sendDrawMsg({
                    palette: matisse.paletteName,
                    action: matisse.action,
                    args: matisse.shapeArgs
                });
                canvas.isSelectMode = true;
                matisse.drawShape = false;
                ui.resetIconSelection();
            }
            if (canvas.isDrawingMode) {
                matisse.xPoints = [];
                matisse.yPoints = [];
                matisse.xPoints.push(event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - matisse.xOffset);
                matisse.yPoints.push(event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - matisse.yOffset);
            }
        },

        /**
         * Listen for mouse move event and do necessary action
         * @method mouseMove 
         * @param e mouseevent
         */
        mouseMove: function (event) {
	    matisse.eventObj = event;
            if (canvas.isDrawingMode) {
                matisse.xPoints.push(event.pageX + document.getElementById("canvasId").scrollLeft + document.getElementById("containerDiv").scrollLeft - matisse.xOffset);
                matisse.yPoints.push(event.pageY + document.getElementById("canvasId").scrollTop + document.getElementById("containerDiv").scrollTop - matisse.yOffset);
            }
        },

        /**
         *  Notify Server about Group Moved
         *  @method  notifyServerGroupMoved
         *  @param none
         */
        notifyServerGroupMoved: function () {
            var activeGroup = canvas.getActiveGroup();
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function (obj) {
                notifyObjModify(obj);
            });
        }
    };
    return eve;

    function closePopup() {
        var popEl = document.getElementById('popUpDiv');
        var closeEl = document.getElementById('closediv');
        var blanketEl = document.getElementById('blanket');
        if (popEl.style.display != 'none') popEl.style.display = 'none';
        if (closeEl.style.display != 'none') closeEl.style.display = 'none';
        if (blanketEl.style.display != 'none') blanketEl.style.display = 'none'
    }

    function onObjectMoveByKey(obj) {
        canvas.renderAll();
        obj.setCoords();
        canvas.fire('object:moving', {
            target: obj
        });
		notifyObjModify(obj);
    }
	function notifyObjModify(obj) {
		matisse.comm.sendDrawMsg({
			action: "modified",
			name: obj.name,
			palette: obj.palette,
			args: [{
				uid: obj.uid,
				object: obj
			}] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
		});
	}
	function notifyZindexChange(obj, changType) {
		matisse.comm.sendDrawMsg({
			action: "zindexchange",
			name: obj.name,
			palette: obj.palette,
			args: [{
				uid: obj.uid,
				object: obj,
				change : changType,
			}] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
		});
	}
});