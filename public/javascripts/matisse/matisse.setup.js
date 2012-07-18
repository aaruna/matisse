/**
 * User: Bahvani Shankar,Pradeep
 * Date: 12/26/11
 * Time: 11:16 AM
 * About this :Entry Point File, All Dom Ready functions need to be defined here
 */

define(["matisse", "matisse.fabric", "matisse.comm", "matisse.main", "matisse.containers", "matisse.containers.devices", "matisse.layouts", "matisse.effects", "matisse.layouts.content", "matisse.palettes", "matisse.palettes.basicshapes", "matisse.palettes.wireframe", "matisse.palettes.components", "matisse.events", "../javascripts/thirdparty/csspopup.js", "matisse.help"], function (matisse, mfabric, Comm, main, containers, palettes, layouts, effects) {
    
    "use strict";
	//Dom Ready function
	$(function () {
		var serverURL = 'http://'+location.host,//change it to server ip or local ip for testing from other machines
			comm = new Comm(serverURL);
		/**
         * Initializes the application with the containers and layout set by user or asks your to choose them if not set yet
         * @method comm.onContainerDraw
         * @param data - container name and layout type
         *
         */	
		comm.onContainerDraw = function (data) {
			/* get container and layout data from server if any and assing it */			
			data == 'empty' ? matisse.containerName = data : matisse.containerName = data.container;
			/* if data is available then start application with this container and layout*/
			if (matisse.containerName !== 'empty') {
				containers.containerName = matisse.containerName;
				containers.canvasWidth = data.canvasWidth;
				containers.canvasHeight = data.canvasHeight;
				containers.setContainer(matisse.containerName, 'old', containers.canvasWidth, containers.canvasHeight);
			    $('#boardName').text(data.name);
				return;
			} 
			/* if data is not available or user logs in for the first time, show him the list of container names and layouts to choose */
			//layouts.createLayoutsList();
			containers.createContainerList();
		}
	      /**
               * Displays welcome message with user name
               * @method comm.onUserInfo
               * @param data - user details
               *
               */
	      comm.onUserInfo = function(data) {
		  /* check if userName is not available, then show welcome message*/
		  if(matisse.userName == null) {
                      // key is login-service name like 'twitter', 'google' etc
                      var userInfoKey = data.loginService.toLowerCase();
                      var user = data[userInfoKey];
		      matisse.userName = user.name;
                      matisse.userProfilePic = user.profile_image_url || user.picture;
                      matisse.userLoginService = data.loginService;
		      $('#userProfilePic').append('<img src="'+matisse.userProfilePic+'" alt="pic" class="b-userpic"></img>');
		      $('#userProfilePicBig').append('<img src="'+matisse.userProfilePic+'" alt="pic" class="b-userpic-big"></img>');
		      $('#userName').html(matisse.userName);
		      $('#userLoginService').html(matisse.userLoginService);
		  }
	      };
	      matisse.comm = comm;
              matisse.main = main;
              main.addTools();

              effects.showModifiedByUser(matisse);
	  });
});
