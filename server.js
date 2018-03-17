/********************************************************
 * server.js
 *
 * Written by https://github.com/blex41
 *
 * Part of the cnc-pi project:
 * https://github.com/blex41/cnc-pi
 *
 * Free to use without limitations
 *
 * This server exposes a web interface for drawing
 * with cnc-pi.
 * 
 * 
 ********************************************************/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const gpio = require('rpi-gpio');

const CNC = require('./controllers/CNCController.js');

const cnc = CNC({
	name: 'myCNC',
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
	},
});


cnc.init()
.then(() => {
	// Serve static files from the public folder
	app.use(express.static('public'));
	// Accept JSON-encoded bodies
	app.use(bodyParser.json());

	app.post('/draw', (req, res) => {
		res.send('Received a drawing');
		const path = req.body.path;
		// Return to original position after drawing
		path.push([0, 0, 1]);
		cnc.trace(path);
	});

	app.listen(3000, () => console.log('CNC server listening on port 3000!'));
});


