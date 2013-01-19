/**
 * TODO: Better performing option 
 */

var __slice = [].slice;
var __hasProp = {}.hasOwnProperty;
var __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

var GameController = {
	
	options: {},
	
	touchableAreas: [],
	
	touches: [],
	
	paused: false,
	
	init: function( options ) {
		
		// Don't do anything if there's no touch support
		if( ! 'ontouchstart' in document.documentElement )
			return; // TODO: get mouse support in for demoing - just have them use chrome touch stuff

		console.log( "INIT" );
		
		this.options = options || {};
		
		
		// DEFAULTS TODO
		
		// 60 px radius touch zone
		options.touchRadius = 45;
		
		options.left = { 
			type: 'dpad', 
			position: { left: 150, bottom: 100 }, 
			dpad: {
				up: {
					width: 50,
					height: 100
				},
				left: {
					width: 100,
					height: 50
				},
				down: {
					width: 50,
					height: 100
				},
				right: {
					width: 100,
					height: 50
				}
			}
		};
		options.right = { 
			type: 'buttons', 
			position: { right: 150, bottom: 100 }, 
			buttons: [
				/* TODO: 6 options for bg colors: blue, red, green, yellow, black, white */
				{ offset: { x: -60, y: 0 }, label: 'a', radius: 30, backgroundColor: 'blue' },
				{ offset: { x: 0, y: -60 }, label: 'b', radius: 30, backgroundColor: 'green' },
				{ offset: { x: 60, y: 0 }, label: 'c', radius: 30, backgroundColor: 'red' },
				{ offset: { x: 0, y: 60 }, label: 'd', radius: 30, backgroundColor: 'yellow' }
			]
		};
		
		// Grab the canvas if one wasn't passed
		if( !options.canvas || !document.getElementById( options.canvas ) )
		{
			options.canvas = document.getElementsByTagName( 'canvas' )[0];
		}
		else
		{
			// TODO: don't call twice
			options.canvas = document.getElementById( options.canvas );
		}
		
		options.ctx = options.canvas.getContext( '2d' );
		
		// Create a canvas that goes directly on top of the game canvas
		this.createOverlayCanvas();
	},
	
	createOverlayCanvas: function() {
		this.canvas = document.createElement( 'canvas' );
		
		// Scale to same size as original canvas
		this.canvas.width = this.options.canvas.width;
		this.canvas.height = this.options.canvas.height;
		
		this.canvas.style.position = 'absolute';
		this.canvas.style.left = this.options.canvas.offsetLeft + 'px';
		this.canvas.style.top = this.options.canvas.offsetTop + 'px';
		
		// TODO: position correctly
		document.getElementsByTagName( 'body' )[0].appendChild( this.canvas );
		this.ctx = this.canvas.getContext( '2d' );
		
		
		// Set the touch events for this new canvas
		this.setTouchEvents();
		
		// Load in the initial UI elements
		this.loadSide( 'left' );
		this.loadSide( 'right' );
		
		console.log( 'wait' );
		
		// Starts up the rendering / drawing
		this.render();
	},
	
	/**
	 * Simulates a key press
	 * @param {string} eventName - 'down', 'up'
	 * @param {char} character
	 */
	simulateKeyEvent: function( eventName, keyCode ) {
		
		/*
		var keyboardEvent = document.createEvent( 'KeyboardEvent' );
		var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
		console.log( character );
		keyboardEvent[initMethod]( 'keydown', true, true, window, 0, 0, 0, 0, 0, 68 ); 
		document.dispatchEvent( keyboardEvent );
		*/
		

		// TODO: Jqueryless version
		var press = jQuery.Event( 'key' + eventName );
		press.ctrlKey = false;
		press.which = keyCode;
		$( document ).trigger( press );
	},
	
	setTouchEvents: function() {
		var _this = this;
		this.canvas.addEventListener( 'touchstart', function( e ) {

			if( _this.paused )
			{			
				_this.paused = false;
				_this.render(); // start up the rendering again
			}
				
			e.preventDefault();
						
			_this.touches = e.touches;

		} );
		this.canvas.addEventListener( 'touchend', function( e ) {
			console.log( 'end' );
			
			e.preventDefault();
			
			_this.touches = e.touches;
			
			if( !e.touches || e.touches.length == 0 )
			{
				console.log( 'pausing' );
				// Draw once more to remove the touch area
				_this.render();
				_this.paused = true;
			}
		} );
		this.canvas.addEventListener( 'touchmove', function( e ) {
			console.log( 'move' );
			
			e.preventDefault();
			
			_this.touches = e.touches;
		} );
	},
	
	/**
	 * Adds the area to a list of touchable areas, draws
	 * @param {int} x
	 * @param {int} y
	 * @param {int} width
	 * @param {int} height
	 * TODO
	 */
	addTouchableDirection: function( x, y, width, height, direction, touchStart, touchEnd ) {
		
		var direction = new TouchableDirection( x, y, width, height, direction );
		
		direction.setTouchStart( touchStart );
		direction.setTouchEnd( touchEnd );
		
		this.touchableAreas.push( direction );
	},
	
	/**
	 * Adds the circular area to a list of touchable areas, draws
	 * @param {int} x
	 * @param {int} y
	 * @param {int} width
	 * @param {int} height
	 * TODO
	 * TODO: Make params an options object
	 */
	addButton: function( options ) { //x, y, radius, backgroundColor, touchStart, touchEnd ) {
		
		var button = new TouchableButton( x, y, radius, backgroundColor );
		
		button.setTouchStart( touchStart );
		button.setTouchEnd( touchEnd );
		
		this.touchableAreas.push( button );
	},
	
	addTouchableArea: function( check, callback ) {
	},
	
	loadButtons: function( side ) {
		var buttons = this.options[ side ].buttons;
		
		

		var _this = this;
		for( var i = 0, j = buttons.length; i < j; i++ )
		{
			var posX = this.getPositionX( side );
			var posY = this.getPositionY( side );
			this.addButton(
				posX + buttons[i].offset.x,
				posY + buttons[i].offset.y,
				buttons[i].radius, // TODO (radius)
				buttons[i].backgroundColor,
				function() { // touchstart
					_this.simulateKeyEvent( 'press', 38 );
					_this.simulateKeyEvent( 'down', 38 );
				},
				function() { // touchend
					_this.simulateKeyEvent( 'up', 38 );
				}
			);
		}
	},
	
	loadDPad: function( side ) {
		var dpad = this.options[ side ].dpad;
		
		// TODO: let this be an option
		this.ctx.fillStyle = '#000000';
		
		// Centered value is at this.options[ side ].position
		
		var _this = this;
		
		var posX = this.getPositionX( side );
		var posY = this.getPositionY( side );
		
		// Up arrow
		this.addTouchableDirection(
			posX - dpad.up.width / 2, 
			posY - ( dpad.up.height + dpad.left.height / 2 ), 
			dpad.up.width, 
			dpad.up.height,
			'up',
			function() { // touchstart
				_this.simulateKeyEvent( 'press', 38 );
				_this.simulateKeyEvent( 'down', 38 );
			},
			function() { // touchend
				_this.simulateKeyEvent( 'up', 38 );
			}
		);
		// Left arrow
		this.addTouchableDirection(
			posX - ( dpad.left.width + dpad.up.width / 2 ), 
			posY - dpad.left.height / 2, 
			dpad.left.width, 
			dpad.left.height,
			'left',
			function() { // touchstart
				_this.simulateKeyEvent( 'press', 37 );
				_this.simulateKeyEvent( 'down', 37 );
			},
			function() { // touchend
				_this.simulateKeyEvent( 'up', 37 );
			}
		);
		// Down arrow
		this.addTouchableDirection(
			posX - dpad.down.width / 2, 
			posY + ( dpad.left.height / 2 ), 
			dpad.down.width, 
			dpad.down.height,
			'down',
			function() { // touchstart
				_this.simulateKeyEvent( 'press', 40 );
				_this.simulateKeyEvent( 'down', 40 );
			},
			function() { // touchend
				_this.simulateKeyEvent( 'up', 40 );
			}
		);
		// Right arrow
		this.addTouchableDirection(
			posX + ( dpad.up.width / 2 ), 
			posY - dpad.right.height / 2, 
			dpad.right.width, 
			dpad.right.height,
			'right',
			function() { // touchstart
				_this.simulateKeyEvent( 'press', 39 );
				_this.simulateKeyEvent( 'down', 39 );
			},
			function() { // touchend
				_this.simulateKeyEvent( 'up', 39 );
			}
		);
		
	},
	
	loadJoystick: function( side ) {
		var joystick = this.options[ side ].joystick;
		
		// TODO: let this be an option
		this.ctx.fillStyle = '#000000';
		
		// Centered value is at this.options[ side ].position
		
		// Left arrow
		this.ctx.fillRect( this.options[ side ].position.x, this.options[ side ].position.y, 100, 100 );
	},
	
	loadSide: function( side ) {
		// TODO: turn into loop (types = ['dpad', 'joystick', 'buttons'])
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
		return x - GameController.options.canvas.offsetLeft;
	},
	
	/**
	 * Normalize touch positions by the left and top offsets
	 * @param {int} y
	 */
	normalizeTouchPositionY: function( y )
	{
		return y - GameController.options.canvas.offsetTop;
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
			return this.options[ side ].position.left;
		else
			return this.getXFromRight( this.options[ side ].position.right );
	},
	
	/**
	 * Grabs the y position of either the left or right side/controls
	 * @param {string} side - 'left', 'right' 
	 */
	getPositionY: function( side ) {
		if( typeof this.options[ side ].position.top !== 'undefined' )
			return this.options[ side ].position.top;
		else
			return this.getYFromBottom( this.options[ side ].position.bottom );
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
			// TODO: make radius an option
			var gradient = this.ctx.createRadialGradient( x, y, 1, x, y, this.options.touchRadius ); // 10 = end radius
			gradient.addColorStop( 0, 'rgba( 200, 200, 200, 1 )' );
			gradient.addColorStop( 1, 'rgba( 200, 200, 200, 0 )' );
			this.ctx.beginPath();
			this.ctx.fillStyle = gradient;
			this.ctx.arc( x, y, this.options.touchRadius, 0 , 2 * Math.PI, false );
			this.ctx.fill();
		}
		
		for( var i = 0, j = this.touchableAreas.length; i < j; i++ )
		{	
			this.touchableAreas[ i ].draw();
			var area = this.touchableAreas[ i ];
				
			// Go through all touches to see if any hit this area
			var touched = false;
			for( var k = 0, l = this.touches.length; k < l; k++ )
			{
				var touch = this.touches[ k ];

				var x = this.normalizeTouchPositionX( touch.clientX ), y = this.normalizeTouchPositionY( touch.clientY );
												
				// TODO: params
				// Check that it's in the bounding box/circle
				if( area.check( x, y ) )
				{
					touched = true;
				}
			}
			if( touched )
			{
				if( !area.active )
					area.touchStart();
				// TODO? maybe getting called too often
				area.touchMove();
			}
			else if( area.active )
			{
				area.touchEnd();
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
	TouchableArea.touchStart = null;
	
	// Called when this direction is being moved
	TouchableArea.touchMove = null;
	
	// Called when this direction is no longer being touched
	TouchableArea.touchEnd = null;
	
	/**
	 * Sets the user-specified callback for this direction being touched
	 * @param {function} callback 
	 */
	TouchableArea.prototype.setTouchStart = function( callback ) {
		this.touchStartCallback = callback;
	};
	
	/**
	 * Called when this direction is no longer touched 
	 */
	TouchableArea.prototype.touchStart = function() {
		// Fire the user specified callback
		if( this.touchStartCallback )
			this.touchStartCallback();
		
		// Mark this direction as active
		this.active = true;
	};
	
	/**
	 * Sets the user-specified callback for this direction no longer being touched
	 * @param {function} callback 
	 */
	TouchableArea.prototype.setTouchMove = function( callback ) {
		this.touchMoveCallback = callback;
	};
	
	/**
	 * Called when this direction is first touched 
	 */
	TouchableArea.prototype.touchMove = function() {
		// Fire the user specified callback
		if( this.touchMoveCallback )
			this.touchMoveCallback();
		
		// Mark this direction as inactive
		this.active = true;
	};
	
	/**
	 * Sets the user-specified callback for this direction no longer being touched
	 * @param {function} callback 
	 */
	TouchableArea.prototype.setTouchEnd = function( callback ) {
		this.touchEndCallback = callback;
	};
	
	/**
	 * Called when this direction is first touched 
	 */
	TouchableArea.prototype.touchEnd = function() {
		console.log( "END" );
		// Fire the user specified callback
		if( this.touchEndCallback )
			this.touchEndCallback();
		
		// Mark this direction as inactive
		this.active = false;
	};
	
	return TouchableArea;
	
} )();

var TouchableDirection = ( function( __super ) {
	__extends( TouchableDirection, __super );
	
	function TouchableDirection( x, y, width, height, direction ) 
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.direction = direction;
		
		this.draw();
	}
	
	/**
	 * Checks if the touch is within the bounds of this direction 
	 */
	TouchableDirection.prototype.check = function( touchX, touchY ) {
		if( 
			( Math.abs( touchX - this.x ) < ( GameController.options.touchRadius / 2 ) || ( touchX > this.x ) ) && // left
			( Math.abs( touchX - ( this.x + this.width ) ) < ( GameController.options.touchRadius / 2 ) || ( touchX < this.x + this.width ) ) && // right
			( Math.abs( touchY - this.y ) < ( GameController.options.touchRadius / 2 ) || ( touchY > this.y ) ) && // top
			( Math.abs( touchY - ( this.y + this.height ) ) < ( GameController.options.touchRadius / 2 ) || ( touchY < this.y + this.height ) ) // bottom
		)
			return true;
			
		return false;
	};
	
	TouchableDirection.prototype.draw = function() {
		if( this.active ) // Direction currently being touched
			GameController.ctx.fillStyle = '#555';		
		else
		{
			switch( this.direction )
			{
				case 'up':
					var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x , this.y + this.height );
					gradient.addColorStop( 0, '#777' );
					gradient.addColorStop( 1, '#000' );   
					break;
				case 'left':
					var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x + this.width, this.y );
					gradient.addColorStop( 0, '#777' );
					gradient.addColorStop( 1, '#000' );   
					break;
				case 'right':
					var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x + this.width, this.y );
					gradient.addColorStop( 0, '#000' );
					gradient.addColorStop( 1, '#777' );  
					break;
				case 'down':
				default:
					var gradient = GameController.ctx.createLinearGradient( this.x, this.y, this.x, this.y + this.height );
					gradient.addColorStop( 0, '#000' );
					gradient.addColorStop( 1, '#777' );   
			}
			GameController.ctx.fillStyle = gradient;
		}
		GameController.ctx.fillRect( this.x, this.y, this.width, this.height );
	};
	
	return TouchableDirection;
} )( TouchableArea );

