HTML5 Virtual Game Controller
=============================

About
-----
**Author: [Clay.io](http://clay.io/development-tools) - Tools for HTML5 game developers**

This library is for easy integration of a virtual game controller overlay for HTML5 games. With HTML5, it's easy to
get your game to run on touch-screen devices like phones and tablets, but user-input is a whole different story. With
just the accelerometer and touch to work with, it makes it hard to have a game's input pair well with the desktop version.

The HTML5 Virtual Game Controller aims to alleviate the problem with a super-simple, yet customizable option for adding a
touch-based gamepad to your game when touch is enabled. The controller will *only* be shown if touch is available on the device.

**Watch a demo video [here](http://www.youtube.com/watch?v=XQKRYMjrp2Q), or [try the game](http://clay.io/plugins/controller/index.html) out** (if you have a touch-capable device).
In Chrome, you can enable fake touch events with: ctrl+shift+i, then click the settings icon on the bottom right.
Select the "Overrides" tab, and check "Emulate touch events" at the bottom). The demo game isn't the most efficient on
mobile devices in it's current state, but iOS Safari should handle it. The game mentions to press the space key, the "B" button
has been mapped to that functionality. This was a game that *completely* didn't work with touch prior to this library.

As of January 20th 2013, tested in Chrome, Firefox, IE10, and Mobile Safari.

Easy Setup
----------
```
<script type='text/javascript' src='/path/to/gamecontroller.js'></script>
<script type='text/javascript'>
    $( function() { // jQuery *not* required - just be to call onload
		GameController.init();
	} );
</script>
```

If you are using node.js and something like [browserify](http://browserify.org/), you can install with `npm install game-controller`

If you are still in the process of choosing an HTML5 Game Engine, see [this list - complete with reviews and details of popular HTML5 Game Engines](http://html5gameengine.com).

Advanced Options
----------------
The entire customization for this library is done through the options object that is passed as a parameter to the `init` method.
This can be as simple as passing nothing, are as advanced as passing dozens of options.

```
var options = {};
GameController.init( options );
```

Below is a list of the possible options, and what each does.

* **touchRadius** {int} - a faint glow for feedback will show when the screen is touched. Set this as the length of the radius of that glow circle in pixels. Set to false if you don't want this help to show
* **forcePerformanceFriendly** {boolean} - the library auto-detects slower devices (phones) and changes a few things to make it not use as much CPU. You can force it to always use the performance-friendly mode by setting this to `true`
* **left** {object} - options for the element you want on the left side of the game
  * **type** {string} - 'dpad', 'buttons', or 'joystick' depending on the mode you want. *Default: 'dpad'*
  * **position** {object} - positioning for this part of the controller
     * **left** {int/string} - the distance from the center point of this part to the left edge of the game's canvas. Can specify integer for number of pixels, and string: 'x%' for positioning relative to the canvas' size. *Default: 13%*
     * **right** {int/string} - same as *left*, just from the right side of the canvas. Only specify one of these two
     * **top** {int/string} - similar to *left* and *right*, just from the top side of the canvas
     * **bottom** {int/string} - same as *top*, just from the bottom side of the canvas. Only specify one of top or bottom. *Default: 22%*
  * **dpad** {object} - options pertaining to the dpad for this section (only has effect if *type* is set to 'dpad'
     * **up** {object} - options pertaining to the up direction of the dpad
         * **width** {int/string} - pixels (int) or percent ('x%') wide
         * **height** {int/string} - pixels (int) or percent ('x%') high
         * **stroke** {int} - thickness of stroke (in pixels)
         * **opacity** {float} - value from 0-1 for how opaque this should be
         * **touchStart** {function} - called when this direction is touched
         * **touchEnd** {function} - called when this direction is no longer touched
         * **touchMove** {function} - called on any movement while player is touching object
     * **right** {object} - the same object properties from *up* are available for *right*
     * **down** {object} - the same object properties from *up* are available for *down*
     * **left** {object} - the same object properties from *up* are available for *left*
  * **buttons** [] - array of button objects for this section (only has effect if type is set to 'buttons'
     * **button object**
         * **offset** {object} - offset for each button from the center position
             * **x** {int/string} - pixels (int) or percent ('x%') from center on x-axis
             * **y** {int/string} - pixels (int) or percent ('x%') from center on x-axis
         * **label** {string} - short label for this button
         * **radius** {int} - button radius in pixels
         * **stroke** {int} - stroke thickness in pixels
         * **backgroundColor** {string} - currently you have 5 options for this since gradients are used: 'blue', 'green', 'yellow', 'red', 'white'
         * **fontColor** {string} - hex code
         * **fontSize** {int} - size of the label font in pixels
         * **touchStart** {function} - called when this direction is touched
         * **touchEnd** {function} - called when this direction is no longer touched
         * **touchMove** {function} - called on any movement while player is touching object
  * **joystick** {object} - options pertaining to the dpad for this section (only has effect if *type* is set to 'dpad'
     * **radius** {int} joystick button radius in pixels
     * **touchStart** {function} - called when this direction is touched
     * **touchEnd** {function} - called when this direction is no longer touched
     * **touchMove** {function} - called on any movement while player is touching object. An object with the following properties is passed as the only parameter:
         * **dx** {float} - the distance on x axis the joystick is from the center
         * **dy** {float} - the distance on y axis the joystick is from the center
         * **max** {int} - the max distance the joystick can get from the center
         * **normalizedX** {float} - ranges from -1 to 1 where -1 is as far left as possible, and 1 is as far right as possible. 0 is center
         * **normalizedY** - ranges from -1 to 1 where -1 is as far up as possible, and 1 is as far down as possible. 0 is center

Examples
--------
**DPad on left, 2 buttons on right**
```
GameController.init();
```
![GamePad 1](http://clay.io/images/controller/1.png)

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
![GamePad 2](http://clay.io/images/controller/2.png)

**Joysticks on both sides**
```
GameController.init( {
    left: {
        type: 'joystick',
        position: { left: '15%', bottom: '15%' },
        joystick: {
          touchStart: function() {
            console.log('touch starts');
          },
          touchEnd: function() {
            console.log('touch ends');
          },
          touchMove: function( details ) {
            console.log( details.dx );
            console.log( details.dy );
            console.log( details.max );
            console.log( details.normalizedX );
            console.log( details.normalizedY );
          }
        }
    },
    right: {
        type: 'joystick',
        position: { right: '15%', bottom: '15%' } ,
        joystick: {
          touchMove: function( details ) {
             // Do something...
           }
       }
    }
});
```
![GamePad 3](http://clay.io/images/controller/3.png)

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
![GamePad 4](http://clay.io/images/controller/4.png)

These examples are just the start - the customization allows for quite a bit to be done,
and of course, the code can always be edited as well.
