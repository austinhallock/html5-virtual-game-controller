/**
 * TODO: Better performing option 
 */
var __slice = [].slice;
var __hasProp = {}.hasOwnProperty;
var __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
// TODO: prettify
/* $.extend functionality */
function extend (src, target) {
	var options, name, copy, copyIsArray, clone,
        i = 1,
        length = 2,
        deep = true;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !typeof target === 'function') {
    	console.log( 'reset' );
    	console.log( target );
        target = {};
    }
    // Only deal with non-null/undefined values
    if (options = src) {
        // Extend the base object
        for (name in options) {
            src = target[name];
            copy = options[name];

            // Prevent never-ending loop
            if (target === copy) {
                continue;
            }
            // Recurse if we're merging plain objects or arrays
            if (deep && copy && (typeof copy == 'object' || (copyIsArray = Object.prototype.toString.call( copy ) === '[object Array]'))) {
                if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && Object.prototype.toString.call( src ) === '[object Array]' ? src : [];

                } else {
                    clone = src && typeof src == 'object' ? src : {};
                }
                // Never move original objects, clone them
                target[name] = extend(clone, copy);

                // Don't bring in undefined values
            } else if (copy !== undefined) {
                target[name] = copy;
            }
        }
    }
    return target;
}
var GameController = {
	
	// Default options
	options: {
		left: { 
			type: 'dpad', 
			position: { left: '13%', bottom: '22%' },
			/*joystick: {
				radius: 60,
				touchMove: function( e ) {
					console.log( e );
				}
			},*/
			dpad: {
				up: {
					width: '7%',
					height: '15%'
				},
				left: {
					width: '15%',
					height: '7%'
				},
				down: {
					width: '7%',
					height: '15%'
				},
				right: {
					width: '15%',
					height: '7%'
				}
			}
		},
		right: { 
			type: 'buttons', 
			position: { right: '15%', bottom: '22%' }, 
			buttons: [
				{ offset: { x: '-13%', y: 0 }, label: 'X', radius: '7%', backgroundColor: 'blue', touchStart: function() {
					GameController.simulateKeyEvent( 'press', 38 );
					GameController.simulateKeyEvent( 'down', 38 );
				}, touchEnd: function() {
					GameController.simulateKeyEvent( 'up', 38 );	
				} },
				{ offset: { x: 0, y: '-11%' }, label: 'Y', radius: '7%', backgroundColor: 'yellow' },
				{ offset: { x: '13%', y: 0 }, label: 'B', radius: '7%', backgroundColor: 'red', touchStart: function() {
					console.log( "SPACE" );
					// TODO: make this not super ubi land exclusive
					GameController.simulateKeyEvent( 'press', 32 );
					GameController.simulateKeyEvent( 'down', 32 );

					GameController.simulateKeyEvent( 'press', 40 );
					GameController.simulateKeyEvent( 'down', 40 );
				}, touchEnd: function() {
					GameController.simulateKeyEvent( 'up', 32 );						
					GameController.simulateKeyEvent( 'up', 40 );
				} },
				{ offset: { x: 0, y: '11%' }, label: 'A', radius: '7%', backgroundColor: 'green', touchStart: function() {
					GameController.simulateKeyEvent( 'press', 38 );
					GameController.simulateKeyEvent( 'down', 38 );
				}, touchEnd: function() {
					GameController.simulateKeyEvent( 'up', 38 );	
				}  }
			]
		},
		touchRadius: 45
	},
	
	// Areas (objects) on the screen that can be touched
	touchableAreas: [],
	
	// Multi-touch
	touches: [],
	
	// Heavy sprites (with gradients) are cached as a canvas to improve performance
	cachedSprites: {},
	
	paused: false,
	
	init: function( options ) {
		
		// Don't do anything if there's no touch support
		if( ! 'ontouchstart' in document.documentElement )
			return;

		// Merge default options and specified options
		extend( options, this.options );	

		
		// Grab the canvas if one wasn't passed
		var ele;
		if( !this.options.canvas || !( ele = document.getElementById( this.options.canvas ) ) )
		{
			this.options.canvas = document.getElementsByTagName( 'canvas' )[0];
		}
		else if( ele )
		{
			this.options.canvas = ele;
		}
		
		this.options.ctx = this.options.canvas.getContext( '2d' );
		
		// Create a canvas that goes directly on top of the game canvas
		this.createOverlayCanvas();
	},
	
	/**
	 * @param {string} side - 'left', 'right' (Optional) 
	 */
	/*
	getJoystickDeltaX: function( side ) {
		if( typeof side === 'undefined' || ( side !== 'left' && side !== 'right' ) )
		{
			// No side is specified, find which side has a joystick
			if( this.options[ 'left' ].type === 'joystick' )
				side = 'left';
			else if( this.options[ 'right' ].type === 'joystick' )
				side = 'right'
		}
		if( side && this.options[ side ].joystick. )
			return false;
		else
			
	}
	
	getJoystickDeltaY: function( side ) {
		
	}
	
	getJoystickDeltaMax: function( side ) {
		
	}
	*/
	
	createOverlayCanvas: function() {
		this.canvas = document.createElement( 'canvas' );
		
		// Scale to same size as original canvas
		this.resize( true );
		
		document.getElementsByTagName( 'body' )[0].appendChild( this.canvas );
		this.ctx = this.canvas.getContext( '2d' );
		
		var _this = this;
		window.addEventListener( 'resize', function() {
			// Wait for any other events to finish
			setTimeout( function() { GameController.resize.call( _this ); }, 1 );
		} );
		
		
		// Set the touch events for this new canvas
		this.setTouchEvents();
		
		// Load in the initial UI elements
		this.loadSide( 'left' );
		this.loadSide( 'right' );
		
		// Starts up the rendering / drawing
		this.render();
	},
	
	resize: function( firstTime ) {
		// Scale to same size as original canvas
		this.canvas.width = this.options.canvas.width;
		this.canvas.height = this.options.canvas.height;
		
		// Get in on this retina action
		if( this.options.canvas.style.width && this.options.canvas.style.width ) 
		{
			this.canvas.style.width = this.options.canvas.style.width;
			this.canvas.style.height = this.options.canvas.style.height;
		}
		
		this.canvas.style.position = 'absolute';
		this.canvas.style.left = this.options.canvas.offsetLeft + 'px';
		this.canvas.style.top = this.options.canvas.offsetTop + 'px';
		this.canvas.setAttribute( 'style', this.canvas.getAttribute( 'style' ) +' -ms-touch-action: none;' );
		
		if( !firstTime )
		{
			// Remove all current buttons
			this.touchableAreas = [];
			// Reload in the initial UI elements
			this.reloadSide( 'left' );
			this.reloadSide( 'right' );
		}
	},
	
	/**
	 * Returns the scaled pixels. Given the value passed
	 * @param {int/string} value - either an integer for # of pixels, or 'x%' for relative
	 * @param {char} axis - x, y
	 */
	getPixels: function( value, axis )
	{
		if( typeof value === 'number' )
		{
			return value;
		}
		else // a percentage
		{
			if( axis == 'x' )
				return ( parseInt( value ) / 100 ) * this.canvas.width;
			else
				return ( parseInt( value ) / 100 ) * this.canvas.height;
		}
	},
	
	/**
	 * Simulates a key press
	 * @param {string} eventName - 'down', 'up'
	 * @param {char} character
	 */
	simulateKeyEvent: function( eventName, keyCode ) {
		var oEvent = document.createEvent( 'KeyboardEvent' );

		// Chromium Hack
		Object.defineProperty( oEvent, 'keyCode', {
			get : function() {
				return this.keyCodeVal;
			}
		} );	 
		Object.defineProperty( oEvent, 'which', {
			get : function() {
				return this.keyCodeVal;
			}
		} );
			
		if( oEvent.initKeyboardEvent )
		{
			oEvent.initKeyboardEvent( 'key' + eventName, true, true, document.defaultView, false, false, false, false, keyCode, keyCode );
		}
		else
		{
			oEvent.initKeyEvent( 'key' + eventName, true, true, document.defaultView, false, false, false, false, keyCode, 0 );
		}
	
		oEvent.keyCodeVal = keyCode;
	
		document.dispatchEvent( oEvent );
	},
	
	setTouchEvents: function() {
		var _this = this;
		var touchStart = function( e ) {
			console.log( e );
			if( _this.paused )
			{			
				_this.paused = false;
				_this.render(); // start up the rendering again
			}
				
			e.preventDefault();
						
			// Microsoft always has to have their own stuff...
			if( window.navigator.msPointerEnabled && e.currentPoint && e.currentPoint.rawPosition )
			{
				// TODO: fix IE10 being gay and not passing back pos
				_this.touches[ e.pointerId ] = { clientX: e.currentPoint.rawPosition.x, clientY: e.currentPoint.rawPosition.y };
			}
			else
			{
				_this.touches = e.touches || [];
			}
		};
		this.canvas.addEventListener( 'touchstart', touchStart );
		
		var touchEnd = function( e ) {			
			e.preventDefault();
		
			if( window.navigator.msPointerEnabled )
			{
				delete _this.touches[ e.pointerId ];
			}
			else
			{	
				_this.touches = e.touches || [];
			}
			
			if( !e.touches || e.touches.length == 0 )
			{
				console.log( 'pausing' );
				// Draw once more to remove the touch area
				_this.render();
				_this.paused = true;
			}
		};
		this.canvas.addEventListener( 'touchend', touchEnd );

		var touchMove = function( e ) {
			e.preventDefault();
			
			_this.touches = e.touches || [];
		};
		this.canvas.addEventListener( 'touchmove', touchMove );
		
		if( window.navigator.msPointerEnabled )
		{
			this.canvas.addEventListener( 'MSPointerDown', touchStart );
			this.canvas.addEventListener( 'MSPointerUp', touchEnd );
			this.canvas.addEventListener( 'MSPointerMove', touchMove );
		}
	},
	
	/**
	 * Adds the area to a list of touchable areas, draws
	 * @param {object} options with properties: x, y, width, height, touchStart, touchEnd, touchMove
	 */
	addTouchableDirection: function( options ) {
		
		var direction = new TouchableDirection( options );
		
		this.touchableAreas.push( direction );
	},
	
	/**
	 * Adds the circular area to a list of touchable areas, draws	
	 * @param {object} options with properties: x, y, width, height, touchStart, touchEnd, touchMove
	 */
	addJoystick: function( options ) { //x, y, radius, backgroundColor, touchStart, touchEnd ) {
		
		var joystick = new TouchableJoystick( options );
		
		joystick.id = this.touchableAreas.push( joystick );
		
		console.log( joystick );
	},
	
	/**
	 * Adds the circular area to a list of touchable areas, draws	 
	 * @param {object} options with properties: x, y, width, height, touchStart, touchEnd, touchMove
	 */
	addButton: function( options ) { //x, y, radius, backgroundColor, touchStart, touchEnd ) {
		
		var button = new TouchableButton( options );
		
		this.touchableAreas.push( button );
	},
	
	addTouchableArea: function( check, callback ) {
	},
	
	loadButtons: function( side ) {
		var buttons = this.options[ side ].buttons;
		console.log( buttons );
		var _this = this;
		for( var i = 0, j = buttons.length; i < j; i++ )
		{
			console.log( "ADDB" );
			var posX = this.getPositionX( side );
			var posY = this.getPositionY( side );
						
			buttons[i].x = posX + this.getPixels( buttons[i].offset.x, 'y' );
			buttons[i].y = posY + this.getPixels( buttons[i].offset.y, 'y' );
			// DEFAULTS (TODO)
			/*buttons[i].touchStart = function() { // touchstart
				_this.simulateKeyEvent( 'press', 38 );
				_this.simulateKeyEvent( 'down', 38 );
			};
			buttons[i].touchEnd = function() { // touchend
				_this.simulateKeyEvent( 'up', 38 );
			};
			*/
			this.addButton( buttons[i] );
		}
	},
	
	loadDPad: function( side ) {
		var dpad = this.options[ side ].dpad || {};
		
		// TODO: let this be an option
		this.ctx.fillStyle = '#000000';
		
		// Centered value is at this.options[ side ].position
		
		var _this = this;
		
		var posX = this.getPositionX( side );
		var posY = this.getPositionY( side );
		
		
		// If they have all 4 directions, add a circle to the center for looks
		if( dpad.up && dpad.left && dpad.down && dpad.right )
		{
			var options = {
				x: posX,
				y: posY,
				radius: dpad.right.height // TODO: scale
			}
			var center = new TouchableCircle( options ); 
			this.touchableAreas.push( center );
		}
		
		// Up arrow
		if( dpad.up !== false )
		{
			dpad.up.x = posX - this.getPixels( dpad.up.width, 'y' ) / 2;
			dpad.up.y = posY - ( this.getPixels( dpad.up.height, 'y' ) +  this.getPixels( dpad.left.height, 'y' ) / 2 );
			dpad.up.direction = 'up';
			dpad.up.touchStart = function() { // touchstart
				_this.simulateKeyEvent( 'press', 38 );
				_this.simulateKeyEvent( 'down', 38 );
			};
			dpad.up.touchEnd = function() { // touchend
				_this.simulateKeyEvent( 'up', 38 );
			};
			this.addTouchableDirection( dpad.up );
		}

		// Left arrow
		if( dpad.left !== false )
		{
			dpad.left.x = posX - ( this.getPixels( dpad.left.width, 'y' ) + this.getPixels( dpad.up.width, 'y' ) / 2 );
			dpad.left.y = posY - ( this.getPixels( dpad.left.height, 'y' ) / 2 );
			dpad.left.direction = 'left';
			dpad.left.touchStart = function() { // touchstart
				_this.simulateKeyEvent( 'press', 37 );
				_this.simulateKeyEvent( 'down', 37 );
			};
			dpad.left.touchEnd = function() { // touchend
				_this.simulateKeyEvent( 'up', 37 );
			};
			this.addTouchableDirection( dpad.left );
		}

		// Down arrow
		if( dpad.down !== false )
		{
			dpad.down.x = posX - this.getPixels( dpad.down.width, 'y' ) / 2;
			dpad.down.y = posY + ( this.getPixels( dpad.left.height, 'y' ) / 2 );
			dpad.down.direction = 'down';
			dpad.down.touchStart = function() { // touchstart
				_this.simulateKeyEvent( 'press', 40 );
				_this.simulateKeyEvent( 'down', 40 );
			};
			dpad.down.touchEnd = function() { // touchend
				_this.simulateKeyEvent( 'up', 40 );
			};
			this.addTouchableDirection( dpad.down );
		}
		
		// Right arrow
		if( dpad.right !== false )
		{
			dpad.right.x = posX + ( this.getPixels( dpad.up.width, 'y' ) / 2 );
			dpad.right.y = posY - this.getPixels( dpad.right.height, 'y' ) / 2;
			dpad.right.direction = 'right';
			dpad.right.touchStart = function() { // touchstart
				_this.simulateKeyEvent( 'press', 39 );
				_this.simulateKeyEvent( 'down', 39 );
			};
			dpad.right.touchEnd = function() { // touchend
				_this.simulateKeyEvent( 'up', 39 );
			};
			this.addTouchableDirection( dpad.right );
		}
		
	},
	
	loadJoystick: function( side ) {
		var joystick = this.options[ side ].joystick;
		joystick.x = this.getPositionX( side );
		joystick.y = this.getPositionY( side );
		console.log( joystick );
		this.addJoystick( joystick );
	},
	
	/**
	 * Used for resizing. Currently is just an alias for loadSide
	 */
	reloadSide: function( side ) {
		// Load in new ones
		this.loadSide( side );
	},
	
	loadSide: function( side ) {
		if( this.options[ side ].type === 'dpad' )
		{
			this.loadDPad( side );
		}
		else if( this.options[ side ].type === 'joystick' )
		{
			this.loadJoystick( side );
		}
		else if( this.options[ side ].type === 'buttons' )
		{
			this.loadButtons( side );
		}
	},
	
	/**
	 * Normalize touch positions by the left and top offsets
	 * @param {int} x
	 */
	normalizeTouchPositionX: function( x )
	{
		return ( x - GameController.options.canvas.offsetLeft ) * ( window.devicePixelRatio || 1 );
	},
	
	/**
	 * Normalize touch positions by the left and top offsets
	 * @param {int} y
	 */
	normalizeTouchPositionY: function( y )
	{
		return ( y - GameController.options.canvas.offsetTop ) * ( window.devicePixelRatio || 1 );
	},
	
	/**
	 * Returns the x position when given # of pixels from right (based on canvas size)
	 * @param {int} right 
	 */
	getXFromRight: function( right ) {
		return this.canvas.width - right;
	},
	
	
	/**
	 * Returns the y position when given # of pixels from bottom (based on canvas size)
	 * @param {int} right 
	 */
	getYFromBottom: function( bottom ) {
		return this.canvas.height - bottom;
	},
	
	/**
	 * Grabs the x position of either the left or right side/controls
	 * @param {string} side - 'left', 'right' 
	 */
	getPositionX: function( side ) {
		if( typeof this.options[ side ].position.left !== 'undefined' )
			return this.getPixels( this.options[ side ].position.left, 'x' );
		else
			return this.getXFromRight( this.getPixels( this.options[ side ].position.right, 'x' ) );
	},
	
	/**
	 * Grabs the y position of either the left or right side/controls
	 * @param {string} side - 'left', 'right' 
	 */
	getPositionY: function( side ) {
		if( typeof this.options[ side ].position.top !== 'undefined' )
			return this.getPixels( this.options[ side ].position.top, 'y' );
		else
			return this.getYFromBottom( this.getPixels( this.options[ side ].position.bottom, 'y' ) );
	},
	
	render: function() {
		if( this.paused )
			return;
			
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		
		
		// Draw the current touch positions if any
		for( var i = 0, j = this.touches.length; i < j; i++ )
		{
			var touch = this.touches[ i ];
			var x = this.normalizeTouchPositionX( touch.clientX ), y = this.normalizeTouchPositionY( touch.clientY );

			var gradient = this.ctx.createRadialGradient( x, y, 1, x, y, this.options.touchRadius ); // 10 = end radius
			gradient.addColorStop( 0, 'rgba( 200, 200, 200, 1 )' );
			gradient.addColorStop( 1, 'rgba( 200, 200, 200, 0 )' );
			this.ctx.beginPath();
			this.ctx.fillStyle = gradient;
			this.ctx.arc( x, y, this.options.touchRadius, 0 , 2 * Math.PI, false );
			this.ctx.fill();
		}
		
		var touchMap = {};
		for( var i = 0, j = this.touchableAreas.length; i < j; i++ )
		{	
			this.touchableAreas[ i ].draw();
			var area = this.touchableAreas[ i ];
				
			// Go through all touches to see if any hit this area
			var touched = false;
			var minDistance = 9999, distance; // find the closest touchable
			for( var k = 0, l = this.touches.length; k < l; k++ )
			{
				var touch = this.touches[ k ];

				var x = this.normalizeTouchPositionX( touch.clientX ), y = this.normalizeTouchPositionY( touch.clientY );
												
				// Check that it's in the bounding box/circle
				if( ( distance = area.check( x, y ) ) !== false )
				{
					touchMap[ k ] = area;
				}
				else if( area.active )
				{
					console.log( "END" );
					console.log( area );
					area.touchEndWrapper( touched );
				}
			}
			for( var k in touchMap )
			{
				var area = touchMap[ k ];
				if( !area.active )
					area.touchStartWrapper( this.touches[ k ] );
				area.touchMoveWrapper( this.touches[ k ] );
			}
			
			
			// Start back up the draw function
			this.paused = false;
		}
		
		// TODO: Make this not create a new obj each render (garbage)
		window.requestAnimationFrame( function() { GameController.render() } );
	}
	
}

