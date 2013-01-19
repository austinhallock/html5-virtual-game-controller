/**
 * Not entirely meant to be open-sourced, but left un-obfuscated for curious eyes... 
 */

( function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
									 || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
 
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());


var height = 300;


// Sprite offsets
var spriteSheetImage = new Image(); // src is set on dom load
spriteSheetImage.width = window.innerWidth / 5;
spriteSheetImage.height = spriteSheetImage.width / 2;
var spriteSheet = { width: spriteSheetImage.width, height: spriteSheetImage.height };
spriteSheet.width = spriteSheet.width - ( spriteSheet.width % 6 ); // Make multiple of six to floor() everything
spriteSheet.height = spriteSheet.height - ( spriteSheet.height % 3 ); // Make multiple of three to floor() everything
var sprites = {
	fall: { x: 0, y: 0 },
	jump: { x: spriteSheet.width * ( 1 / 6 ), y: 0 },
	up: { x: spriteSheet.width * ( 2 / 6 ), y: 0 },
	upLeft: { x: spriteSheet.width * ( 3 / 6 ), y: 0 },
	upRight: { x: spriteSheet.width * ( 4 / 6 ), y: 0 },
	somethingRight: { x: spriteSheet.width * ( 5 / 6 ), y: 0 },
	somethingLeft: { x: 0, y: spriteSheet.height * ( 1 / 3 ) },
	right: { x: spriteSheet.width * ( 1 / 6 ), y: spriteSheet.height * ( 1 / 3 ) },
	left: { x: spriteSheet.width * ( 2 / 6 ), y: spriteSheet.height * ( 1 / 3 ) },
	jumpLeft: { x: spriteSheet.width * ( 3 / 6 ), y: spriteSheet.height * ( 1 / 3 ) },
	jumpRight: { x: spriteSheet.width * ( 4 / 6 ), y: spriteSheet.height * ( 1 / 3 ) },
	fallRight: { x: spriteSheet.width * ( 5 / 6 ), y: spriteSheet.height * ( 1 / 3 ) },
	fallLeft: { x: 0, y: spriteSheet.height * ( 2 / 3 ) },
	walkRight1: { x: spriteSheet.width * ( 1 / 6 ), y: spriteSheet.height * ( 2 / 3 ) },
	walkRight2: { x: spriteSheet.width * ( 2 / 6 ), y: spriteSheet.height * ( 2 / 3 ) },
	walkLeft1: { x: spriteSheet.width * ( 3 / 6 ), y: spriteSheet.height * ( 2 / 3 ) },
	walkLeft2: { x: spriteSheet.width * ( 4 / 6 ), y: spriteSheet.height * ( 2 / 3 ) },
	stand: { x: spriteSheet.width * ( 5 / 6 ), y: spriteSheet.height * ( 2 / 3 ) }
};

var Keys = {
	up: false,
	down: false,
	left: false,
	right: false
};
var KeyMap = {
	38: 'up',
	87: 'up', // w
	40: 'down',
	83: 'down', // s
	37: 'left',
	65: 'left', // a
	39: 'right',
	68: 'right' // d
}

$( window ).keydown( function( event ) {
	Keys[ KeyMap[ event.which ] ] = true;
} );
$( window ).keyup( function( event ) {
	Keys[ KeyMap[ event.which ] ] = false;
} );


var HomeGame = {
	
	canvas: null,
	ctx: null,
	
	lastTime: new Date().getTime(),
	
	signupJumps: 0,
	
	MAX_VELOCITY: 32,
	GRAVITY: 2.8,
	
	start: function() {
		
		Player.start();
		
		
		// For scaling up/down sizes & speeds
		this.scale = ( window.innerWidth / 980 );
		this.MAX_VELOCITY = this.MAX_VELOCITY * HomeGame.scale;
		

		this.render();
	},
	
	render: function() {
		var currentTime = new Date().getTime();
		var dt = currentTime - this.lastTime;
		this.dt = dt;
		
		var ctx = this.ctx;
		
		this.lastTime = currentTime;
		if( !paused )
		{
			
			Player.draw();
			
			Player.move( dt );
		}
		
		window.requestAnimationFrame( function() { HomeGame.render() } );
	}
};


