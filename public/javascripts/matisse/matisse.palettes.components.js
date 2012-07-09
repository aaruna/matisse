/**
 * User: Bhavani Shankar,Pradeep
 * Date: 12/28/11
 * Time: 11:16 AM
 * About this : Define all components here
 */


define(["matisse", "matisse.palettes", "matisse.util", "matisse.palettes.properties"], function (matisse, palettes, util, objproperties) {
	"use strict";
	/**
	 * To load components objects. group the objects using pathgroup
	 */
	var loadComponent = function (args, objects) {		
		var pathGroup = new fabric.PathGroup(objects, {width: args.width, height: args.height});
		pathGroup.set({
			left: args.left,
			top: args.top,
			angle: args.angle,
			scaleX: args.scaleX,
			scaleY: args.scaleY
        });
		pathGroup.setCoords();
		pathGroup.name = args.name;
		pathGroup.uid = args.uid;
		pathGroup.palette = args.palette;
		canvas.add(pathGroup);
		return pathGroup;
	};
	/**
	 * To set the properties of the object with the received object when an object is modified.
	 */
	var updateProperties = function (obj, recvdObj) {
		obj.width = recvdObj.width;
		obj.height = recvdObj.height;
		obj.left = recvdObj.left;
		obj.top = recvdObj.top;
		obj.scaleX = recvdObj.scaleX;
		obj.scaleY = recvdObj.scaleY;
		obj.setAngle(recvdObj.angle);
		if (recvdObj.fill) {
			obj.set("fill", recvdObj.fill);
		}
		if (recvdObj.stroke) {
			obj.set("stroke", recvdObj.stroke);
		}
		if (obj.text) {
			obj.text = recvdObj.text;
		}
	};

	/**
	 * To update progress bar on the canvas dynamically
	 */
	function progressHandler(objct) {
		$("#proptable").append("<tr><td><input id='txtbox' type='text'>Progress %</input> </td></tr>");
		var txtbox = document.getElementById('txtbox');
		var wdth = objct.paths[0].width;
		txtbox.value = (wdth / 2 + objct.paths[1].points[1].x) * (100 / wdth);
		txtbox.onfocus = function (e) {
			this.value = (wdth / 2 + objct.paths[1].points[1].x) * (100 / wdth);
		};
		txtbox.onkeyup = function (e) {
			if (this.value <= 100 && this.value >= 0) {
				objct.paths[1].points[1].x = (wdth * this.value / 100) - (wdth / 2);
				objct.paths[1].points[2].x = (wdth * this.value / 100) - (wdth / 2);
				matisse.comm.sendDrawMsg({
					action: "modified",
					args: [{
						uid: objct.uid,
						object: objct
					}]
				});
				canvas.renderAll();
			}
		};
	}

	/** Function to obtain text from table object on canvas
	 * @param obj: table object on canvas from which text is to be extracted.
	 */
	var getTableText = function (obj) {
		var textItems = "", count = 0;
		if (obj.paths && obj.paths.length >= 3) {
			textItems = "";
			// obtain the number of columns in table
			for (var i = 2; i < obj.paths.length; i++) {
				if (obj.paths[i].points) {
					textItems += obj.paths[i - 1].text + "|";
					count++;
				}
			}
			textItems = textItems.substring(0, textItems.length - 1) + "\n";		
			var k = 0;
			// each cell's text is appended with '\|' character
			for (var j = 2 + (count * 2); j < obj.paths.length; j++) {
				if (k == count) {
					// each row is appended with '\n' character
					textItems = textItems.substring(0, textItems.length - 1) + "\n";
					k = 0;
				}
				if (obj.paths[j].text) {
					textItems += obj.paths[j].text;
					k++;
					textItems = k >= 1 ? textItems + "|": textItems;
				}				
			}
			textItems = textItems.substring(0, textItems.length - 1) + "\n";
		}
		return textItems;
	};
	/** Function to add table items to the table container on the canvas.
	 * @param obj: table object on canvas for which the items are to be added.
	 * @param items: table items (string of table items' text separated by \| and \n char), to be added to the table.
	 */
	var addItemsToTable = function (obj, items) {
		var tableRows = items.split("\n");
		var objects = [];
		// store the table container object.
		objects.push(obj.paths[0]);
		objects.push(obj.paths[1]);
		// remove the original table object from the canvas
		canvas.remove(obj);
		var tableHeader = tableRows[0],
			colHeader = tableHeader.split("|"),
			j = 0;
		
		// create table header
		for (var i = 0; i < colHeader.length; i++) {
			if (colHeader[i] != '') {
				var txtObj = new fabric.Text(colHeader[i], {
					fontSize : 16,
					fontFamily : "delicious_500",
					fontWeight : 16,
					left: -obj.paths[0].width/2 + (obj.paths[0].width/(4 * colHeader.length)) + j++ *(obj.paths[0].width/colHeader.length) + 10,
					top : -obj.paths[0].height/2 + 10,
					stroke: '#000000'
				});			
				var col = new fabric.Polyline([{x: -obj.paths[0].width/2 + (j *(obj.width / colHeader.length)), y: -obj.height/2}, {x: -obj.paths[0].width/2 + (j *(obj.width / colHeader.length)) + 0.005, y: obj.height/2}],
							{fill:'#ffffff',stroke:'#aaa'});				
				objects.push(txtObj);
				objects.push(col);
			}
		}
		// create table body
		for (var i = 1; i < tableRows.length; i++) {
			if (tableRows[i] != '') {
				var rowElements = tableRows[i].split("|");
				var txt = "";
				for (var j=0; j < colHeader.length; j++) {
					txt = rowElements[j];
					
					if (!txt) {
						txt= " ";
					}
					var txtObj = new fabric.Text(txt, {
						fontSize : 16,
						fontFamily : "delicious_500",
						fontWeight : 16,
						left: -obj.paths[0].width/2 + (obj.paths[0].width/(4 * colHeader.length)) + j *(obj.paths[0].width/colHeader.length) + 10,
						top : -obj.paths[0].height/2 + (20 * i) + 10,
						stroke: '#000000'
					});
					objects.push(txtObj);					
				}
			}
		}
		
		// create a pathgroup for all the above created objects and then add it to the canvas having uid same as that of the original list object.
		var pathGroup = new fabric.PathGroup(objects, {width: objects[0].width, height: objects[0].height});
		pathGroup.set({
			left: obj.left,
			top: obj.top,
			angle: 0,
			scaleX: 1,
			scaleY: 1
        });
		pathGroup.setCoords();
		pathGroup.name = "table";
		pathGroup.uid = obj.uid;
		pathGroup.palette = "components";
		canvas.add(pathGroup);
		// render all the items on the canvas after the modification.
		canvas.renderAll();
		return pathGroup;
	}
	
	/** Function to provide text area for adding table items and on blur of text area to send the list of table items to get added to the table container.
	 * @param obj: table object on canvas for which the items are to be added.
	 */
	var tableHandler = function (obj) {
		$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'></textarea> </td></tr>");		
		var txtbox = document.getElementById('txtarea'),
			count = 0;			
		txtbox.value = "column1|column2\ncontent1|content2\n";

		// obtain the text from the table, if any.
		var txt = getTableText(obj);
		txtbox.value = txt == "" ? txtbox.value : txt;
		// on blur of txtbox, update the table on canvas with the text in txtbox.
		txtbox.onblur = function (e) {			
			if (canvas.getActiveObject()) {
				var pathGroup = addItemsToTable(canvas.getActiveObject(), txtbox.value);			
				matisse.comm.sendDrawMsg({
					action: "modified",
					args: [{
						uid: pathGroup.uid,
						object: pathGroup
					}]
				});	
				canvas.setActiveObject(pathGroup);
			}
		};		
	};
	/**
	 * To register components palette
	 */
	palettes.registerpalette("components", {
		collectionName: 'components',
		shapes: {
			// components object, Table has a border, header and columns separated by lines. Text in table cells can be edited in properties dialog.
			table: {
				name: "table",
				displayName: "Table",
				activeIcon: "table_w.png",
				inactiveIcon: "table_g.png",
				// to create a table object
				toolAction: function (args) {
					var objects = [],
						textItems = "",
						count = 0,
						// create a table container initially for the list.. i.e., outer rectangle
						border = new fabric.Rect({
							width: args.paths ? args.paths[0].width : 180,
							height: args.paths ? args.paths[0].height : 200,
							fill: '#fdfdfd',
							stroke: '#000000'
						}),
						// add header to the table
						header = new fabric.Polygon(
							[{x: -border.width/2+1, y: -border.height/2+1 },{x: border.width/2 -1 , y: -border.height/2+1},{x: border.width/2 - 1 , y: -border.height/2 + 22},{x: -border.width/2+1, y: -border.height/2 + 22}],
							{
								fill: '#efefef',
								stroke:'#dfdfdf'
							}
						);
					args.width = border.width;
					args.height = border.height;
					args.scaleX = 1;
					args.scaleY = 1;
					objects.push(border);
					objects.push(header);
					var obj = loadComponent(args, objects);
					// obtain the text of table items from the object, if any.
					textItems = getTableText(args);
					// after creating the container, add table items to the container, if any.
					addItemsToTable(obj, textItems, args);
				},

				// when list object in one client is modified, modify the same in the other clients connected.
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					var textItems = "",
						count = 0;
					updateProperties(obj, recvdObj);

					// update the properties of list container with that of the modified list container.
					for (var prop in recvdObj.paths[0]) {
						obj.paths[0][prop] = recvdObj.paths[0][prop];
					}
					obj.paths[1].points = [{x: -recvdObj.width/2+1, y: -recvdObj.height/2+1 },{x: recvdObj.width/2 -1 , y: -recvdObj.height/2+1},{x: recvdObj.width/2 - 1 , y: -recvdObj.height/2 + 22},{x: -recvdObj.width/2+1, y: -recvdObj.height/2 + 22}];
					// obtain the text of table items from the object, if any.
					textItems = getTableText(recvdObj);
					// reconstruct the list with the obtained list items
					addItemsToTable(obj, textItems);
				},

				// when table object in one client is resized either width wise or height wise, resize the same in the other clients connected.
				// change the width or height accordingly and also modify the left and top of the contents
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid), k=1, count=0, j = 0;
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
					obj.paths[1].points = [{x: -resizedObj.width/2+1, y: -resizedObj.height/2+1 },{x: resizedObj.width/2 -1 , y: -resizedObj.height/2+1},{x: resizedObj.width/2 - 1 , y: -resizedObj.height/2 + 22},{x: -resizedObj.width/2+1, y: -resizedObj.height/2 + 22}];

					// If the table has rows and cols
					if (resizedObj.paths && resizedObj.paths.length >= 3) {
						// get number of columns in the table
						for (var i = 2; i < resizedObj.paths.length; i++) {
							if (resizedObj.paths[i].points) {
								count++;
							}
						}
						// for the obtained columns, adjust the height accordingly when resized.
						for (var i = 2; i < resizedObj.paths.length; i++) {
							if (resizedObj.paths[i].points) {
								obj.paths[i].points = [{x: -resizedObj.paths[0].width/2 + (k *(resizedObj.width / count)), y: -resizedObj.height/2}, {x: -resizedObj.paths[0].width/2 + (k *(resizedObj.width / count)) + 0.005, y: resizedObj.height/2}];
								k++;
							}
						}
						k = 0;
						// for the text items, adjust the left and top accordingly when resized either width wise or height wise
						for (var i = 2; i < resizedObj.paths.length; i++) {
							if (resizedObj.paths[i].text) {
								if (k == count) {
									k = 0;
									j++;
								}
								obj.paths[i].left = -resizedObj.width/2 + (resizedObj.width / count)/4 + (resizedObj.width / count)*k + 10;
								obj.paths[i].top = -resizedObj.height/2 + (20 * j) + 10; // 20 is the height of each row
								k++;
							}
						}
					}
				},

				// apply the properties of the list object to the properties panel.
				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var activeObj = canvas.getActiveObject();
					// handle the table object by providing text area to add table items.
					tableHandler(activeObj);
				},

				// properties for list object which can be dynamically modified (left, top and angle).
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}]	//End of properties for list
			},

			div: {	// Div components object
				name: "div",
				displayName: "Div",
				activeIcon: "rectangle_w.png",
				inactiveIcon: "rectangle_g.png",
				toolAction: function (args) {
					var rect = new fabric.Rect({
						width: args.width,
						height: args.height,
						left: args.left,
						top: args.top,
						fill: null,
						stroke: args.stroke,
						scaleX: args.scaleX,
						scaleY: args.scaleY
					});
					rect.uid = args.uid;
					rect.name = 'div';
					rect.palette = args.palette;
					rect.setAngle(args.angle);
					canvas.add(rect);
				},
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
				},

				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.left = resizedObj.left;
					obj.top = resizedObj.top;
					obj.width = resizedObj.width;
					obj.height = resizedObj.height;
					obj.scaleX = resizedObj.scaleX;
					obj.scaleY = resizedObj.scaleY;
					obj.angle = resizedObj.angle;
					obj.stroke = resizedObj.stroke;
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
					(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
					(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'width',
					type: 'number',
					action: function (args) {
						(args.obj).set("width", args.property / args.obj.scaleX);
					},
					defaultvalue: 200
				}, {
					name: 'height',
					type: 'number',
					action: function (args) {
						(args.obj).set("height", args.property / args.obj.scaleY);
					},
					defaultvalue: 100
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'stroke',
					type: 'string',
					action: function (args) {
						(args.obj).set("stroke", args.property);
					},
					defaultvalue: '#ccc'
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}]	//End of properties for Div
			},	//End of shape Div

			image: {	//Image components object
				name: "image",
				displayName: "Image",
				activeIcon: "image_w.png",
				inactiveIcon: "image_g.png",
				toolAction: function (args){
					args.width = args.paths ? args.paths[0].width : 100;
					args.height = args.paths ? args.paths[0].height : 75;
					var objects = [],
						text = args.width + " x " + args.height;
					var border = new fabric.Polygon(
						[{x: -args.width/2,y:args.height/2},{x:args.width/2, y:args.height/2},{x:args.width/2, y:-args.height/2},{x:-args.width/2, y:-args.height/2}],
						{
							fill: '#fcfcfc',
							stroke:'#6f6f6f'
						}
					);
					var diagonal1 = new fabric.Polyline([{x: -args.width/2,y:args.height/2},{x:args.width/2,y:-args.height/2}],
						{fill:'#ffffff',stroke:'#6f6f6f'});
					var diagonal2 = new fabric.Polyline([{x: args.width/2,y:args.height/2},{x:-args.width/2,y:-args.height/2}],
						{fill:'#ffffff',stroke:'#6f6f6f'});
					var rect = new fabric.Rect({
						width: 20,
						height: 20,
						left: 0,
						top: 0,
						fill: '#fcfcfc',
						stroke: '#fcfcfc'
					});
					var textobj = new fabric.Text(text, {
						left: 0,
						top: 0,
						fontFamily: 'delicious_500',
						angle: 0,
						fill: '#000000',
						stroke: '#000000',
						fontSize: 9
					});
					objects.push(border);
					objects.push(diagonal1);
					objects.push(diagonal2);
					objects.push(rect);
					objects.push(textobj);
					loadComponent(args, objects);
				},
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.paths[0].width = recvdObj.width;
					obj.paths[0].height = recvdObj.height;
					obj.paths[0].points = [{x: -recvdObj.width/2, y: recvdObj.height/2},{x: recvdObj.width/2, y: recvdObj.height/2},{x: recvdObj.width/2, y: -recvdObj.height/2},{x: -recvdObj.width/2, y: -recvdObj.height/2}];
					obj.paths[1].points = [{x: -recvdObj.width/2, y: recvdObj.height/2},{x: recvdObj.width/2, y: -recvdObj.height/2}];
					obj.paths[2].points = [{x: recvdObj.width/2, y: recvdObj.height/2},{x: -recvdObj.width/2, y: -recvdObj.height/2}];
					obj.paths[4].text = recvdObj.width + " x " + recvdObj.height;
				},
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.left = resizedObj.left;
					obj.top = resizedObj.top;
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
					obj.scaleX = resizedObj.scaleX;
					obj.scaleY = resizedObj.scaleY;
					obj.angle = resizedObj.angle;
					obj.paths[0].points = [{x: -resizedObj.width/2, y: resizedObj.height/2},{x: resizedObj.width/2, y: resizedObj.height/2},{x: resizedObj.width/2, y: -resizedObj.height/2},{x: -resizedObj.width/2, y: -resizedObj.height/2}];
					obj.paths[1].points = [{x: -resizedObj.width/2, y: resizedObj.height/2},{x: resizedObj.width/2, y: -resizedObj.height/2}];
					obj.paths[2].points = [{x: resizedObj.width/2, y: resizedObj.height/2},{x: -resizedObj.width/2, y: -resizedObj.height/2}];
					obj.paths[4].text = resizedObj.width + " x " + resizedObj.height;
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},

				properties:[{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for image
			}, // end of image

			slider: {	//Slider components object
				name: "slider",
				displayName: "Slider",
				activeIcon: "slider_w.png",
				inactiveIcon: "slider_g.png",
				toolAction: function (args) {
					var objects = [];
					args.width = args.paths ? args.paths[0].width : 200;
					args.height = args.paths ? args.paths[0].height : 5;
					var outerRect = new fabric.Rect({
						width: args.width,
						height: args.height,
						fill: '#dfdfdf',
						stroke: '#8f8f8f'
					});
					var innerRect = new fabric.Rect({
						width: args.width / 20,
						height: args.height * 3,
						fill: '#8f8f8f',
						stroke: '#9f9f9f'
					});
					var leftLine1 = new fabric.Polygon(
						[{x: -args.width * 0.3, y: args.height/2 },{x: -args.width * 0.3 + 0.05, y: args.height/2},{x: -args.width * 0.3 + 0.05, y: args.height/2 + 7.5},{x: -args.width * 0.3, y: args.height/2 + 7.5}],
						{
							fill: '#AAAAAA',
							stroke:'#AAAAAA'
						}
					);
					var leftLine2 = new fabric.Polygon(
						[{x: -args.width * 0.2, y: args.height/2 },{x: -args.width * 0.2 + 0.05, y: args.height/2},{x: -args.width * 0.2 + 0.05, y: args.height/2 + 4.5},{x: -args.width * 0.2, y: args.height/2 + 4.5}],
						{
							fill: '#AAAAAA',
							stroke:'#AAAAAA'
						}
					);
					var rightLine1 = new fabric.Polygon(
						[{x: args.width * 0.3, y: args.height/2 },{x: args.width * 0.3 - 0.05, y: args.height/2},{x: args.width * 0.3 - 0.05, y: args.height/2 + 7.5},{x: args.width * 0.3, y: args.height/2 + 7.5}],
						{
							fill: '#AAAAAA',
							stroke:'#AAAAAA'
						}
					);
					var rightLine2 = new fabric.Polygon(
						[{x: args.width * 0.2, y: args.height/2 },{x: args.width * 0.2 - 0.05, y: args.height/2},{x: args.width * 0.2 - 0.05, y: args.height/2 + 4.5},{x: args.width * 0.2, y: args.height/2 + 4.5}],
						{
							fill: '#AAAAAA',
							stroke:'#AAAAAA	'
						}
					);
					objects.push(outerRect);
					objects.push(innerRect);
					objects.push(leftLine1);
					objects.push(rightLine1);
					objects.push(leftLine2);
					objects.push(rightLine2);
					loadComponent(args, objects);
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.paths[0].width = recvdObj.width;
					obj.paths[0].height = recvdObj.height;
					obj.paths[1].width = recvdObj.width / 20;
					obj.paths[1].height = recvdObj.height * 3;
					obj.paths[2].points = recvdObj.paths[2].points;
					obj.paths[3].points = recvdObj.paths[3].points;
					obj.paths[4].points = recvdObj.paths[4].points;
					obj.paths[5].points = recvdObj.paths[5].points;
				},
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
					obj.paths[1].width = resizedObj.width / 20;
					obj.paths[1].height = resizedObj.height * 3;
					obj.paths[2].points = [{x: -resizedObj.width * 0.3, y: resizedObj.height/2 },{x: -resizedObj.width * 0.3 + 0.05, y: resizedObj.height/2},{x: -resizedObj.width * 0.3 + 0.05, y: resizedObj.height/2 + 7.5},{x: -resizedObj.width * 0.3, y: resizedObj.height/2 + 7.5}];
					obj.paths[3].points = [{x: -resizedObj.width * 0.2, y: resizedObj.height/2 },{x: -resizedObj.width * 0.2 + 0.05, y: resizedObj.height/2},{x: -resizedObj.width * 0.2 + 0.05, y: resizedObj.height/2 + 4.5},{x: -resizedObj.width * 0.2, y: resizedObj.height/2 + 4.5}];
					obj.paths[4].points = [{x: resizedObj.width * 0.3, y: resizedObj.height/2 },{x: resizedObj.width * 0.3 - 0.05, y: resizedObj.height/2},{x: resizedObj.width * 0.3 - 0.05, y: resizedObj.height/2 + 7.5},{x: resizedObj.width * 0.3, y: resizedObj.height/2 + 7.5}];
					obj.paths[5].points = [{x: resizedObj.width * 0.2, y: resizedObj.height/2 },{x: resizedObj.width * 0.2 - 0.05, y: resizedObj.height/2},{x: resizedObj.width * 0.2 - 0.05, y: resizedObj.height/2 + 4.5},{x: resizedObj.width * 0.2, y: resizedObj.height/2 + 4.5}];
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
				},

				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for slider
			},	//End of shape slider

			progressbar: {	// progressbar components object
				name: "progressbar",
				displayName: "Progress Bar",
				activeIcon: "progressbar_w.png",
				inactiveIcon: "progressbar_g.png",
				toolAction: function (args) {
					var objects = [];
					args.width = args.paths ? args.paths[0].width : 150;
					args.height = args.paths ? args.paths[0].height : 20;
					var outerRect = new fabric.Rect({
						width: args.width,
						height: args.height,
						fill: '#ffffff',
						stroke: '#8f8f8f'
					});
					var innerRect = new fabric.Polygon(
						args.paths ? args.paths[1].points : [{x: -args.width / 2,y: args.height / 2 },{x: -args.width / 4 , y: args.height / 2},{x: -args.width / 4 , y: -args.height / 2},{x: -args.width / 2, y: -args.height / 2}],
						{
							fill: '#9f9f9f',
							stroke:'#8f8f8f'
						}
					);
					objects.push(outerRect);
					objects.push(innerRect);
					loadComponent(args, objects);
				},
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.paths[0].width = recvdObj.width;
					obj.paths[0].height = recvdObj.height;
					obj.paths[1].points = [{x: -recvdObj.width / 2,y: recvdObj.height / 2 },{x: -recvdObj.width / 4 , y: recvdObj.height / 2},{x: -recvdObj.width / 4 , y: -recvdObj.height / 2},{x: -recvdObj.width / 2, y: -recvdObj.height / 2}];
					obj.paths[1].points[1].x = recvdObj.paths[1].points[1].x;
					obj.paths[1].points[2].x = recvdObj.paths[1].points[2].x;
				},
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					var txtbox = document.getElementById('txtbox');
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
					obj.paths[1].points = [{x: -resizedObj.width / 2,y: resizedObj.height / 2 },{x: -resizedObj.width / 4 , y: resizedObj.height / 2},{x: -resizedObj.width / 4 , y: -resizedObj.height / 2},{x: -resizedObj.width / 2, y: -resizedObj.height / 2}];
					obj.paths[1].points[1].x = (resizedObj.width * txtbox.value / 100) - (resizedObj.width / 2);
					obj.paths[1].points[2].x = (resizedObj.width * txtbox.value / 100) - (resizedObj.width / 2);
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
					progressHandler(canvas.getActiveObject());
				},
				properties: [{
					name: 'left',
					type: 'number',
					action: function (args) {
						(args.obj).set("left", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'top',
					type: 'number',
					action: function (args) {
						(args.obj).set("top", args.property);
					},
					defaultvalue: 100
				}, {
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				}, {
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for progressbar
			}	//End of shape progressbar
		} // end of shapes
	});	//End of components
});