/**
 * Superclass for touchable stuff 
 */
var TouchableArea = ( function() {
	
	function TouchableArea() 
	{
	}
	
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
	TouchableArea.prototype.touchStartWrapper = function( e ) {
		// Fire the user specified callback
		if( this.touchStart )
			this.touchStart();
		
		// Mark this direction as active
		this.active = true;
	};
	
	/**
	 * Sets the user-specified callback for this direction no longer being touched
	 * @param {function} callback 
	 */
	TouchableArea.prototype.setTouchMove = function( callback ) {
		this.touchMove = callback;
	};
	
	/**
	 * Called when this direction is moved
	 */
	TouchableArea.prototype.touchMoveWrapper = function( e ) {
		// Fire the user specified callback
		if( this.touchMove )
			this.touchMove();
		
		// Mark this direction as inactive
		this.active = true;
	};
	
	/**
	 * Sets the user-specified callback for this direction no longer being touched
	 * @param {function} callback 
	 */
	TouchableArea.prototype.setTouchEnd = function( callback ) {
		this.touchEnd = callback;
	};
	
	/**
	 * Called when this direction is first touched 
	 */
	TouchableArea.prototype.touchEndWrapper = function( e ) {
		console.log( "END" );
		// Fire the user specified callback
		if( this.touchEnd )
			this.touchEnd();
		
		// Mark this direction as inactive
		this.active = false;
		
		GameController.render();
	};
	
	return TouchableArea;
	
} )();