var TouchableButton = ( function( __super ) {
	__extends( TouchableButton, __super );
	
	function TouchableButton( x, y, radius, backgroundColor )
	{
		console.log( backgroundColor );
		console.log( "BUTTON" + x );
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.backgroundColor = backgroundColor;
		
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
		if( this.active ) // Direction currently being touched
			GameController.ctx.fillStyle = '#555';		
		else
		{
			// STYLING FOR BUTTONS
			// TODO: subcanvas
			var gradient = GameController.ctx.createRadialGradient( this.x, this.y, 1, this.x, this.y, this.radius );
			switch( this.backgroundColor )
			{
				case 'blue':
					gradient.addColorStop( 0, 'rgba(123, 181, 197, 0.6)' );
					gradient.addColorStop( 1, '#105a78' );
					break;
				case 'green':
					gradient.addColorStop( 0, 'rgba(29, 201, 36, 0.6)' );
					gradient.addColorStop( 1, '#107814' );
					break;
				case 'red':
					gradient.addColorStop( 0, 'rgba(165, 34, 34, 0.6)' );
					gradient.addColorStop( 1, '#520101' );
					break;
				case 'yellow':
					gradient.addColorStop( 0, 'rgba(123, 181, 197, 0.6)' );
					gradient.addColorStop( 1, '#105a78' );
					break;
				case 'white':
				default:
					gradient.addColorStop( 0, 'rgba( 255,255,255,.3 )' );
					gradient.addColorStop( 1, '#eee' );
					break;
			}
			GameController.ctx.fillStyle = gradient;
			GameController.ctx.lineWidth = 2;
			GameController.ctx.strokeStyle = '#000';
		}

		GameController.ctx.beginPath();
		GameController.ctx.arc( this.x, this.y, this.radius, 0 , 2 * Math.PI, false );
		GameController.ctx.fill();
		GameController.ctx.stroke();
	};
	
	return TouchableButton;
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