var Player = {
	
	canvas: null,
	ctx: null,
	
	state: 'stand', // for animations
	landed: false,
	jumping: false,
	bouncing: false,
	walkStance: 1, // walk stage 1 or 2 if walking
	walkStanceChanged: 0,
	
	width: Math.round( 100 * spriteSheet.width / 6 ) / 100,
	collideWidth: 0.6 * Math.round( 100 * spriteSheet.width / 6 ) / 100, // How wide we want to make the collision object
	height: Math.round( 100 * spriteSheet.height / 3 ) / 100,
	
	x: 20,
	y: 0,
	
	textBubble: '',
	
	velocity: {
		x: 0,
		y: 0
	},
	
	acceleration: {
		x: 0,
		y: HomeGame.GRAVITY
	},
	
	start: function() {
		this.canvas = document.createElement( 'canvas' );
		this.canvas.id = 'player-canvas';
		var mastHead = document.getElementById( 'masthead' );
		this.canvas.width = mastHead.offsetWidth;
		this.canvas.height = mastHead.offsetHeight;
		document.getElementById( 'canvas-holder' ).appendChild( this.canvas );
		this.ctx = this.canvas.getContext( '2d' );
		
		GameController.init( {
			
		} );
		
		this.textBubble = "Hi there!";
		var _this = this;
		clearTimeout( this.changeTextTimeout );
		this.changeTextTimeout = setTimeout( function() {
			_this.textBubble = "You can move me with WASD!";
			clearTimeout( this.changeTextTimeout );
			_this.changeTextTimeout = setTimeout( function() {
				_this.textBubble = "";
			}, 4000 );
		}, 2500 );
	},
	
	getState: function() {
		if( this.bouncing && this.velocity.x > 0 )
			this.state = 'jumpRight';
		else if( this.bouncing && this.velocity.x < 0 )
			this.state = 'jumpLeft';
		else if( this.bouncing || this.jumping )
			this.state = 'jump';
		else if( this.velocity.x > 0 && this.velocity.y > 0 )
			this.state = 'fallRight';
		else if( this.velocity.x < 0 && this.velocity.y > 0 )
			this.state = 'fallLeft';
			
		else if( this.velocity.x > 0 && this.velocity.y < 0 )
			this.state = 'upRight';
		else if( this.velocity.x < 0 && this.velocity.y < 0 )
			this.state = 'upLeft';
			
		else if( this.velocity.x > 0 )
		{
			if( HomeGame.lastTime - this.walkStanceChanged > 200 )
			{
				this.walkStance = ( this.walkStance == 1 ) ? 2 : 1;
				this.walkStanceChanged = HomeGame.lastTime;
			}
			this.state = 'walkRight' + this.walkStance;
		}
		else if( this.velocity.x < 0 )
		{
			if( HomeGame.lastTime - this.walkStanceChanged > 200 )
			{
				this.walkStance = ( this.walkStance == 1 ) ? 2 : 1;
				this.walkStanceChanged = HomeGame.lastTime;
			}
			this.state = 'walkLeft' + this.walkStance;
		}
		
		else if( this.velocity.y < 0 )
			this.state = 'up';
		else if( this.velocity.y > 0 )
			this.state = 'fall';
		
		else
			this.state = 'stand';
	},
	
	
	
	move: function( dt ) {
		dt /= 100;
				
		// Left / right movement
		if( Keys.right && !this.bouncing )
			this.velocity.x = 17 * HomeGame.scale;
		else if( Keys.left && !this.bouncing )
			this.velocity.x = -17 * HomeGame.scale;
		else
			this.velocity.x = 0;
			
		// Jump
		if( Keys.up && ( this.landed || this.bouncing ) )
		{
			this.jumping = true; // for jump animation
			var _this = this;
			setTimeout( function() {
				_this.jumping = false;
				_this.velocity.y = -30; // Not scaled up since we don't scale the y axis
				_this.bouncing = false;
				_this.landed = false;
			}, 100 )
		}
			
		this.getState();
		
		// Horizontal movement
		var newX = this.x + this.velocity.x * dt;
		if( newX + this.width > 0 && newX < window.innerWidth )
			this.x = newX;
		else if( newX + this.width <= 0 )
			this.x = HomeGame.canvas.width - this.width;
		else
			this.x = 0;
		
		
		// Vertical movement
		var newY = this.y + this.velocity.y * dt;

		if( this.top >= 0 && this.bottom <= height  )
		{
			this.landed = false;

			this.velocity.y += this.acceleration.y * dt;
			if( this.velocity.y > HomeGame.MAX_VELOCITY )
				this.velocity.y = HomeGame.MAX_VELOCITY;
			
			this.y = newY;
		}
		else if( this.top < 0 && this.velocity.y < 0 ) // hitting top of page & going up
		{
			this.velocity.y = 0;
			this.y = 0;
		}
		else if( this.velocity.y > 0 ) // if still 'falling'
		{
			this.velocity.y = 0;
			
			if( newY < height - this.height )
				this.y = HomeGame.canvas.height - this.height; // bottom of page
		
			this.landed = true;
		}
		
		this.top = this.y
		this.bottom = this.height + this.top;
		this.left = this.x;
		this.right = this.x + this.collideWidth;
	},
	
	draw: function() {
		if( this.ctx )
		{
			var sprite = sprites[ this.state ];
			this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
			this.ctx.drawImage( spriteSheet, sprite.x, sprite.y, this.width, this.height, this.x, this.y, this.width, this.height );
			
			if( this.textBubble && this.top > 0 )
			{
				var fontSize = 12;
				this.ctx.font = fontSize + 'px Helvetica, verdana, arial';
				var size = this.ctx.measureText( Player.textBubble );
				size.height = fontSize;
				this.ctx.fillStyle = '#000';
				//this.ctx.fillRect( this.right, this.y - 0.9 * size.height, size.width * 1.4, size.height * 1.4 );
				var padding = 10;
				roundRect( this.ctx, this.right + padding / 2, this.y - size.height, size.width + 2 * padding, size.height + 2 * padding, 5, true, true );
				this.ctx.fillStyle = '#fff';
				this.ctx.fillText( this.textBubble, this.right + 3 * padding / 2, this.y + padding );
			}
		}
	}
};