var TouchableDirection = ( function( __super ) {
	__extends( TouchableDirection, __super );
	
	function TouchableDirection( options ) 
	{
		for( var i in options )
		{
			if( i == 'x' )
				this[i] = GameController.getPixels( options[i], 'x' );
			else if( i == 'y' || i == 'height' || i == 'width' )
				this[i] = GameController.getPixels( options[i], 'y' );
			else
				this[i] = options[i];
		}
		
		this.draw();
	}
	
	/**
	 * Checks if the touch is within the bounds of this direction 
	 */
	TouchableDirection.prototype.check = function( touchX, touchY ) {
		var distanceX = 999, distanceY = 999;
		if( ( passX = ( Math.abs( touchX - this.x ) ) ) < ( GameController.options.touchRadius / 2 ) || ( touchX > this.x ) )
		{
			distanceX = passX;
		}
		else
			return false;
		
		if( ( passX = ( Math.abs( touchX - ( this.x + this.width ) ) ) ) < ( GameController.options.touchRadius / 2 ) || ( touchX < this.x + this.width ) )
		{
			if( passX < distanceX )
				distanceX = passX;
		}
		else
			return false;
		
		if( ( passY = ( Math.abs( touchY - this.y ) ) )< ( GameController.options.touchRadius / 2 ) || ( touchY > this.y ) )
		{
			distanceY = passY;
		}
		else
			return false
		
		if( ( passY = ( Math.abs( touchY - ( this.y + this.height ) ) ) ) < ( GameController.options.touchRadius / 2 ) || ( touchY < this.y + this.height ) )
		{
			if( passY < distanceY )
				distanceY = passY;
		}
		else
			return false;
			
		// Passed all checks, let's return how close they are...
		return distanceX * distanceX + distanceY * distanceY;
	};
	
	TouchableDirection.prototype.draw = function() {
		var opacity = this.opacity || 0.9;
		
		if( ! this.active ) // Direction currently being touched
			opacity *= 0.5;
			
		switch( this.direction )
		{
			case 'up':
				var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x , this.y + this.height );
				gradient.addColorStop( 0, 'rgba( 0, 0, 0, ' + ( opacity * 0.5 ) + ' )' );
				gradient.addColorStop( 1, 'rgba( 0, 0, 0, ' + opacity + ' )' );   
				break;
			case 'left':
				var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x + this.width, this.y );
				gradient.addColorStop( 0, 'rgba( 0, 0, 0, ' + ( opacity * 0.5 ) + ' )' );
				gradient.addColorStop( 1, 'rgba( 0, 0, 0, ' + opacity + ' )' );   
				break;
			case 'right':
				var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x + this.width, this.y );
				gradient.addColorStop( 0, 'rgba( 0, 0, 0, ' + opacity + ' )' );
				gradient.addColorStop( 1, 'rgba( 0, 0, 0, ' + ( opacity * 0.5 ) + ' )' );  
				break;
			case 'down':
			default:
				var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x, this.y + this.height );
				gradient.addColorStop( 0, 'rgba( 0, 0, 0, ' + opacity + ' )' );
				gradient.addColorStop( 1, 'rgba( 0, 0, 0, ' + ( opacity * 0.5 ) + ' )' );   
		}
		GameController.ctx.fillStyle = gradient;

		GameController.ctx.fillRect( this.x, this.y, this.width, this.height );
		GameController.lineWidth = 4;
		GameController.ctx.strokeStyle = 'rgba( 255, 255, 255, 0.1 )';
		GameController.ctx.strokeRect( this.x, this.y, this.width, this.height );
	};
	
	return TouchableDirection;
} )( TouchableArea );

