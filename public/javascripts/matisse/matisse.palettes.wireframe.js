/**
 * User: Bhavani Shankar,Pradeep
 * Date: 12/28/11
 * Time: 11:16 AM
 * About this : Define all wireframes here
 */


define(["matisse", "matisse.palettes", "matisse.util", "matisse.palettes.properties"], function (matisse, palettes, util, objproperties) {
	"use strict";
	/**
	 * To load wireframe objects. group the objects using pathgroup
	 */
	var loadWireframe = function (args, objects) {
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
	 * To check or uncheck the checkbox on the canvas dynamically
	 */
	var checkboxSelectionHandler = function (objct) {
		$("#proptable").append("<tr><td><input id='chkbox' type='checkbox'>check</input> </td></tr>");
		var chkbox = document.getElementById('chkbox');
		objct.paths[2].stroke === '#000000' ? chkbox.checked = true : chkbox.checked = false;
		chkbox.onmousedown = function () {
			if (!chkbox.checked) {
				objct.paths[2].stroke = '#000000';
			} else {
				objct.paths[2].stroke = '#ffffff';
			}
			matisse.comm.sendDrawMsg({
				action: "modified",
				args: [{
					uid: objct.uid,
					object: objct
				}]
			});
			canvas.renderAll();
		};
	};

	/**
	 * To select or deselect the radio button on the canvas dynamically
	 */
	function radioSelectionHandler(objct) {
		$("#proptable").append("<tr><td><input id='chkbox' type='checkbox'>select</input> </td></tr>");
		var chkbox = document.getElementById('chkbox');
		objct.paths[1].fill === '#555555' ? chkbox.checked = true : chkbox.checked = false;
		chkbox.onmousedown = function () {
			if (!chkbox.checked) {
				objct.paths[1].fill = '#555555';
			} else {
				objct.paths[1].fill = '#eeeeee';
			}
			matisse.comm.sendDrawMsg({
				action: "modified",
				args: [{
					uid: objct.uid,
					object: objct
				}]
			});
			canvas.renderAll();
		};
	}

	/**
	 * To select or deselect the radio button on the canvas dynamically
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

	/**
	 * To register wireframe palette
	 */
	palettes.registerpalette("wireframe", {
		collectionName: 'wireframe',
		shapes: {
			label: { // Label wireframe object
				displayName: "label",
				activeIcon: "label_w.png",
				inactiveIcon: "label_g.png",
				toolAction: function (args) {
					var objects = [],
						txt = args.paths ? args.paths[0].text : "label me";
					args.width = args.paths ? args.paths[0].width : util.getStringWidth(txt) + 10;
					args.height = args.paths ? args.paths[0].height : util.getStringHeight(txt) + 5;
					var text = new fabric.Text(txt,	{
						fontSize : 20,
						fontFamily : "delicious_500",
						fontWeight : 20,
						left : 0,
						top : 0,
						stroke: '#000000'
					});
					objects.push(text);
					loadWireframe(args, objects);
				},
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.width = recvdObj.width;
					obj.height = recvdObj.height;
					obj.paths[0].width = recvdObj.paths[0].width;
					obj.paths[0].height = recvdObj.paths[0].height;
					obj.paths[0].text = recvdObj.paths[0].text;
				},

				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
				},

				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[0].text;
					
					txt_area.onkeyup = function (e) {
						var width = 0, height = 0;
						obj.paths[0].text = this.value;
						canvas.renderAll();
						width = obj.paths[0].getWidth() + 10;
						height = obj.paths[0].height + 5;
						(width - obj.width) > 0 ? obj.left += (width - obj.width) / 2 : obj.left = obj.left;
						(height - obj.height) > 0 ? obj.top += (height - obj.height) / 2 : obj.top = obj.top;
						obj.width = width;
						obj.height = height;
						obj.paths[0].width = width;
						obj.paths[0].height = height;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
				},
				properties: [
					{
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
							(args.obj).set("angle", args.property);
						},
						defaultvalue: 1
					}, {
						name: 'scaleY',
						type: 'number',
						action: function (args) {
							(args.obj).set("angle", args.property);
						},
						defaultvalue: 1
					}
				] // end of properties for label
			}, // end of shape label

			txt_button: { // Button wireframe object
				displayName: "txt_button",
				activeIcon: "button_w.png",
				inactiveIcon: "button_g.png",
				toolAction: function (args) {
					var objects = [],
						txt = args.paths ? args.paths[1].text : "click me";
					args.width = args.width ? args.width: util.getStringWidth(txt) + 1;
					args.height = args.height ? args.height : util.getStringHeight(txt) + 4;				
					var border = new fabric.Rect({
						width: args.width,
						height: args.height,
						left: args.left,
						top: args.top,
						rx: 5,
						fill: '#fcfcfc',
						stroke: '#dfdfdf',
						angle: args.angle,
						scaleX: 1,
						scaleY: 1
					});
					var text = new fabric.Text(txt, {
						fontSize : 15,
						fontFamily : "delicious_500",
						fontWeight : 20,
						left : 1,
						top : 0,
						stroke: '#000000'
					});
					border.setGradientFill(canvas.getContext(), {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: args.height,
						colorStops: {
							0: '#888',
							1: '#fff'
						}
					});
					objects.push(border);
					objects.push(text);
					loadWireframe(args, objects);
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;
					updateProperties(obj, recvdObj);
					obj.width = recvdObj.width;
					obj.paths[0].width = recvdObj.paths[0].width;
					obj.paths[0].height = recvdObj.paths[0].height;
					obj.paths[1].text = recvdObj.paths[1].text;
				},
				
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
				},

				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[1].text;
					
					txt_area.onkeyup = function (e) {
						var width = 0, height = 0;
						obj.paths[1].text = this.value;
						width = util.getStringWidth(obj.paths[1].text) + 5;
						height = util.getStringHeight(obj.paths[1].text) + 5;
						(width - obj.width) > 0 ? obj.left += (width - obj.width) / 2 : obj.left = obj.left;
						obj.width = width;
						obj.paths[0].width = width;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
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
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}]	// End of properties for button
			},	//End of shape Button

			textbox: {	// textbox wireframe object
				displayName: "textbox",
				activeIcon: "input_w.png",
				inactiveIcon: "input_g.png",
				toolAction: function (args) {
					var objects = [],
						txt = args.paths ? args.paths[1].text : "abc...";
					args.width = args.paths ? args.paths[0].width : 150;
					args.height = args.paths ? args.paths[0].height : 25;
					var border = new fabric.Rect({
						width: args.width,
						height: args.height,
						left: args.left,
						top: args.top,
						fill: '#fcfcfc',
						stroke: '#dfdfdf',
						angle: args.angle,
						scaleX: 1,
						scaleY: 1
					});
					var text = new fabric.Text(txt, {
						fontSize : 18,
						fontFamily : "delicious_500",
						fontWeight : 20,
						left : args.paths ? args.paths[1].left : -50,
						top : args.paths ? args.paths[1].top : 0,
						stroke: '#000000'
					});
					objects.push(border);
					objects.push(text);
					loadWireframe(args, objects);			
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;				
					updateProperties(obj, recvdObj);
					obj.width = recvdObj.width;
					obj.height = recvdObj.height;
					obj.paths[0].width = recvdObj.paths[0].width;
					obj.paths[0].height = recvdObj.paths[0].height;
					obj.paths[1].text = recvdObj.paths[1].text;	
					obj.paths[1].left = recvdObj.paths[1].left;
				},

				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;
					obj.paths[1].left = -resizedObj.width /2 + obj.paths[1].getWidth()/2 + 5;
				}, 

				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[1].text;
					
					txt_area.onkeyup = function (e) {
						var width = 0, height = 0;
						obj.paths[1].text = this.value;
						canvas.renderAll();
						width = obj.paths[1].getWidth() + 15;
						(width <= 150)? width = 150 : width = width;
						height = obj.paths[1].height + 5;
						(width - obj.width) > 0 ? obj.left += (width - obj.width) / 2 : obj.left = obj.left;
						(height - obj.height) > 0 ? obj.top += (height - obj.height) / 2 : obj.top = obj.top;
						obj.width = width;
						obj.height = height;
						obj.paths[0].width = width;
						obj.paths[0].height = height;
						obj.paths[1].left = -width / 2 + obj.paths[1].getWidth() / 2 + 5;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
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
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for textbox
			},	//End of shape textbox
			
			checkbox: {	//checkbox wireframe object
				displayName: "checkbox",
				activeIcon: "checkbox_w.png",
				inactiveIcon: "checkbox_g.png",
				toolAction: function (args) {
					var objects = [],
					text = args.paths ? args.paths[1].text : "check",
					margin = 15,
					space = 15,
					side = 14,
					_stroke =  args.paths ? args.paths[2].stroke : "#000000",
					_fill = "#000000";				
					args.width = args.width ? args.width : util.getStringWidth(text) + side + space;
					args.height = args.height ? args.height : side;					
					var checkbox_left = -(args.width / 2);
					var checkbox = new fabric.Polygon(      
						[{x: checkbox_left, y: args.height/2},{x:checkbox_left + args.height, y: args.height/2},{x:checkbox_left + args.height, y: -args.height/2},{x:checkbox_left, y: -args.height/2}],
						{
							fill: '#eee', 
							stroke:'#000000'						
						}
					);
					var text_left = checkbox_left + side + space;
					var text = new fabric.Text(text, {
						fontSize : 20,
						fontFamily : "delicious_500",
						fontWeight : 20,
						left : args.paths ? args.paths[1].left : -(-(util.getStringWidth(text))/2 - text_left),
						top : 0,
						fill: _fill,
						stroke: _stroke
					});
					var tick = new fabric.Polyline(
						[{x: checkbox_left + 3, y: 1},{x: checkbox_left + args.height/2 - 2, y: args.height/2 - 2},{x: checkbox_left + args.height - 3, y: -args.height/2 + 2}],
						{fill: '#ffffff', stroke: _stroke});
					objects.push(checkbox);
					objects.push(text);
					objects.push(tick);
					loadWireframe(args, objects);			
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;	
					updateProperties(obj, recvdObj);					
					obj.paths[0].points = recvdObj.paths[0].points;
					obj.paths[1].left = recvdObj.paths[1].left;
					obj.paths[1].text = recvdObj.paths[1].text;
					obj.paths[2].stroke = recvdObj.paths[2].stroke;
					obj.paths[2].points = recvdObj.paths[2].points;					
					obj.width = recvdObj.width;
					obj.height = recvdObj.height;
				},

				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);
					var checkbox_left = -(resizedObj.width / 2);					
					obj.paths[0].points = [{x: checkbox_left, y: resizedObj.height/2},{x:checkbox_left + resizedObj.height, y: resizedObj.height/2},{x:checkbox_left + resizedObj.height, y: -resizedObj.height/2},{x: checkbox_left, y: -resizedObj.height/2}];							
					obj.paths[2].points = [{x: checkbox_left + 3, y: 1},{x: checkbox_left+resizedObj.height/2 - 2,y:resizedObj.height/2 - 2},{x: checkbox_left + resizedObj.height - 3,y: -resizedObj.height/2 + 2}];
					obj.paths[1].left = obj.paths[1].getWidth()/2 + checkbox_left + resizedObj.height + 15;
				}, 

				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[1].text;
					
					txt_area.onkeyup = function (e) {
						var wdth = 0;
						obj.paths[1].text = this.value;
						canvas.renderAll();
						wdth = obj.paths[1].getWidth() + 14 + 15 + 30;
						(wdth - obj.width) > 0 ? obj.left += (wdth - obj.width)/2 : obj.left = obj.left;
						obj.width = wdth;
						var checkbox_left = -wdth/2 + 15;
						var text_left = checkbox_left + 14 + 15;
						obj.paths[0].points[0].x = checkbox_left;
						obj.paths[0].points[1].x = checkbox_left + 14;
						obj.paths[0].points[2].x = checkbox_left + 14;
						obj.paths[0].points[3].x = checkbox_left;
						obj.paths[1].left = -(-(obj.paths[1].getWidth())/2 - text_left);
						obj.paths[2].points[0].x = checkbox_left + 3;
						obj.paths[2].points[1].x = checkbox_left + 6;
						obj.paths[2].points[2].x = checkbox_left + 11;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
					checkboxSelectionHandler(obj);
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
				},{
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				},{
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},	
					defaultvalue: 1
				},{
					name: 'scaleY',
					type: 'number',
					action: function (args) {
					(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for checkbox
			},	//End of shape checkbox
		
			radio: {	// radio wireframe object
				displayName: "radio",
				activeIcon: "radiobutton_w.png",
				inactiveIcon: "radiobutton_g.png",
				toolAction: function (args) {
					var fillColor = '#000000', _stroke = '#000000', _radius = args.paths ? args.paths[0].radius : 8, _opacity = 0.8,
						_fontfamily = 'delicious_500', _fontSize = 20
					var objects = [],
						text = args.paths ? args.paths[2].text : "radio",
						width = 0;
					var txt_width = util.getStringWidth(text);
					width = txt_width + (2 * _radius) + 30;// 10 for space between circle and radius and 30 (15 + 15) margins
					args.width = args.width ? args.width : width;		
					args.height = args.height ? args.height : 2 * _radius;
					var outer_circle = new fabric.Circle({
						radius: _radius,
						left: -args.width/2 + _radius,
						top: 0,  
						fill: '#eee',
						stroke: _stroke,
						opacity: _opacity,
						angle: args.angle
					});
					var inner_circle = new fabric.Circle({
						radius: _radius/2,
						left: -args.width/2 + _radius,
						top: 0,
						fill: args.paths ? args.paths[1].fill : '#555555',                    
						opacity: _opacity,
						angle: args.angle
					});					
					var txt = new fabric.Text(text,{
						left: args.paths ? args.paths[2].left : 10,
						top: 0,
						fontFamily: _fontfamily,
						fontSize:_fontSize,
						fontWeight:20,
						textAlign:'right',
						angle: args.angle,
						fill: fillColor,
						stroke: _stroke
					});				
					objects.push(outer_circle);
					objects.push(inner_circle);
					objects.push(txt);					
					var text_left = outer_circle.left + (2 * _radius) + 5;
					txt.left = -(-(txt_width)/2 - text_left);					
					loadWireframe(args, objects);
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;					
					updateProperties(obj, recvdObj);
					obj.paths[0].left = recvdObj.paths[0].left;
					obj.paths[0].radius = recvdObj.paths[0].radius;
					obj.paths[1].fill = recvdObj.paths[1].fill;
					obj.paths[1].left = recvdObj.paths[1].left;
					obj.paths[1].radius = recvdObj.paths[1].radius;
					obj.paths[2].left = recvdObj.paths[2].left;
					obj.paths[2].text = recvdObj.paths[2].text;
					obj.width = recvdObj.width;
				},

				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid),					
						new_radius = obj.height/2,
						txt_width = util.getStringWidth(obj.paths[2].text);
					if (new_radius > 0) {
						obj.paths[0].radius = new_radius;
						obj.paths[1].radius = new_radius / 2;
						obj.paths[0].left = -resizedObj.width/2 + new_radius;
						obj.paths[1].left = obj.paths[0].left;
						obj.paths[2].left = -(-(txt_width)/2 - (obj.paths[0].left + (2 * new_radius) + 5));							
					}
				},
				
				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[2].text;
					
					txt_area.onkeyup = function (e) {
						var wdth = 0;
						obj.paths[2].text = this.value;
						canvas.renderAll();
						wdth = obj.paths[2].getWidth() + (2 * obj.paths[1].radius) + 15 + 30;
						(wdth - obj.width) > 0 ? obj.left += (wdth - obj.width) / 2 : obj.left = obj.left;
						obj.width = wdth;
						obj.paths[0].left = -wdth/2 + obj.paths[0].radius;
						obj.paths[1].left = obj.paths[0].left;
						var text_left = obj.paths[0].left + (2 * obj.paths[1].radius) + 15;
						obj.paths[2].left = -(-obj.paths[2].getWidth() / 2 - text_left);
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
					radioSelectionHandler(obj);
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
					name: 'opacity',
					type: 'number',
					action: function (args) {
						(args.obj).set("opacity", args.property);
					},
					defaultvalue: 0.6
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
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for radio
			},	// End of shape radio
			
			combo: {	// Combo wireframe object
				displayName: "combo",
				activeIcon: "combobox_w.png",
				inactiveIcon: "combobox_g.png",
				toolAction: function (args) {
					var objects = [],
						text = args.paths ? args.paths[3].text : "Edit me",
						margin = 15,				
						space = 5,
						side = 25;
					args.width = args.paths ? args.paths[0].width : util.getStringWidth(text) + side + (2 * margin);
					args.height = args.paths ? args.paths[0].height : 20;
					var outerRect = new fabric.Rect({
						width: args.width,
						height: args.height,
						fill: '#fdfdfd',
						stroke: '#ddd'
					});
					var innerRect = new fabric.Polygon(      
						[{x: args.width/2 - 22,y:args.height/2 },{x:args.width/2 , y:args.height/2},{x:args.width/2 , y:-args.height/2},{x:args.width/2 - 22, y:-args.height/2}],
						{
							fill: '#dfdfdf', 
							stroke:'#dfdfdf'						
						}
					);	
					var triangle = new fabric.Polygon([{x: args.width/2 - 15.5,y: -2.5},{x:args.width/2 - 6.5,y:-2.5},{x:args.width/2 - 10.5 ,y:2.5}],
						{fill:'#000000',stroke:'#000000'});				
					var text = new fabric.Text(text, {
						fontSize : 16, 
						fontFamily : "delicious_500", 
						fontWeight : 20,
						left : args.paths ? args.paths[3].left : -4,
						top : 0
					});
					objects.push(outerRect);
					objects.push(innerRect);
					objects.push(triangle);
					objects.push(text);
					loadWireframe(args, objects);			
				},

				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;				
					updateProperties(obj, recvdObj);
					obj.width = recvdObj.width;
					obj.paths[0].width = recvdObj.paths[0].width;
					obj.paths[0].height = recvdObj.paths[0].height;					
					obj.paths[1].points = recvdObj.paths[1].points;
					obj.paths[2].points = recvdObj.paths[2].points;
					obj.paths[3].text = recvdObj.paths[3].text;						
				},
				resizeAction: function (resizedObj) {
					var obj = util.getObjectById(resizedObj.uid);										
					obj.paths[0].width = resizedObj.width;
					obj.paths[0].height = resizedObj.height;					
					obj.paths[1].points = [{x: resizedObj.width/2 - 22, y: resizedObj.height/2 },{x: resizedObj.width/2 , y: resizedObj.height/2},{x: resizedObj.width/2 , y: -resizedObj.height/2},{x: resizedObj.width/2 - 22, y: -resizedObj.height/2}];					
					obj.paths[2].points = [{x: resizedObj.width/2 - 15.5,y: -2.5},{x: resizedObj.width/2 - 6.5,y: -2.5},{x: resizedObj.width/2 - 10.5 ,y: 2.5}];
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[3].text;
					
					txt_area.onkeyup = function (e) {
						var wdth = 0;
						obj.paths[3].text = this.value;
						canvas.renderAll();
						wdth = obj.paths[3].getWidth() + obj.paths[1].width + 30;
						(wdth - obj.width) > 0 ? obj.left += (wdth - obj.width)/2 : obj.left = obj.left;
						obj.width = wdth;
						obj.paths[0].width = wdth;
						obj.paths[1].points[0].x = wdth/2 -22;
						obj.paths[1].points[1].x = wdth/2;
						obj.paths[1].points[2].x = wdth/2;
						obj.paths[1].points[3].x = wdth/2 - 22;
						obj.paths[2].points[0].x = wdth/2 - 15.5;
						obj.paths[2].points[1].x = wdth/2 - 6.5;
						obj.paths[2].points[2].x = wdth/2 - 10.5;
						obj.paths[3].left = -wdth/2 + 15 + obj.paths[3].getWidth()/2;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
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
				},{
					name: 'angle',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 0
				},{
					name: 'scaleX',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleX", args.property);
					},
					defaultvalue: 1
				},{
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("scaleY", args.property);
					},
					defaultvalue: 1
				}]	// End of properties for combo
			},	//End of shape combo

			slider: {	//Slider wireframe object
				displayName: "slider",
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
					loadWireframe(args, objects);			
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
			
			progressbar: {	// progressbar wireframe object
				displayName: "progressbar",
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
					loadWireframe(args, objects);			
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
			},	//End of shape progressbar	
		
			image: {	//Image wireframe object
				displayName: "image",
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
					loadWireframe(args, objects);	
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
			
			password: {	//password wireframe object
				displayName: "password",
				activeIcon: "password_w.png",
				inactiveIcon: "password_g.png",
				toolAction: function (args) {
					var objects = [],
						txt = args.paths ? args.paths[1].text : "************";
					args.width = util.getStringWidth(txt) + 30;
					args.height = util.getStringHeight(txt);	
					var rect = new fabric.Rect({
						left: args.left,
						top: args.top,
						width: args.width,
						height: args.height,
						fill: '#fcfcfc',
						stroke: '#dfdfdf'
					});
					var text = new fabric.Text(txt, {
						fontSize : 20, 
						fontFamily : "delicious_500", 
						fontWeight : 20,							
						stroke: '#000000',
						top: 4,
						left: 4
					});	
					objects.push(rect);						
					objects.push(text);
					loadWireframe(args, objects);			
				},
				modifyAction: function (args) {
					var obj = util.getObjectById(args.uid);
					var recvdObj = args.object;	
					updateProperties(obj, recvdObj);				
					obj.width = recvdObj.width;
					obj.height = recvdObj.height;
					obj.paths[0].width = recvdObj.paths[0].width;
					obj.paths[0].height = recvdObj.paths[0].height;
					obj.paths[1].text = recvdObj.paths[1].text;								
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
				},
				applyProperties: function (props) {
					objproperties._applyProperties(props);
					var obj = canvas.getActiveObject();
					$("#proptable").append("<tr id = 'txtrow'><td id= 'txttd' valign='top'><label style = 'text-align:right; vertical-align:top' id='labl' for='txtarea'>text:</label></td><td><textarea id='txtarea' cols= '10' style='height:75px'>hello</textarea> </td></tr>");
					var txt_area = document.getElementById("txtarea");
					txt_area.innerHTML = obj.paths[1].text;
					
					txt_area.onkeyup = function (e) {
						obj.paths[1].text = "";
						for (var i = 0; i < this.value.length; i++)
						{
							obj.paths[1].text += '*';
						}
						canvas.renderAll();
						this.value = obj.paths[1].text;
						var width = 0, height = 0;
						width = obj.paths[1].getWidth() + 30;
						height = util.getStringHeight(obj.paths[1].text);
						(width - obj.width) > 0 ? obj.left += (width - obj.width)/2 : obj.left = obj.left;
						obj.width = width;
						obj.height = height;
						obj.paths[0].width = width;
						obj.paths[0].height = height;
						matisse.comm.sendDrawMsg({
							action: "modified",
							args: [{
								uid: obj.uid,
								object: obj
							}]
						});
						obj.setCoords();
						canvas.renderAll();
					};
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
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}, {
					name: 'scaleY',
					type: 'number',
					action: function (args) {
						(args.obj).set("angle", args.property);
					},
					defaultvalue: 1
				}]	//End of properties for password
			}, 	//End of shape password
			
			div: {	// Div wireframe object
				displayName: "div",
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
			}	//End of shape Div			
		} // end of shapes
	});	//End of wireframes
});