// Any boxes on the screen that can be walked on
var Box = ( function() {
	function Box( id, x, y, width, height )
	{
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.left = x;
		this.right = x + width;
		this.top = y;
		this.bottom = y + height;
	}
	Box.prototype.checkCollidesWithPlayer = function() {
		if( Player.right >= this.left && Player.left <= this.right && Player.bottom >= this.top && Player.bottom <= this.bottom && Player.top <= this.bottom )
			return true;
	};
	
	return Box;
	
} )();
$( function() {

	spriteSheetImage.src = 'astronaut.svg';
	
	// SVG is tossed in a canvas so the clipping uses the scaled down versoin
	spriteSheetImage.onload = function() {
		spriteSheet = document.createElement( 'canvas' );
		spriteSheet.width = spriteSheetImage.width;
		spriteSheet.height = spriteSheetImage.height;
		spriteSheet.ctx = spriteSheet.getContext( '2d' );
		spriteSheet.ctx.drawImage( spriteSheetImage, 0, 0, spriteSheet.width, spriteSheet.height );
		
		// Start the game...
		HomeGame.start();
	};
} );


// Remove starts for linux - looks bad?
if (navigator.userAgent.match(/linux.*chrome/i) || navigator.userAgent.match(/Macintosh(.*?)5\.1\.(0|1|2|3|4) Safari/i)) document.getElementsByClassName('masthead')[0].style.backgroundImage='none';

// pause animation while scrolling for smoother effect
var paused = false;
var timeout = null;
var scrollID = 0;
var timeoutFunction = function( oldScrollID ) {
	if( scrollID != oldScrollID )
		return; // onscroll has been called again
	else
	{
		window.clearTimeout(timeout);
		paused = false;
	}
	timeout = null;
}
window.onscroll = function() {
	scrollID++;
	paused = true;
	if( timeout )
	{
		window.clearTimeout(timeout);
	}
	timeout = window.setTimeout( function(){ timeoutFunction(scrollID); }, 300 );
}

// Props http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" )
		stroke = true;
	if (typeof radius === "undefined")
		radius = 5;

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke)
		ctx.stroke();
	if (fill)
		ctx.fill();
}