var TouchableButton = ( function( __super ) {
	__extends( TouchableButton, __super );
	
	function TouchableButton( options ) //x, y, radius, backgroundColor )
	{
		for( var i in options )
		{
			if( i == 'x' )
				this[i] = GameController.getPixels( options[i], 'x' );
			else if( i == 'x' || i == 'radius' )
				this[i] = GameController.getPixels( options[i], 'y' );
			else
				this[i] = options[i];
		}
		
		this.draw();
	}
	
	/**
	 * Checks if the touch is within the bounds of this direction 
	 */
	TouchableButton.prototype.check = function( touchX, touchY ) {
		if( 
			( Math.abs( touchX - this.x ) < this.radius + ( GameController.options.touchRadius / 2 ) ) &&
			( Math.abs( touchY - this.y ) < this.radius + ( GameController.options.touchRadius / 2 ) )
		)
			return true;
			
		return false;
	};
	
	TouchableButton.prototype.draw = function() {
		// STYLING FOR BUTTONS
		// TODO: subcanvas
		var gradient = GameController.ctx.createRadialGradient( this.x, this.y, 1, this.x, this.y, this.radius );
		var textShadowColor;
		switch( this.backgroundColor )
		{
			case 'blue':
				gradient.addColorStop( 0, 'rgba(123, 181, 197, 0.6)' );
				gradient.addColorStop( 1, '#105a78' );
				textShadowColor = '#0A4861';
				break;
			case 'green':
				gradient.addColorStop( 0, 'rgba(29, 201, 36, 0.6)' );
				gradient.addColorStop( 1, '#107814' );
				textShadowColor = '#085C0B';
				break;
			case 'red':
				gradient.addColorStop( 0, 'rgba(165, 34, 34, 0.6)' );
				gradient.addColorStop( 1, '#520101' );
				textShadowColor = '#330000';
				break;
			case 'yellow': // TODO
				gradient.addColorStop( 0, 'rgba(219, 217, 59, 0.6)' );
				gradient.addColorStop( 1, '#E8E10E' );
				textShadowColor = '#BDB600';
				break;
			case 'white':
			default:
				gradient.addColorStop( 0, 'rgba( 255,255,255,.3 )' );
				gradient.addColorStop( 1, '#eee' );
				break;
		}
			
		if( this.active )			
			GameController.ctx.fillStyle = textShadowColor;
		else	
			GameController.ctx.fillStyle = gradient;
		GameController.ctx.lineWidth = 2;
		GameController.ctx.strokeStyle = textShadowColor;			

		GameController.ctx.beginPath();
		GameController.ctx.arc( this.x, this.y, this.radius, 0 , 2 * Math.PI, false );
		GameController.ctx.fill();
		GameController.ctx.stroke();
		
		
		if( this.label )
		{
			// Text Shadow
			GameController.ctx.fillStyle = textShadowColor;
			GameController.ctx.font = 'bold 24px Verdana'; // TODO: scale
			GameController.ctx.textAlign = 'center';
			GameController.ctx.textBaseline = 'middle';
			GameController.ctx.fillText( this.label, this.x + 2, this.y + 2 );


			GameController.ctx.fillStyle = '#fff'; // TODO option?
			GameController.ctx.font = 'bold 24px Verdana'; // TODO: scale
			GameController.ctx.textAlign = 'center';
			GameController.ctx.textBaseline = 'middle';
			GameController.ctx.fillText( this.label, this.x, this.y );
		}
	};
	
	return TouchableButton;
} )( TouchableArea );

