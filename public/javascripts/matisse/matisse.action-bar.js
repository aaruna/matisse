define( ["matisse"], function (matisse) {
	"use strict";
	var actionBar = {
		initalize:function(){
			var selfObj = this;			

			//Attach events for the Actions			
			var bottomEle = $(".bottom");
			bottomEle.click(function(e){
				selfObj.handleAction.call(selfObj,e);
			});				

			$(this.popoverElements).popover({"placement":"left"});
			$(".user-image").popover({"placement":"bottom",
				content:function(){
					return "<h1> Hello User, User Data is comming soon! </h1>";			
				},
				"trigger":"manual"
			});
			
			//Attaching the Events for small user pic
			$("#userProfilePic").click(function(e){
				selfObj.showUserInfoSection();
				return false;
			});
		},
		/*closeAllPopovers:function(){
			for(p in this.popoverElements){
				$(p).popover("hide");			
			}		
		},*/
		handleAction:function(e){
			var ele = $(e.target).closest(".menu-holder");			 
			if(ele){
				switch(ele.data().action){
					case "save" : this.saveHandler();
						      break;
					case "edit" : break;
					case "discuss" : this.discussHandler();
							break;
					case "report" :break;
					case "help" : break;
					case "view" : break;
					case "share" : break;
				}				
			}
		},
		discussHandler:function(){
		    //TODO Refactor with Bootstrap Dialog		
         	    $('#chatdialog').dialog({
			width: 250
		    });
		    var dialog_width = $("#chatdialog").dialog("option", "width");
		    var win_width = $(window).width();
		    $('#chatdialog').dialog({
			position: [win_width - dialog_width, 200]
		    });

		    $('#chatdialog').dialog('open');
		    $('#chatdialog').dialog({
			resizable: false
		    });
		},
		saveHandler:function(){
			//TODO Refactor with Bootstrap Dialog
			canvas.deactivateAll();
			var data = canvas.toDataURL('png', 0.1);
			popup('popUpDiv', 'closediv', 600, 600);
			$("#result").html('<img src=' + data + ' />');
		},
		showUserInfoSection:function(){
			$(".userInfoSec").fadeIn();
		},		
		hideUserInfoSection:function(){
			if($(".userInfoSec:visible")){
				$(".userInfoSec").fadeOut();
			}
		},
		stateUpdated: function(obj, state) {
      if (state == "modified") {
        var originalObj = actionBar.getOriginalObj(obj);
        matisse.undoStack.push({
          palette: obj.palette,
          name: obj.name,
          action: 'modified',
          path: obj.path,
          args: [{uid: obj.uid, object: originalObj}]
        });
      }
      else if (state == "created"){
        matisse.undoStack.push({
          palette: matisse.paletteName,
          action: matisse.action,
          args: matisse.shapeArgs
        });
      }
      else if (state == "deleted"){
        var obj =  canvas.getActiveObject();
        matisse.undoStack.push({
          palette: obj.palette,
          action: obj.name,
          args: [obj]
        });
        matisse.main.deleteObjects();
      }
    },
    handleUndoAction: function() {
      var obj = matisse.undoStack.pop();
      if (typeof(obj) != "undefined") {
        if (obj.action == "modified") {
          canvas.getObjects().forEach(function(item, index) {
          if (item.uid == obj.args[0].uid)
            {
              var currentObj = actionBar.getCurrentObj(item);
              matisse.redoStack.push({action: "modified",
                name: obj.name,
                palette: obj.palette,
                path: obj.path,
                args: [{
                  uid: obj.args[0].uid,
                  object: currentObj
                }]
              });
              matisse.comm.sendDrawMsg({
                action: obj.action,
                name: obj.name,
                palette: obj.palette,
                path: obj.path,
                args: obj.args

              });
                matisse.main.modifyObject(obj.args);
             }
          });
        }
      else if (obj.action == "zindexchange") {

      }
      else {
        var created = true;
        canvas.getObjects().forEach(function(item, index) {
          if (item.uid == obj.args[0].uid)
            {
              created = false;
              matisse.redoStack.push(obj);
              canvas.setActiveObject(item);
              matisse.main.deleteObjects();
            }
        });
        if (created) {
        if (obj.args[0].stateProperties) {
          var currentObj = actionBar.getCurrentObj(obj.args[0]);
          currentObj.uid = obj.args[0].uid;
          currentObj.name = obj.action;
          currentObj.palette = obj.palette;
        }
        else {
          var currentObj = obj.args[0];
        }
          matisse.comm.sendDrawMsg({
            palette: obj.palette,
            action: obj.action,
            path: obj.path,
            args: [currentObj]
          });
          matisse.palette[obj.palette].shapes[obj.action].toolAction.apply(null, obj.args);
          matisse.redoStack.push({
            palette: obj.palette,
            action: obj.action,
            path: obj.path,
            args: [currentObj]
          });
        }
      }
    }
    },
    handleRedoAction: function() {
      var obj = matisse.redoStack.pop();
      if (typeof(obj) != "undefined") {
        if (obj.action == "modified") {
          canvas.getObjects().forEach(function(item, index) {
          if (item.uid == obj.args[0].uid)
            {
              var currentObj = actionBar.getCurrentObj(item);
              matisse.undoStack.push({action: "modified",
                name: obj.name,
                palette: obj.palette,
                path: obj.path,
                args: [{
                  uid: obj.args[0].uid,
                  object: currentObj
                }]
              });
              matisse.comm.sendDrawMsg({
                action: obj.action,
                name: obj.name,
                palette: obj.palette,
                path: obj.path,
                args: obj.args
              });
                matisse.main.modifyObject(obj.args);
             }
          });
        }
      else if (obj.action == "zindexchange") {

      }
      else {
        var created = true;
        canvas.getObjects().forEach(function(item, index) {
          if (item.uid == obj.args[0].uid)
            {
              created =  false;
              matisse.undoStack.push(obj);
              canvas.setActiveObject(item);
              matisse.main.deleteObjects();
            }
        });
        if (created) {
        if (obj.args[0].stateProperties) {
                  var currentObj = actionBar.getCurrentObj(obj.args[0]);
                  currentObj.uid = obj.args[0].uid;
                  currentObj.name = obj.action;
                  currentObj.palette = obj.palette;
                  currentObj.width = obj.args[0].width;
                }
                else {
                  var currentObj = obj.args[0];
                }
          matisse.comm.sendDrawMsg({
            palette: obj.palette,
            action: obj.action,
            path: obj.path,
            args: [currentObj]
          });
          matisse.palette[obj.palette].shapes[obj.action].toolAction.apply(null, obj.args);
          matisse.undoStack.push({
            palette: obj.palette,
            action: obj.action,
            args: [currentObj]
          });
        }
      }
    }
    },
    getOriginalObj: function(obj) {
      var originalObj = {};
      var j;
      for (j=0;j<obj.stateProperties.length;j++) {
        originalObj[obj.stateProperties[j]] = obj.originalState[obj.stateProperties[j]];
      }
      originalObj["paths"] = obj["paths"];
      return originalObj;
    },
    getCurrentObj: function(obj) {
      var currentObj = {};
      var j;
      for (j=0;j<obj.stateProperties.length;j++) {
        currentObj[obj.stateProperties[j]] = obj[obj.stateProperties[j]];
      }
      currentObj["paths"] = obj["paths"];
      return currentObj;
    }
	}
	return actionBar;
});	
