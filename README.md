
# cnc-pi

CNC Controller for Raspberry Pi, using NodeJS

## "It works on my machine"

I only tested this on a Raspberry Pi 2 Model B with this setup:

- [Linux Raspbian 4.9](https://www.raspberrypi.org/downloads/raspbian/)
- [NodeJS 9.8.0](https://nodejs.org/en/)

## Setup

At the root of the project, run:

`npm install`


## What's inside

Inside the `controllers` folder, you'll find two modules:

- MotorController.js
- CNCController.js

At the root, you'll also find a `server.js` which uses Express and provides a web interface to draw stuff and send it to the CNC machine (more info below).

### MotorController.js

This modules acts as an abstraction layer for **DC motors** and **stepper motors** using Raspberry Pi GPIOs. It's a function which returns an instance of a motor. You need to pass an options Object to it.

#### Options

| Option | Type | Mandatory |  Example value | Description |
|-|-|-|-|-|
|`pins`|`Array`|yes|`[15, 11, 13, 12]`|A list of GPIO pin numbers (3 for DC motors, 4 for stepper motors)|
|`gpio`|`rpi-gpio` object|yes| - |A reference to `rpi-gpio`|
|`type`|`String`|no| `"stepper"` |Type of motor: `"stepper"` or "dc"|
|`delay`|`Integer`|no| `5` |Delay between each step (in milliseconds)|
|`name`|`String`|no| `"myMotor"` |Name of the motor, for debugging purposes|
|`logs`|`Boolean`|no| `false` |Whether or not to enable logs|

#### Methods

- **init()**
  Checks parameters and sets every GPIO pin to `DIR_OUT` mode.
- **forward(steps)**
  Rotates the motor in forward direction for a given number of steps.
- **backward(steps)**
  Rotates the motor in backward direction for a given number of steps.

#### Example usage

```javascript
const gpio = require('rpi-gpio');
const Motor = require('./MotorController.js');
// Define the motor
const myMotor = Motor({
	pins: [15, 11, 13, 12],
	gpio: gpio,
	type: 'stepper',
	delay: 5,
	name: 'myMotor',
	logs: 'true'
});

// Initialize it and make it turn
myMotor.init()
.then(m => m.forward(20))
.then(m => m.backward(20));
```

### CNCController.js

This modules acts as an abstraction layer for a CNC machine. It uses the **MotorController** module to create 3 motor instances (x, y, z) and control them in the 3D space. It's a function which returns an instance of a CNC machine. You need to pass an options Object to it.

#### Options

| Option | Type | Mandatory |  Example value | Description |
|-|-|-|-|-|
|`x`|`Object`|yes| *See above* |A set of options to pass to the MotorController for motor X|
|`y`|`Object`|yes| *See above* |A set of options to pass to the MotorController for motor Y|
|`z`|`Object`|yes| *See above* |A set of options to pass to the MotorController for motor Z|
|`name`|`String`|no| `"myMotor"` |Name of the motor, for debugging purposes|
|`logs`|`Boolean`|no| `false` |Whether or not to enable logs|

#### Methods

- **init()**
  Checks parameters and initializes every motor.
- **move(positions)**
  Moves the CNC to the given coordinates. The `positions` parameter should be an Array of integer positions for each motor (e.g. `[5, 10, 0]`)
- **trace(path)**
  Traces a series of straight lines in the 3D space. The `path` parameter should be an Array of *positions* (e.g. `[[0, 0, 0], [5, 10, 0]]`)

#### Example usage

```javascript
const gpio = require('rpi-gpio');
const CNC = require('./CNCController.js');
// Define the CNC
const myCnc = CNC({
	name: 'myCnc',
	x: {
		pins: [15, 11, 13, 12],
		delay: 5,
		type: 'stepper',
		gpio: gpio
	},
	y: {
		pins: [37, 33, 35, 31],
		delay: 5,
		type: 'stepper',
		gpio: gpio
	},
	z: {
		pins: [18, 16, 22],
		delay: 10,
		type: 'dc',
		gpio: gpio
	}
});

// Initialize it and make it draw a path
myCnc.init()
.then(c => c.trace([[0, 0, 0], [5, 10, 0]]));
```

### server.js

This script starts a server on `http://localhost:3000`. It exposes a simple HTML page where you can draw on a canvas, and send the data to the CNC machine.

Make sure you set the correct parameters for your motors and pins, and you should be good to go!

## Example project using 2 CD/DVD drives

**Coming soon**

Here is a YouTube video showing what it looks like: 
<a href="http://www.youtube.com/watch?feature=player_embedded&v=h1t6wFMVYFk
" target="_blank"><img src="http://img.youtube.com/vi/h1t6wFMVYFk/0.jpg" 
alt="Tutorial coming soon" width="800" height="600" border="10" /></a>
