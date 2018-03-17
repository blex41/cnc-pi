/********************************************************
 * CNCController.js
 *
 * Written by https://github.com/blex41
 *
 * Part of the cnc-pi project:
 * https://github.com/blex41/cnc-pi
 *
 * Free to use without limitations
 *
 * This modules acts as an abstraction layer for a CNC machine.
 * 
 * It relies on the MotorController module available here:
 * https://github.com/blex41/cnc-pi/blob/master/MotorController.js
 * 
 ********************************************************/
const Motor = require('./MotorController.js');

module.exports = (options) => {
	const self = {
		/*
		 * Default parameters
		 */
		name: 'noname', // Name of the CNC instance for debugging
		logs: true,     // Enable logs

		/*
		 * Internal variables
		 */
		axes: ['x', 'y', 'z'],
		x: {},
		y: {},
		z: {},

		/*
		 * Checks parameters and initializes every motor
		 */
		init: () => {
			Object.assign(self, options);
			self.log('Initializing');

			return Promise.all(
				self.axes.map((axis) => {
					if (self[axis].pins instanceof Array) {
						self[axis].motor = Motor({name: axis, ...self[axis]});
						self[axis].position = 0;
						return self[axis].motor.init();
					}
					return false;
				})
			).then(() => self.log('Done initializing'));
		},

		/*
		 * Moves the CNC to the given coordinates
		 * @param {array} positions - coordinates of the x, y and z axis
		 */
		move: (positions) => {
			self.log(`Moving to ${positions.toString()}`);
			const promises = [];

			self.axes.forEach((axis, i) => {
				if (typeof self[axis].motor === 'undefined') {
					return false;
				}
				const distance = positions[i] - self[axis].position;
				if (distance > 0) {
					promises.push(self[axis].motor.forward(distance));
				} else if (distance < 0) {
					promises.push(self[axis].motor.backward(-distance));
				}
				self[axis].position = positions[i];
			});

			return Promise.all(promises)
			.then(() => self);
		},

		/*
		 * Traces a series of straight lines in the 3D space
		 * @param {array} path - an array of arrays ([x, y, z] positions)
		 */
		trace: (path) => {
			if (path.length == 0) {
				return Promise.resolve(self);
			}
			return self.move(path.shift())
			.then(() => self.trace(path));
		},

		/*
		 * Outputs a message if logs are enabled
		 * @param {string} msg - the message to display
		 */
		log: (msg) => {
			if (!self.logs) {
				return Promise.resolve(self);
			}
			console.log(`CNC "${self.name}": ${msg}`);
			return Promise.resolve(self);
		}
	};

	return self;
};
