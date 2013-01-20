HTML5 Virtual Game Controller
=============================

About
-----
This library is for easy integration of a virtual game controller overlay for HTML5 games. With HTML5, it's easy to 
get your game to run on touch-screen devices like phones and tablets, but user-input is a whole different story. With
just the accelerometer and touch to work with, it makes it hard to have a game's input pair well with the desktop version.

The HTML5 Virtual Game Controller aims to alleviate the problem with a super-simple, yet customizable option for adding a 
touch-based gamepad to your game.

See a demo [here](http://www.youtube.com/watch?v=XQKRYMjrp2Q), or try the game out in Chrome with touch events enabled (ctrl+shift+i,
then click the settings icon on the bottom right. Select the "Overrides" tab, and check "Emulate touch events" at the bottom)

Easy Setup
----------
```
<script type='text/javascript' src='/js/gamecontroller.js'></script>
<script type='text/javascript'>
    $( function() { // jQuery *not* required
		GameController.init();
	} );
</script>
```

Advanced Options
----------------
The entire customization for this library is done through the options object that is passed as a parameter to the `init` method.
This can be as simple as passing nothing, are as advanced as passing dozens of options.

```

```

Below is a list of the possible options, and what each does.

* **touchRadius** {int} - a faint glow for feedback will show when the screen is touched. Set this as the length of the radius of that glow circle in pixels. Set to false if you don't want this help to show
* **left** {object} - options for the element you want on the left side of the game
  * **type** {string} - 'dpad', 'buttons', or 'joystick' depending on the mode you want. *Default: 'dpad'*
  * **position** {object} - positioning for this part of the controller
     * **left** {int/string} - the distance from the center point of this part to the left edge of the game's canvas. Can specify integer for number of pixels, and string: 'x%' for positioning relative to the canvas' size. *Default: 13%*
     * **right** {int/string} - same as *left*, just from the right side of the canvas. Only specify one of these two
     * **top** {int/string} - similar to *left* and *right*, just from the top side of the canvas
     * **bottom** {int/string} - same as *top*, just from the bottom side of the canvas. Only specify one of top or bottom. *Default: 22%*
  * **dpad** {object} - options pertaining to the dpad for this section (only has effect if *type* is set to 'dpad'
     * **up** {object} - options pertaining to the up direction of the dpad
         * **width**
         * **height**
         * **stroke**
         * **opacity**
         * **touchStart**
         * **touchEnd**
         * **touchMove**
     * **right** {object} - the same object properties from *up* are available for *right*
     * **down** {object} - the same object properties from *up* are available for *down*
     * **left** {object} - the same object properties from *up* are available for *left*
  * **buttons** [] - array of button objects for this section (only has effect if type is set to 'buttons'
     * **button object**
         * **offset**
             * **x**
             * **y**
         * **label**
         * **radius**
         * **stroke**
         * **backgroundColor**
         * **fontColor**
         * **fontSize** {int} - size of the label font in pixels
         * **touchStart**
         * **touchEnd**
         * **touchMove**
  * **joystick**
     * **radius**
     * **touchStart**
     * **touchEnd**
     * **touchMove**
Examples
--------
**DPad on left, 2 buttons on right**  
```
GameController.init();
```

**DPad on left, 2 buttons on right**  

**Joystick on left, 1 button on right**  
```
GameController.init( { 
    left: {
        type: 'joystick'
    }, 
    right: { 
        position: { 
            right: '5%' 
        }, 
        type: 'buttons', 
        buttons: [
        { 
            label: 'jump', fontSize: 13, touchStart: function() { 
                // do something 
            } 
        }, 
        false, false, false
        ] 
    }
} );
```
**Joysticks on both sides**  
```
GameController.init( { 
    left: {
        type: 'joystick', 
        position: { left: '15%', bottom: '15%' },
        touchMove: function( details ) {
            console.log( details.dx );
            console.log( details.dy );
            console.log( details.max );
            console.log( details.normalizedX );
            console.log( details.normalizedY );
        }
    }, 
    right: { 
        type: 'joystick', 
        position: { right: '15%', bottom: '15%' } ,
        touchMove: function( details ) {
            // Do something...
        }
    }
});
```

**Two large buttons at bottom**  
```
GameController.init( { 
	left: {
		position: { left: '50%', bottom: '5%' }, 
		dpad: { 
			up: false, 
			down: false, 
			left: { width: '50%', height: '10%' }, 
			right: { width: '50%', height: '10%' } 
		} 
	}, 
	right: false
} );
```

These examples are just the start!