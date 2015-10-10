;(function(exports) {
	'use strict';

	var PI2 = Math.PI * 2;

	var requestAnimationFrame, cancelAnimationFrame;
	var __hasProp = {}.hasOwnProperty;
	var __extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key)) child[key] = parent[key];
		}

		function Ctor() { this.constructor = child; }
		Ctor.prototype = parent.prototype;
		child.prototype = new Ctor();
		child.__super__ = parent.prototype;
		return child;
	};

	/* $.extend functionality */
	function extend( target, src ) {
		var name, copy, copyIsArray, clone,
			options = src,
			i = 1,
			deep = true;
		// Handle a deep copy situation
		if( typeof target === 'boolean' ) {
			deep = target;
			// skip the boolean and the target
			i = 2;
		}
		// Handle case when target is a string or something( possible in deep copy )
		if( typeof target !== 'object' && typeof target !== 'function' ){
			target = {};
		}
		// Only deal with non-null/undefined values
		if (! options) return target;

			// Extend the base object
		for( name in options ) {
			src = target[name];
			copy = options[name];
			// Prevent never-ending loop
			if( target === copy ) continue;
			// Recurse if we're merging plain objects or arrays
			copyIsArray = Array.isArray(copy);
			if( deep && (typeof copy === 'object' || copyIsArray)) {
				if( copyIsArray ) {
					clone = src && Array.isArray(src) ? src : [];
				} else clone = src && typeof src === 'object' ? src : {};
				// Never move original objects, clone them
				target[name] = extend(clone, copy);
				// Don't bring in undefined values
			} else if( typeof copy !== 'undefined' ) target[name] = copy;
		}

		return target;
	}

	// Make available to window
	var GameController = exports.GameController = {
		options: {
			left: {
				type: 'dpad',
				position: { left: '13%', bottom: '22%' },
				dpad: {
					up: {
						width: '7%',
						height: '15%',
						stroke: 2,
						touchStart: function() {
							GameController.simulateKeyEvent( 'press', 38);
							GameController.simulateKeyEvent( 'down', 38);
						},
						touchEnd: function() {
							GameController.simulateKeyEvent( 'up', 38);
						}
					},
					left: {
						width: '15%',
						height: '7%',
						stroke: 2,
						touchStart: function() {
							GameController.simulateKeyEvent( 'press', 37);
							GameController.simulateKeyEvent( 'down', 37);
						},
						touchEnd: function() {
							GameController.simulateKeyEvent( 'up', 37);
						}
					},
					down: {
						width: '7%',
						height: '15%',
						stroke: 2,
						touchStart: function() {
							GameController.simulateKeyEvent( 'press', 40);
							GameController.simulateKeyEvent( 'down', 40);
						},
						touchEnd: function() {
							GameController.simulateKeyEvent( 'up', 40);
						}
					},
					right: {
						width: '15%',
						height: '7%',
						stroke: 2,
						touchStart: function() {
							GameController.simulateKeyEvent( 'press', 39);
							GameController.simulateKeyEvent( 'down', 39);
						},
						touchEnd: function() {
							GameController.simulateKeyEvent( 'up', 39);
						}
					}
				},
				joystick: {
					radius: 60,
					touchMove: function( e ) {
						console.log( e);
					}
				}
			},
			right: {
				type: 'buttons',
				position: { right: '17%', bottom: '28%' },
				buttons: [{
					offset: { x: '-13%', y: 0 },
					label: 'X',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'blue',
					fontColor: '#fff',
					touchStart: function() {
						// Blue is currently mapped to up button
						GameController.simulateKeyEvent( 'press', 88); // x key
						GameController.simulateKeyEvent( 'down', 88);
					},
					touchEnd: function() {
						GameController.simulateKeyEvent( 'up', 88);
					}
				}, {
					offset: { x: 0, y: '-11%' },
					label: 'Y',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'yellow',
					fontColor: '#fff',
					touchStart: function() {
						GameController.simulateKeyEvent( 'press', 70); // f key
						GameController.simulateKeyEvent( 'down', 70);
					},
					touchEnd: function() {
						GameController.simulateKeyEvent( 'up', 70);
					}
				}, {
					offset: { x: '13%', y: 0 },
					label: 'B',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'red',
					fontColor: '#fff',
					touchStart: function() {
						GameController.simulateKeyEvent( 'press', 90); // z key
						GameController.simulateKeyEvent( 'down', 90);
					},
					touchEnd: function() {
						GameController.simulateKeyEvent( 'up', 90);
					}
				}, {
					offset: { x: 0, y: '11%' },
					label: 'A',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'green',
					fontColor: '#fff',
					touchStart: function() {
						GameController.simulateKeyEvent( 'press', 67); // a key
						GameController.simulateKeyEvent( 'down', 67);
					},
					touchEnd: function() {
						GameController.simulateKeyEvent( 'up', 67);
					}
				}],
				dpad: {
					up: {
						width: '7%',
						height: '15%',
						stroke: 2
					},
					left: {
						width: '15%',
						height: '7%',
						stroke: 2
					},
					down: {
						width: '7%',
						height: '15%',
						stroke: 2
					},
					right: {
						width: '15%',
						height: '7%',
						stroke: 2
					}
				},
				joystick: {
					radius: 60,
					touchMove: function( e ) {
						console.log( e);
					}
				}
			},
			touchRadius: 45
		},
		// Areas (objects) on the screen that can be touched
		touchableAreas: [],
		touchableAreasCount: 0,
		// Multi-touch
		touches: [],
		// Canvas offset on page (for coverting touch coordinates)
		offsetX: 0,
		offsetY: 0,
		// Bounding box - used for clearRect -
		// first we determine which areas of the canvas are actually drawn to
		bound: {
			left: false,
			right: false,
			top: false,
			bottom: false
		},
		cachedSprites: {},
		paused: false,

		init: function( options ) {
			// if( ! document.documentElement.ontouchstart ) return;
			options = options || {};
			extend( this.options, options);

			var userAgent = navigator.userAgent.toLowerCase();
			var isUserAgent = function(s){ return userAgent.indexOf(s) !== -1; };
			// See if we should run the performanceFriendly version (for slower CPUs)
			this.performanceFriendly = ['iphone', 'android'].filter(isUserAgent)[0] ||
				this.options.forcePerformanceFriendly;

			// Grab the canvas if one wasn't passed
			var ele = document.getElementById(this.options.canvas);
			if( !this.options.canvas || !ele) {
				this.options.canvas = document.getElementsByTagName('canvas')[0];
			} else if( ele ) this.options.canvas = ele;

			this.options.ctx = this.options.canvas.getContext( '2d');
			// Create a canvas that goes directly on top of the game canvas
			this.createOverlayCanvas();
		},

		/**
		 * Finds the actual 4 corners of canvas that are being used
		 * (so we don't have to clear the entire canvas each render)
		 * Called when each new touchableArea is added in
		 * @param {object} options - x, y, width, height
		 */
		boundingSet: function(options) {
			var width, height, left, top;

			// Square - pivot is top left
			if( options.width ) {
				width = this.getPixels( options.width);
				height = this.getPixels( options.height);
				left = this.getPixels( options.x);
				top = this.getPixels( options.y);

				// Circle - pivot is center
			} else {
				var radius = ! this.options.touchRadius ? options.radius :
					// size of the box the joystick can go to
					this.getPixels(options.radius) * 2 +
					this.getPixels(this.options.touchRadius) / 2;
				width = height = (radius + this.getPixels(options.stroke)) * 2;
				left = this.getPixels(options.x) - width / 2;
				top = this.getPixels(options.y) - height / 2;
			}
			var right = left + width;
			var bottom = top + height;

			if( !this.bound.left || left < this.bound.left ) this.bound.left = left;
			if( !this.bound.right || right > this.bound.right ){
				this.bound.right = right;
			}
			if( !this.bound.top || top < this.bound.top ) this.bound.top = top;
			if( !this.bound.bottom || bottom > this.bound.bottom ){
				this.bound.bottom = bottom;
			}
		},

		/**
		 * Creates the canvas that sits on top of the game's canvas and
		 * holds game controls
		 */
		createOverlayCanvas: function() {
			var _this = this;
			this.canvas = document.createElement('canvas');
			// Scale to same size as original canvas
			this.resize(true);
			document.body.appendChild(this.canvas);
			this.ctx = this.canvas.getContext( '2d');
			window.addEventListener( 'resize', function() {
				setTimeout(function(){ GameController.resize.call(_this); }, 10);
			});

			// Set the touch events for this new canvas
			this.setTouchEvents();

			// Load in the initial UI elements
			this.loadSide('left');
			this.loadSide('right');

			// Starts up the rendering / drawing
			this.render();

			// pause until a touch event
			if( !this.touches || !this.touches.length ) this.paused = true;
		},

		pixelRatio: 1,
		resize: function( firstTime ) {
			// Scale to same size as original canvas
			var gameCanvas = GameController.options.canvas;
			var canvas = this.options.canvas;
			this.canvas.width = canvas.width;
			this.canvas.height = canvas.height;
			this.offsetX = gameCanvas.offsetLeft + document.body.scrollLeft;
			this.offsetY = gameCanvas.offsetTop + document.body.scrollTop;

			// Get in on this retina action
			if( canvas.style.width &&
				canvas.style.height &&
				canvas.style.height.indexOf('px') !== -1) {
				this.canvas.style.width = canvas.style.width;
				this.canvas.style.height = canvas.style.height;
				this.pixelRatio =
					this.canvas.width / parseInt(this.canvas.style.width, 10);
			}

			this.canvas.style.position = 'absolute';
			this.canvas.style.zIndex = '5';
			this.canvas.style.left = canvas.offsetLeft + 'px';
			this.canvas.style.top = canvas.offsetTop + 'px';
			var style = this.canvas.getAttribute('style') +' -ms-touch-action: none;';
			this.canvas.setAttribute('style', style);

			if( !firstTime ) {
				// Remove all current buttons
				this.touchableAreas = [];
				// Clear out the cached sprites
				this.cachedSprites = [];
				// Reload in the initial UI elements
				this.reloadSide( 'left');
				this.reloadSide( 'right');
			}
		},

		/**
		 * Returns the scaled pixels. Given the value passed
		 * @param {int/string} value - either an integer for # of pixels,
		 * or 'x%' for relative
		 * @param {char} axis - x, y
		 */
		getPixels: function( value, axis ){
			if( !value ) return 0;
			if( typeof value === 'number' ) return value;
			// a percentage
			return parseInt(value, 10) / 100 *
				(axis === 'x' ? this.canvas.width : this.canvas.height);
		},

		/**
		 * Simulates a key press
		 * @param {string} eventName - 'down', 'up'
		 * @param {char} character
		 */
		simulateKeyEvent: function( eventName, keyCode ) {
			// No keyboard, can't simulate...
			if( typeof window.onkeydown === 'undefined' ) return false;
			var oEvent = document.createEvent('KeyboardEvent');

			// Chromium Hack
			if( navigator.userAgent.toLowerCase().indexOf( 'chrome' ) !== -1 ) {
				Object.defineProperty( oEvent, 'keyCode', {
					get: function() { return this.keyCodeVal; }
				});
				Object.defineProperty( oEvent, 'which', {
					get: function() { return this.keyCodeVal; }
				});
			}

			var initKeyEvent = oEvent.initKeyboardEvent || oEvent.initKeyEvent;
			initKeyEvent.call(oEvent,
				'key' + eventName,
				true,
				true,
				document.defaultView,
				false,
				false,
				false,
				false,
				keyCode,
				keyCode
			);

			oEvent.keyCodeVal = keyCode;
		},

		setTouchEvents: function() {
			var _this = this;

			var setTouches = function(e){
				// Microsoft always has to have their own stuff...
				if( window.navigator.msPointerEnabled &&
					!! e.clientX &&
					e.pointerType === e.MSPOINTER_TYPE_TOUCH
					){
					_this.touches[ e.pointerId ] = {
						clientX: e.clientX,
						clientY: e.clientY
					};
				} else _this.touches = e.touches || [];
			};

			var touchStart = function( e ) {
				if( _this.paused ) _this.paused = false;
				e.preventDefault();
				setTouches(e);
			};

			var touchEnd = function( e ) {
				e.preventDefault();

				if( window.navigator.msPointerEnabled &&
					e.pointerType === e.MSPOINTER_TYPE_TOUCH ) {
					delete _this.touches[ e.pointerId ];
				} else _this.touches = e.touches || [];

				if( !e.touches || ! e.touches.length ) {
					// Draw once more to remove the touch area
					_this.render();
					_this.paused = true;
				}
			};

			var touchMove = function( e ) {
				e.preventDefault();
				setTouches(e);
			};

			this.canvas.addEventListener('touchstart', touchStart, false);
			this.canvas.addEventListener('touchend', touchEnd);
			this.canvas.addEventListener('touchmove', touchMove);

			if( window.navigator.msPointerEnabled ) {
				this.canvas.addEventListener('MSPointerDown', touchStart);
				this.canvas.addEventListener('MSPointerUp', touchEnd);
				this.canvas.addEventListener('MSPointerMove', touchMove);
			}
		},

		/**
		 * Adds the area to a list of touchable areas, draws
		 * @param {object} options with properties:
		 * x, y, width, height, touchStart, touchEnd, touchMove
		 */
		addTouchableDirection: function( options ) {
			var direction = new TouchableDirection( options);
			direction.id = this.touchableAreas.push( direction);
			this.touchableAreasCount++;
			this.boundingSet(options);
		},

		/**
		 * Adds the circular area to a list of touchable areas, draws
		 * @param {object} options with properties:
		 * x, y, width, height, touchStart, touchEnd, touchMove
		 */
		addJoystick: function( options ) {
			var joystick = new TouchableJoystick(options);
			joystick.id = this.touchableAreas.push( joystick);
			this.touchableAreasCount++;
			this.boundingSet(options);
		},

		/**
		 * Adds the circular area to a list of touchable areas, draws
		 * @param {object} options with properties:
		 * x, y, width, height, touchStart, touchEnd, touchMove
		 */
		addButton: function( options ) {
			var button = new TouchableButton(options);
			button.id = this.touchableAreas.push( button);
			this.touchableAreasCount++;
			this.boundingSet( options);
		},

		addTouchableArea: function() {},

		loadButtons: function( side ) {
			var buttons = this.options[ side ].buttons;
			for( var i = 0, j = buttons.length; i < j; i++ ) {
				if( !buttons[i] || typeof buttons[i].offset === 'undefined' ) continue;
				var posX = this.getPositionX( side);
				var posY = this.getPositionY( side);
				buttons[i].x = posX + this.getPixels( buttons[i].offset.x, 'y');
				buttons[i].y = posY + this.getPixels( buttons[i].offset.y, 'y');
				this.addButton( buttons[i]);
			}
		},

		loadDPad: function( side ) {
			var dpad = this.options[ side ].dpad || {};
			// Centered value is at this.options[ side ].position
			var posX = this.getPositionX( side);
			var posY = this.getPositionY( side);
			// If they have all 4 directions, add a circle to the center for looks
			if( dpad.up && dpad.left && dpad.down && dpad.right ) {
				var options = {
					x: posX,
					y: posY,
					radius: dpad.right.height
				};
				var center = new TouchableCircle( options);
				this.touchableAreas.push( center);
				this.touchableAreasCount++;
			}

			var halfLeftHeight = this.getPixels(dpad.left.height, 'y') / 2;
			var halfUpWidth = this.getPixels(dpad.up.width, 'y') / 2;
			// Up arrow
			if( !dpad.up ) {
				dpad.up.x = posX - halfUpWidth;
				dpad.up.y = posY - this.getPixels(dpad.up.height, 'y') - halfLeftHeight;
				dpad.up.direction = 'up';
				this.addTouchableDirection( dpad.up);
			}

			// Left arrow
			if( !dpad.left ) {
				dpad.left.x = posX - this.getPixels(dpad.left.width, 'y') - halfUpWidth;
				dpad.left.y = posY - halfLeftHeight;
				dpad.left.direction = 'left';
				this.addTouchableDirection( dpad.left);
			}

			// Down arrow
			if( !dpad.down ) {
				dpad.down.x = posX - this.getPixels(dpad.down.width, 'y') / 2;
				dpad.down.y = posY + halfLeftHeight;
				dpad.down.direction = 'down';
				this.addTouchableDirection( dpad.down);
			}

			// Right arrow
			if( !dpad.right ) {
				dpad.right.x = posX + halfUpWidth;
				dpad.right.y = posY - this.getPixels(dpad.right.height, 'y') / 2;
				dpad.right.direction = 'right';
				this.addTouchableDirection( dpad.right);
			}
		},

		loadJoystick: function( side ) {
			var joystick = this.options[ side ].joystick;
			joystick.x = this.getPositionX( side);
			joystick.y = this.getPositionY( side);
			this.addJoystick( joystick);
		},

		/**
		 * Used for resizing. Currently is just an alias for loadSide
		 */
		reloadSide: function( side ) { this.loadSide( side); },

		loadSide: function( side ) {
			var o = this.options[ side ];
			if( o.type === 'dpad' ) this.loadDPad( side);
			else if( o.type === 'joystick' ) this.loadJoystick( side);
			else if( o.type === 'buttons' ) this.loadButtons( side);
		},

		/**
		 * Normalize touch positions by the left and top offsets
		 * @param {int} x
		 */
		normalizeTouchPositionX: function( x ) {
			return ( x - this.offsetX ) * this.pixelRatio;
		},

		/**
		 * Normalize touch positions by the left and top offsets
		 * @param {int} y
		 */
		normalizeTouchPositionY: function( y ) {
			return ( y - this.offsetY ) * this.pixelRatio;
		},

		/**
		 * Returns the x position when given # of pixels from right
		 * (based on canvas size)
		 * @param {int} right
		 */
		getXFromRight: function( right ) { return this.canvas.width - right; },

		/**
		 * Returns the y position when given # of pixels from bottom
		 * (based on canvas size)
		 * @param {int} right
		 */
		getYFromBottom: function( bottom ) { return this.canvas.height - bottom; },

		/**
		 * Grabs the x position of either the left or right side/controls
		 * @param {string} side - 'left', 'right'
		 */
		getPositionX: function( side ) {
			var position = this.options[side].position;
			return typeof position.left !== 'undefined' ?
				this.getPixels(position.left, 'x') :
				this.getXFromRight(this.getPixels(position.right, 'x'));
		},

		/**
		 * Grabs the y position of either the left or right side/controls
		 * @param {string} side - 'left', 'right'
		 */
		getPositionY: function( side ) {
			var position = this.options[side].position;
			return typeof position.top !== 'undefined' ?
				this.getPixels(position.top, 'y') :
				this.getYFromBottom(this.getPixels(position.bottom, 'y'));
		},

		/**
		 * Processes the info for each touchableArea
		 */
		renderAreas: function() {
			for( var i = 0, j = this.touchableAreasCount; i < j; i++ ) {
				var area = this.touchableAreas[ i ];
				if( typeof area === 'undefined' ) continue;
				area.draw();
				// Go through all touches to see if any hit this area
				var touched = false;
				for( var k = 0, l = this.touches.length; k < l; k++ ) {
					var touch = this.touches[ k ];
					if( typeof touch === 'undefined' ) continue;
					var x = this.normalizeTouchPositionX(touch.clientX),
						y = this.normalizeTouchPositionY(touch.clientY);
					// Check that it's in the bounding box/circle
					if( area.check(x, y) && !touched) touched = this.touches[k];
				}

				if( touched ) {
					if( !area.active ) area.touchStartWrapper(touched);
					area.touchMoveWrapper(touched);
				} else if( area.active ) area.touchEndWrapper(touched);
			}
		},

		render: function() {
			var bound = this.bound;
			if( ! this.paused || ! this.performanceFriendly ){
				this.ctx.clearRect(
					bound.left,
					bound.top,
					bound.right - bound.left,
					bound.bottom - bound.top
				);
			}

			// Draw feedback for when screen is being touched
			// When no touch events are happening,
			// this enables 'paused' mode, which skips running this.
			// This isn't run at all in performanceFriendly mode
			if( ! this.paused && ! this.performanceFriendly ) {
				var cacheId = 'touch-circle';
				var cached = this.cachedSprites[ cacheId ];
				var radius = this.options.touchRadius;
				if( ! cached && radius ) {
					var subCanvas = document.createElement('canvas');
					var ctx = subCanvas.getContext('2d');
					subCanvas.width = 2 * radius;
					subCanvas.height = 2 * radius;

					var center = radius;
					var gradient = ctx.createRadialGradient(
						center,
						center,
						1,
						center,
						center,
						center
					);

					gradient.addColorStop(0, 'rgba( 200, 200, 200, 1 )');
					gradient.addColorStop(1, 'rgba( 200, 200, 200, 0 )');
					ctx.beginPath();
					ctx.fillStyle = gradient;
					ctx.arc(center, center, center, 0, PI2, false);
					ctx.fill();

					cached = GameController.cachedSprites[ cacheId ] = subCanvas;
				}
				// Draw the current touch positions if any
				for( var i = 0, j = this.touches.length; i < j; i++ ) {
					var touch = this.touches[ i ];
					if( typeof touch === 'undefined' ) continue;
					var x = this.normalizeTouchPositionX(touch.clientX),
						y = this.normalizeTouchPositionY(touch.clientY);
					if( x - radius > this.bound.left &&
						x + radius < this.bound.right &&
						y - radius > this.bound.top &&
						y + radius < this.bound.bottom
						){
						this.ctx.drawImage(cached, x - radius, y - radius);
					}
				}
			}

			// Render if the game isn't paused, or we're not in  performanceFriendly
			// mode (running when not paused keeps the semi-transparent gradients
			// looking better for some reason)
			// Process all the info for each touchable area
			if( !this.paused || !this.performanceFriendly ) this.renderAreas();
			requestAnimationFrame(this.renderWrapper);
		},
		/**
		 * So we can keep scope, and don't have to create a new obj every
		 * requestAnimationFrame (bad for garbage collection)
		 */
		renderWrapper: function() { GameController.render(); },
	};

	/**
	 * Superclass for touchable stuff
	 */
	var TouchableArea = ( function() {
		function TouchableArea(){ }
		// Called when this direction is being touched
		TouchableArea.prototype.touchStart = null;
		// Called when this direction is being moved
		TouchableArea.prototype.touchMove = null;
		// Called when this direction is no longer being touched
		TouchableArea.prototype.touchEnd = null;
		TouchableArea.prototype.type = 'area';
		TouchableArea.prototype.id = false;
		TouchableArea.prototype.active = false;

		/**
		 * Sets the user-specified callback for this direction being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchStart = function( callback ) {
			this.touchStart = callback;
		};

		/**
		 * Called when this direction is no longer touched
		 */
		TouchableArea.prototype.touchStartWrapper = function() {
			// Fire the user specified callback
			if( this.touchStart ) this.touchStart();
			// Mark this direction as active
			this.active = true;
		};

		/**
		 * Sets the user-specified callback for this direction
		 * no longer being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchMove = function( callback ) {
			this.touchMove = callback;
		};

		/**
		 * Called when this direction is moved. Make sure it's actually changed
		 * before passing to developer
		 */
		TouchableArea.prototype.lastPosX = 0;
		TouchableArea.prototype.lastPosY = 0;
		TouchableArea.prototype.touchMoveWrapper = function( e ) {
			// Fire the user specified callback
			if( this.touchMove && (
				e.clientX !== TouchableArea.prototype.lastPosX ||
				e.clientY !== TouchableArea.prototype.lastPosY)
				){
				this.touchMove();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
			}
			// Mark this direction as active
			this.active = true;
		};

		/**
		 * Sets the user-specified callback for this direction
		 * no longer being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchEnd = function( callback ) {
			this.touchEnd = callback;
		};

		/**
		 * Called when this direction is first touched
		 */
		TouchableArea.prototype.touchEndWrapper = function() {
			// Fire the user specified callback
			if( this.touchEnd ) this.touchEnd();
			// Mark this direction as inactive
			this.active = false;
			GameController.render();
		};

		return TouchableArea;
	} )();

	var TouchableDirection = ( function( __super ) {
		function TouchableDirection( options ) {
			for( var i in options ) {
				if( i === 'x' ) this[i] = GameController.getPixels(options[i], 'x');
				else if( i === 'y' || i === 'height' || i === 'width' )
					this[i] = GameController.getPixels(options[i], 'y');
				else this[i] = options[i];
			}
			this.draw();
		}
		__extends( TouchableDirection, __super);

		TouchableDirection.prototype.type = 'direction';

		/**
		 * Checks if the touch is within the bounds of this direction
		 */
		TouchableDirection.prototype.check = function( touchX, touchY ) {
			var halfR = GameController.options.touchRadius / 2;
			return (Math.abs(touchX - this.x) < halfR ||
				touchX > this.x ) && // left
				(Math.abs(touchX - this.x - this.width) < halfR || // right
					touchX < this.x + this.width) &&
				(Math.abs(touchY - this.y) < halfR || touchY > this.y ) && // top
				(Math.abs(touchY - this.y - this.height) < halfR || // bottom
					touchY < this.y + this.height);
		};

		TouchableDirection.prototype.draw = function() {
			var gradient;
			var cacheId = this.type + '' + this.id + '' + this.active;
			var cached = GameController.cachedSprites[ cacheId ];
			if( ! cached ) {
				var subCanvas = document.createElement('canvas');
				var ctx = subCanvas.getContext( '2d');
				subCanvas.width = this.width + 2 * this.stroke;
				subCanvas.height = this.height + 2 * this.stroke;

				var opacity = this.opacity || 0.9;

				// Direction currently being touched
				if( ! this.active ) opacity *= 0.5;

				switch( this.direction ) {
					case 'up':
						gradient = ctx.createLinearGradient( 0, 0, 0, this.height);
						gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (opacity * 0.5) + ')');
						gradient.addColorStop(1, 'rgba(0, 0, 0, ' + opacity + ')');
						break;
					case 'left':
						gradient = ctx.createLinearGradient( 0, 0, this.width, 0);
						gradient.addColorStop(0, 'rgba(0, 0, 0, ' + (opacity * 0.5) + ')');
						gradient.addColorStop(1, 'rgba(0, 0, 0, ' + opacity + ')');
						break;
					case 'right':
						gradient = ctx.createLinearGradient( 0, 0, this.width, 0);
						gradient.addColorStop(0, 'rgba(0, 0, 0, ' + opacity + ')');
						gradient.addColorStop(1, 'rgba(0, 0, 0, ' + (opacity * 0.5) + ')');
						break;
					default:
					case 'down':
						gradient = ctx.createLinearGradient( 0, 0, 0, this.height);
						gradient.addColorStop(0, 'rgba(0, 0, 0, ' + opacity + ')');
						gradient.addColorStop(1, 'rgba(0, 0, 0, ' + (opacity * 0.5 ) + ')');
				}
				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, this.width, this.height);
				ctx.lineWidth = this.stroke;
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
				ctx.strokeRect(0, 0, this.width, this.height);
				cached = GameController.cachedSprites[ cacheId ] = subCanvas;
			}

			GameController.ctx.drawImage(cached, this.x, this.y);
		};

		return TouchableDirection;
	} )( TouchableArea);

	var TouchableButton = ( function( __super ) {

		//x, y, radius, backgroundColor )
		function TouchableButton( options ) {
			for( var i in options ) {
				if( i === 'x' ) this[i] = GameController.getPixels( options[i], 'x');
				else if( i === 'y' || i === 'radius' ){
					this[i] = GameController.getPixels(options[i], 'y');
				} else this[i] = options[i];
			}
			this.draw();
		}
		__extends( TouchableButton, __super);

		TouchableButton.prototype.type = 'button';

		/**
		 * Checks if the touch is within the bounds of this direction
		 */
		TouchableButton.prototype.check = function( touchX, touchY ) {
			var radius = this.radius + GameController.options.touchRadius / 2;
			return Math.abs(touchX - this.x) < radius &&
				Math.abs(touchY - this.y) < radius;
		};

		TouchableButton.prototype.draw = function() {
			var cacheId = this.type + '' + this.id + '' + this.active,
				cached = GameController.cachedSprites[ cacheId ],
				r = this.radius;
			if( ! cached ){
				var subCanvas = document.createElement('canvas');
				var ctx = subCanvas.getContext( '2d');
				ctx.lineWidth = this.stroke;
				subCanvas.width = subCanvas.height = 2 * (r + ctx.lineWidth);

				var gradient = ctx.createRadialGradient(r, r, 1, r, r, r);
				var textShadowColor;
				switch( this.backgroundColor ) {
					case 'blue':
						gradient.addColorStop(0, 'rgba(123, 181, 197, 0.6)');
						gradient.addColorStop(1, '#105a78');
						textShadowColor = '#0A4861';
						break;
					case 'green':
						gradient.addColorStop(0, 'rgba(29, 201, 36, 0.6)');
						gradient.addColorStop(1, '#107814');
						textShadowColor = '#085C0B';
						break;
					case 'red':
						gradient.addColorStop(0, 'rgba(165, 34, 34, 0.6)');
						gradient.addColorStop(1, '#520101');
						textShadowColor = '#330000';
						break;
					case 'yellow':
						gradient.addColorStop(0, 'rgba(219, 217, 59, 0.6)');
						gradient.addColorStop(1, '#E8E10E');
						textShadowColor = '#BDB600';
						break;
					default:
					case 'white':
						gradient.addColorStop(0, 'rgba( 255,255,255,.3 )');
						gradient.addColorStop(1, '#eee');
						break;
				}

				if( this.active ) ctx.fillStyle = textShadowColor;
				else ctx.fillStyle = gradient;

				ctx.strokeStyle = textShadowColor;
				ctx.beginPath();
				//ctx.arc( this.x, this.y, r, 0 , PI2, false);
				var halfW = subCanvas.width / 2;
				ctx.arc(halfW, halfW, r, 0 , PI2, false);
				ctx.fill();
				ctx.stroke();

				if( this.label ) {
					// Text Shadow
					var fontSize = this.fontSize || subCanvas.height * 0.35,
						halfH = subCanvas.height / 2;
					ctx.fillStyle = textShadowColor;
					ctx.font = 'bold ' + fontSize + 'px Verdana';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(this.label, halfH + 2, halfH + 2);

					ctx.fillStyle = this.fontColor;
					ctx.fillText(this.label, halfH, halfH);
				}

				cached = GameController.cachedSprites[ cacheId ] = subCanvas;
			}

			GameController.ctx.drawImage( cached, this.x, this.y);
		};

		return TouchableButton;
	} )( TouchableArea);

	var TouchableJoystick = ( function( __super ) {
		function TouchableJoystick( options ) {
			for( var i in options ) this[i] = options[i];
			this.currentX = this.currentX || this.x;
			this.currentY = this.currentY || this.y;
		}
		__extends( TouchableJoystick, __super);

		TouchableJoystick.prototype.type = 'joystick';

		/**
		 * Checks if the touch is within the bounds of this direction
		 */
		TouchableJoystick.prototype.check = function( touchX, touchY ) {
			var edge = this.radius +
				GameController.getPixels(GameController.options.touchRadius) / 2;
			return Math.abs(touchX - this.x) < edge &&
				Math.abs(touchY - this.y) < edge;
		};

		/**
		 * details for the joystick move event, stored here so we're not
		 * constantly creating new objs for garbage. The object has params:
		 * dx - the number of pixels the current joystick center is from
		 * the base center in x direction
		 * dy - the number of pixels the current joystick center is from
		 * the base center in y direction
		 * max - the maximum number of pixels dx or dy can be
		 * normalizedX - a number between -1 and 1 relating to how far
		 * left or right the joystick is
		 * normalizedY - a number between -1 and 1 relating to how far
		 * up or down the joystick is
		 */
		TouchableJoystick.prototype.moveDetails = {};

		/**
		 * Called when this joystick is moved
		 */
		TouchableJoystick.prototype.touchMoveWrapper = function( e ) {
			this.currentX = GameController.normalizeTouchPositionX(e.clientX);
			this.currentY = GameController.normalizeTouchPositionY(e.clientY);

			// Fire the user specified callback
			if( this.touchMove &&
				this.moveDetails.dx !== this.currentX - this.x &&
				this.moveDetails.dy !== this.y - this.currentY
				){
				// reverse so right is positive
				this.moveDetails.dx = this.currentX - this.x;
				this.moveDetails.dy = this.y - this.currentY;
				this.moveDetails.max =
					this.radius + GameController.options.touchRadius / 2;
				this.moveDetails.normalizedX =
					this.moveDetails.dx / this.moveDetails.max;
				this.moveDetails.normalizedY =
					this.moveDetails.dy / this.moveDetails.max;
				this.touchMove(this.moveDetails);
			}

			// Mark this direction as inactive
			this.active = true;
		};

		TouchableJoystick.prototype.draw = function() {
			if( ! this.id ) return false;
			var gradient, ctx,
				cacheId = this.type + '' + this.id + '' + this.active,
				cached = GameController.cachedSprites[ cacheId ],
				r = this.radius;
			if( ! cached ) {
				var subCanvas = document.createElement('canvas');
				this.stroke = this.stroke || 2;
				subCanvas.width = subCanvas.height =
					2 * (this.radius + GameController.options.touchRadius + this.stroke);

				ctx = subCanvas.getContext( '2d');
				ctx.lineWidth = this.stroke;
				// Direction currently being touched
				if( this.active ) {
					gradient = ctx.createRadialGradient( 0, 0, 1, 0, 0, r);
					gradient.addColorStop(0, 'rgba( 200,200,200,.5 )');
					gradient.addColorStop(1, 'rgba( 200,200,200,.9 )');
					ctx.strokeStyle = '#000';
				} else {
					// STYLING FOR BUTTONS
					gradient = ctx.createRadialGradient( 0, 0, 1, 0, 0, r);
					gradient.addColorStop(0, 'rgba( 200,200,200,.2 )');
					gradient.addColorStop(1, 'rgba( 200,200,200,.4 )');
					ctx.strokeStyle = 'rgba( 0,0,0,.4 )';
				}
				ctx.fillStyle = gradient;
				// Actual joystick part that is being moved
				ctx.beginPath();
				ctx.arc(r, r, r, 0 , PI2, false);
				ctx.fill();
				ctx.stroke();
				cached = GameController.cachedSprites[ cacheId ] = subCanvas;
			}

			// Draw the base that stays static
			ctx = GameController.ctx;
			ctx.fillStyle = '#444';
			ctx.beginPath();
			ctx.arc(this.x, this.y, r * 0.7, 0 , PI2, false);
			ctx.fill();
			ctx.stroke();
			ctx.drawImage(cached, this.currentX - r, this.currentY - r);
		};

		return TouchableJoystick;
	} )( TouchableArea);


	var TouchableCircle = ( function( __super ) {
		function TouchableCircle( options ) {
			for( var i in options ) {
				if( i === 'x' ) this[i] = GameController.getPixels( options[i], 'x');
				else if( i === 'y' || i === 'radius' ){
					this[i] = GameController.getPixels(options[i], 'y');
				} else this[i] = options[i];
			}
			this.draw();
		}

		__extends( TouchableCircle, __super);

		/**
		 * No touch for this fella
		 */
		TouchableCircle.prototype.check = function(){ return false; };

		TouchableCircle.prototype.draw = function() {
			// STYLING FOR BUTTONS
			GameController.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			// Actual joystick part that is being moved
			GameController.ctx.beginPath();
			GameController.ctx.arc(this.x, this.y, this.radius, 0 , PI2, false);
			GameController.ctx.fill();
		};

		return TouchableCircle;
	} )( TouchableArea);

	/**
	 * Shim for requestAnimationFrame
	 */
	(function() {
	  if (typeof module !== 'undefined') return;
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		requestAnimationFrame = window.requestAnimationFrame;
		cancelAnimationFrame = window.cancelAnimationFrame;
		for( var x = 0; x < vendors.length && !requestAnimationFrame; ++x ){
			requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
				window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!requestAnimationFrame){
			requestAnimationFrame = function(callback) {
				var currTime = Date.now();
				var timeToCall = Math.max(10, 16 - currTime + lastTime);
				lastTime = currTime + timeToCall;
				return window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
			};
		}

		if (!cancelAnimationFrame){
			cancelAnimationFrame = function(id){ clearTimeout( id); };
		}
	}());
})(typeof module !== 'undefined' ? module.exports : window);