var TouchableJoystick = ( function( __super ) {
	__extends( TouchableJoystick, __super );
	
	function TouchableJoystick( options ) //x, y, radius, backgroundColor )
	{
		for( var i in options )
			this[i] = options[i];
			
		this.currentX = this.currentX || this.x;
		this.currentY = this.currentY || this.y;
	}
	
	TouchableJoystick.prototype.type = 'joystick';
	
	/**
	 * Checks if the touch is within the bounds of this direction 
	 */
	TouchableJoystick.prototype.check = function( touchX, touchY ) {
		if( 
			( Math.abs( touchX - this.x ) < this.radius + ( GameController.options.touchRadius / 2 ) ) &&
			( Math.abs( touchY - this.y ) < this.radius + ( GameController.options.touchRadius / 2 ) )
		)
			return true;
			
		return false;
	};
	
	/**
	 * details for the joystick move event, stored here so we're not constantly creating new objs for garbage. The object has params:
	 * dx - the number of pixels the current joystick center is from the base center in x direction
	 * dy - the number of pixels the current joystick center is from the base center in y direction
	 * max - the maximum number of pixels dx or dy can be
	 * normalizedX - a number between -1 and 1 relating to how far left or right the joystick is
	 * normalizedY - a number between -1 and 1 relating to how far up or down the joystick is
	 */
	TouchableJoystick.prototype.moveDetails = {};
	
	/**
	 * Called when this joystick is moved
	 */
	TouchableJoystick.prototype.touchMoveWrapper = function( e ) {
		this.currentX = GameController.normalizeTouchPositionX( e.clientX );	
		this.currentY = GameController.normalizeTouchPositionY( e.clientY );
		
		// Fire the user specified callback
		if( this.touchMove )
		{
			this.moveDetails.dx = this.currentX - this.x; // reverse so right is positive
			this.moveDetails.dy = this.y - this.currentY;
			this.moveDetails.max = this.radius + ( GameController.options.touchRadius / 2 );
			this.moveDetails.normalizedX = this.moveDetails.dx / this.moveDetails.max;
			this.moveDetails.normalizedY = this.moveDetails.dy / this.moveDetails.max;
				
			this.touchMove( this.moveDetails );
		}
			
		
		// Mark this direction as inactive
		this.active = true;
	};
	
	TouchableJoystick.prototype.draw = function() {
		if( ! this.id ) // wait until id is set
			return false;
			
		var cacheId = this.type + '' + this.id + '' + this.active;
		var cached = GameController.cachedSprites[ cacheId ];
		if( ! cached )
		{
			var subCanvas = document.createElement( 'canvas' );
			subCanvas.width = subCanvas.height = 2 * this.radius;
			
			var ctx = subCanvas.getContext( '2d' );
			ctx.lineWidth = 2;
			if( this.active ) // Direction currently being touched
			{
				var gradient = ctx.createRadialGradient( this.x, this.y, 1, this.x, this.y, this.radius );
				gradient.addColorStop( 0, 'rgba( 200,200,200,.5 )' );
				gradient.addColorStop( 1, 'rgba( 200,200,200,.9 )' );
				ctx.strokeStyle = '#000';
			}	
			else
			{
				// STYLING FOR BUTTONS
				// TODO: subcanvas
				var gradient = ctx.createRadialGradient( this.x, this.y, 1, this.x, this.y, this.radius );
				gradient.addColorStop( 0, 'rgba( 200,200,200,.2 )' );
				gradient.addColorStop( 1, 'rgba( 200,200,200,.4 )' );
				ctx.strokeStyle = 'rgba( 0,0,0,.4 )';
			}
			ctx.fillStyle = gradient;
			// Actual joystick part that is being moved
			ctx.beginPath();
			ctx.arc( this.currentX, this.currentY, this.radius, 0 , 2 * Math.PI, false );
			ctx.fill();
			ctx.stroke();
			
			cached = GameController.cachedSprites[ cacheId ] = subCanvas;
		}
		
		GameController.ctx.drawImage( cached, 0, 0 );
		
		// Draw the base that stays static
		GameController.ctx.beginPath();
		GameController.ctx.arc( this.x, this.y, this.radius * 0.7, 0 , 2 * Math.PI, false );
		GameController.ctx.fill();
		GameController.ctx.stroke();
		
	};
	
	return TouchableJoystick;
} )( TouchableArea );


