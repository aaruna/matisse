/**
 * Author: Bahvani Shankar
 * Date: 12/26/11
 * Time: 11:16 AM
 * About matisse.ui : matisse.ui is the module to set all ui related things like canvas, accordian, carousal etc.
 */
define(["matisse"], function (matisse) {
	"use strict";
	var ui = {
		/** width and height of panels for resize */
		bodyWidth: null,
		bodyHeight: null,
		initialBodyWidth: $(window).width() > 960 ? $(window).width() : 960,
		initialBodyHeight: $(window).height() > 800 ? $(window).height() : 800,
		topPanelHeight: null,
		leftPanelWidth: null,
		leftPanelHeight: null,
		accordionContentHeight: null,
		canvasWidth: null,
		canvasHeight: null,
		deviceWidth: null,
		deviceHeight: null,
		deiviceInnerHeight: null,
		deviceInnerWidth: null,
		/**
		 * function to initialize width and heights
		 * @method initWidthAndHeightOfPanels
		 * @param none
		 */
		initWidthAndHeightOfPanels: function () {
			this.bodyWidth = $(window).width() - 2;
			this.bodyHeight = $(window).height();
			this.topPanelHeight = 100;
			this.leftPanelWidth = 100;
			this.leftPanelHeight = this.bodyHeight - this.topPanelHeight;
			//this.canvasWidth = 800;//this.bodyWidth - this.leftPanelWidth;
			//this.canvasHeight = 600;//this.bodyHeight - this.topPanelHeight - 23;
		},
		/**
		 * method to resize panels on resize of browser window
		 * @method resizeWindow
		 * @param none
		 */
		resizeWindow: function () {
			this.resizeBody();
			this.resizeHeader();
			this.resizeMainPanel();
			this.resizeLeftPanel();
			this.setAccordinContentHeight();
			this.resizeCanvas();			
		},
		/**
		 * method to resize the document body
		 * @method resizeBody
		 * @param none
		 */
		resizeBody: function () {
			$('#_body').width(this.bodyWidth + 2);
			$('#_body').height(this.bodyHeight);
		},

		/**
		 * method to set header width and height
		 * @method resizeHeader
		 * @param none
		 */
	    resizeHeader: function () {
			$('#header').width(this.bodyWidth);
			$('#header').height(this.topPanelHeight);
		},
		/**
		 * Set Outer panel width and height
		 * @method resizeMainPanel
		 * @param none
		 */
		resizeMainPanel: function () {
			$('#outer').height(this.leftPanelHeight);
			$('#outer').width(this.bodyWidth);
		},
		/**
		 * Set left panel width and height
		 * @method resizeLeftPanel
		 * @param none
		 */
		resizeLeftPanel: function () {
			$('#leftdiv').width(this.leftPanelWidth);
			$('#leftdiv').height(this.leftPanelHeight);
		},
		/**
		 * Set Canvas width and height
		 * @method resizeCanvas
		 * @param none
		 */
	    resizeCanvas: function () {
			$('#containerDiv').height($(window).height() - this.topPanelHeight - 23);
			$('#containerDiv').width($(window).width() - this.leftPanelWidth);
			$('#containerBody').height(this.deviceHeight); //Should be set to container height and width
			$('#containerBody').width(this.deviceWidth);	
			$('#canvasId').height(this.deviceInnerHeight); //Should be set to container inner height and width
			$('#canvasId').width(this.deviceInnerWidth);		
			canvas.setDimensions({width: this.canvasWidth, height: this.canvasHeight});
		},
		/**
		 * Set Accordian width and height
		 * @method setAccordinContentHeight
		 * @param none
		 */
	    setAccordinContentHeight: function () {
			var $accordionHeaders = $('.ui-accordion-header');			
			var accordionHeaderHeight = 0;
			$accordionHeaders.each(function (i, s) {				
				accordionHeaderHeight = accordionHeaderHeight + $(s).outerHeight(true);				
			});
			var accordionContentHeight = (this.leftPanelHeight - (accordionHeaderHeight + 25));
			$('.ui-accordion-content').height(accordionContentHeight);
			this.setCarousalHeight(accordionContentHeight);			
		},

		/**
		 * Set carousal height
		 * @method setCarousalHeight
		 * @param accordionContentHeight - height of the accordion content
		 */
		setCarousalHeight: function (accordionContentHeight) {
			$('.shapesHolder').height(accordionContentHeight - 28); // 28 = 2 * 14 where, 14px is the height of down and up arrows of carousal
		},
		
		/**
		 * Bind resizing of window to panels
		 * @method bindResizeWindow
		 * @param none
		 */
		bindResizeWindow: function () {
			var thisObj = this;
			$(window).resize(function () {
				thisObj.initWidthAndHeightOfPanels();
			    thisObj.resizeWindow();
			    //thisObj.setCanvasSize();
				thisObj.drawHVLines();
			});
		},
		/**
		 *  Reset Current seltected tool Icon when object is drawn on canvas
		 *  @method  resetIconSelection
		 *  @param none
		 */
		resetIconSelection: function () {
			if (matisse.$currActiveIcon) {
				matisse.$currActiveIcon.attr("src", matisse.$currActiveIcon.attr('data-inactive'));
				matisse.$currActiveIcon.parent().parent().removeClass('shape-active');
			}
		},
		/**
		 * Sets the Canvas width and height based on browser window size
		 * @method setCanvasSize
		 * @param none
		 *
		 */
		setCanvasSize: function () {			
			var width = this.canvasWidth;
			var height = this.canvasHeight;
			canvas.setDimensions({width: width, height: height});
		},
		/**
		 * Update accordion
		 * @method updateAccordian
		 * @param palette_DisplayName
		 */
		updateAccordian: function (palette_DisplayName) {
			$("#accordion").append('<h3><a href="#">' + palette_DisplayName + '</a></h3><div height="100%" id="' + palette_DisplayName + '"></div>');
		},
		
		/**
		 * Draws Horizontal and Vertical lines that are used as guilde lines for object alignment
		 * @method drawHVLines
		 * @param none
		 */
		drawHVLines: function () {
			//remove first, needs to redraw when window is resized
			canvas.remove(matisse.hLine);
			canvas.remove(matisse.vLine);
			
			var width = this.canvasWidth;
			var height = this.canvasHeight;
			matisse.hLine = new fabric.Line([0, -10, width, -10], {
				eanbled: false,
				stroke: '#ff0000',
				left: width / 2
			});
			matisse.vLine = new fabric.Line([-10, 0, -10, height], {
				eanbled: false,
				stroke: '#ff0000',
				top: height / 2
			});
			matisse.vLine.name = 'vline';
			matisse.hLine.name = 'hline';
			canvas.add(matisse.hLine);
			canvas.add(matisse.vLine);
			matisse.hLine.set('fill', '#ff0000');
			matisse.vLine.set('fill', '#ff0000');
			matisse.hLine.set('strokeWidth', '.5');
			matisse.vLine.set('strokeWidth', '.5');
			//disableObject(line);
			//	fabric.util.makeElementUnselectable(line)
		},
		/**
		* Carousal implementation 
		*
		*
		*/
		corousal: function () {
			$(".scroller-up").live("click", function () {
				var scrollerContentHolderHeight = $(this).siblings().find(".scrollerContentHolder").css('height');
				var scrollerContentHolderTop = $(this).siblings().find(".scrollerContentHolder").css('top');
				var parentHeight = $(this).parent().css('height');
				var shapeHeight = $(".scrollerContentHolder:visible>.shape-holder").height();
				scrollerContentHolderHeight = scrollerContentHolderHeight.substr(0, scrollerContentHolderHeight.indexOf('px'));
				parentHeight = parentHeight.substr(0, parentHeight.indexOf('px'));
				scrollerContentHolderTop = scrollerContentHolderTop.substr(0, scrollerContentHolderTop.indexOf('px'));
				if (scrollerContentHolderTop < -30) {
					$(".scroller-down").css("background-color", "#8F98A6");
					var newTop = (scrollerContentHolderTop - (-shapeHeight));
					$(this).siblings().find(".scrollerContentHolder").stop().animate({
						"top": newTop
					}, "slow");
				} else {
					$(".scroller-up").css("background-color", "#aaa");
				}				
			});
			$(".scroller-down").live("click", function () {
				var scrollerContentHolderHeight = $(this).siblings().find(".scrollerContentHolder").css('height');
				var scrollerContentHolderTop = $(this).siblings().find(".scrollerContentHolder").css('top');
				var parentHeight = $(this).parent().css('height');
				var shapeHeight = $(".scrollerContentHolder:visible>.shape-holder").height();
				scrollerContentHolderHeight = scrollerContentHolderHeight.substr(0, scrollerContentHolderHeight.indexOf('px'));
				parentHeight = parentHeight.substr(0, parentHeight.indexOf('px'));
				scrollerContentHolderTop = scrollerContentHolderTop.substr(0, scrollerContentHolderTop.indexOf('px'));
				var carouselArrowheight = 18;
				var accordianHeight = $(".ui-accordion-content").height() - (carouselArrowheight * 2);
				var sumOfShapesHeight = $(".scrollerContentHolder:visible").height();
				if (scrollerContentHolderHeight > parentHeight) {
					if (-(scrollerContentHolderTop) < (sumOfShapesHeight - accordianHeight - 30)) {
						$(".scroller-up").css("background-color", "#8F98A6");
						var newTop = (scrollerContentHolderTop - shapeHeight);
						$(this).siblings().find(".scrollerContentHolder").stop().animate({
							"top": newTop
						}, "slow");
					} else {
						$(".scroller-down").css("background-color", "#aaa");
					}
				}
			});
			function scrollUp(e) {
				$(this).siblings(".scrollerContentHolder").css("top", "yellow");
			}
		}
	};
	ui.corousal();
	return ui;
});