var TouchableCircle = ( function( __super ) {
	__extends( TouchableCircle, __super );
	
	function TouchableCircle( options )
	{
		for( var i in options )
		{
			if( i == 'x' )
				this[i] = GameController.getPixels( options[i], 'x' );
			else if( i == 'x' || i == 'radius' )
				this[i] = GameController.getPixels( options[i], 'y' );
			else
				this[i] = options[i];
		}

		this.draw();
	}
	
	/**
	 * No touch for this fella 
	 */
	TouchableCircle.prototype.check = function( touchX, touchY ) {
		return false;
	};
	
	TouchableCircle.prototype.draw = function() {

		// STYLING FOR BUTTONS
		// TODO: subcanvas
		GameController.ctx.fillStyle = 'rgba( 0, 0, 0, 0.5 )';
		
		// Actual joystick part that is being moved
		GameController.ctx.beginPath();
		GameController.ctx.arc( this.x, this.y, this.radius, 0 , 2 * Math.PI, false );
		GameController.ctx.fill();

	};
	
	return TouchableCircle;
} )( TouchableArea );

/**
 * Shim for requestAnimationFrame 
 */
( function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x )
	{
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
									 || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if ( !window.requestAnimationFrame )
		window.requestAnimationFrame = function( callback, element ) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback(currTime + timeToCall); }, 
				timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
 
	if ( !window.cancelAnimationFrame )
		window.cancelAnimationFrame = function( id ) {
			clearTimeout( id );
		};
}() );