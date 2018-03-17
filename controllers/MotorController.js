/********************************************************
 * MotorController.js
 *
 * Written by https://github.com/blex41
 *
 * Part of the cnc-pi project:
 * https://github.com/blex41/cnc-pi
 *
 * Free to use without limitations
 *
 * This modules acts as an abstraction layer for DC motors
 * and stepper motors using Raspberry Pi GPIOs.
 * 
 * It relies on the rpi-gpio module available here:
 * https://www.npmjs.com/package/rpi-gpio
 * 
 ********************************************************/

module.exports = (options) => {
	const self = {
		/*
		 * Default parameters
		 */
		delay: 5,       // Delay between each step (milliseconds)
		name: 'noname', // Name of the motor for debugging
		type: 'dc',     // Motor type ("dc", "stepper")
		logs: true,     // Enable logs

		/*
		 * Internal variables
		 */
		n: 0,           // Current motor step (for stepper motors)
		pinCount: 3,    // Number of pins (3 for dc, 4 for stepper)

		/*
		 * Checks parameters and sets every GPIO pin to DIR_OUT mode
		 */
		init: () => {
			Object.assign(self, options);
			self.log('Initializing');

			if (self.type === 'stepper') {
				self.pinCount = 4;
			}

			if (['dc', 'stepper'].indexOf(self.type) < 0) {
				return self.log('Initialization failed. Motor type must be "dc" or "stepper".');
			}
			if (!self.pins instanceof Array || self.pins.length !== self.pinCount) {
				return self.log(`Initialization failed. ${self.pinCount} GPIO pin numbers must be provided.`);
			}
			if (typeof self.gpio === 'undefined') {
				return self.log('Initialization failed. A rpi-gpio handle must be provided.');
			}

			return Promise.all(
				self.pins.map((pin) => self.initPin(pin))
			).then(() => self.log('Done initializing'));
		},

		/*
		 * Sets a single GPIO pin to DIR_OUT mode
		 * @param {integer} pinNumber
		 */
		initPin: (pinNumber) => {
			return new Promise((resolve, reject) => {
				self.gpio.setup(pinNumber, self.gpio.DIR_OUT, () => {
					resolve(self);
				});
			});
		},

		/*
		 * Applies half a step to the motor (stepper motors only)
		 */
		step: () => {
			switch (self.n) {
				case 0: return self.write([1, 0, 0, 0]);
				case 1: return self.write([1, 1, 0, 0]);
				case 2: return self.write([0, 1, 0, 0]);
				case 3: return self.write([0, 1, 1, 0]);
				case 4: return self.write([0, 0, 1, 0]);
				case 5: return self.write([0, 0, 1, 1]);
				case 6: return self.write([0, 0, 0, 1]);
				case 7: return self.write([1, 0, 0, 1]);
			}
		},

		/*
		 * Writes the provided values to GPIO pins
		 * @param {array} values - an array of integer values
		 */
		write: (values) => {
			return Promise.all(
				self.pins.map((pin, i) => self.writePin(pin, values[i]))
			).then(() => self);
		},

		/*
		 * Writes a value to a GPIO pin
		 * @param {integer} pin - a pin number
		 * @param {integer} value - a value
		 */
		writePin: (pin, value) => {
			return new Promise((resolve, reject) => {
				self.gpio.write(pin, value, () => {
					setTimeout(() => {
						resolve(self);
					}, self.delay);
				});
			});
		},

		/*
		 * Sets all GPIO pins to 0
		 */
		stop: () => {
			self.log('Stop');
			const values = self.pins.map(() => 0);
			return self.write(values);
		},

		/*
		 * Rotates the motor in forward direction
		 * @param {integer} steps - number of steps to perform
		 */
		forward: (steps) => {
			self.log(`Forward`);
			if (steps <= 0) {
				return self.stop();
			}
			// For dc motors
			if (self.type === 'dc') {
				return self.write([0, 1, 1])
				.then(() => {
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							self.stop().then(() => resolve(self));
						}, steps * self.delay);
					});
				});
			}
			// For stepper motors
			self.n = self.n == 7 ? 0 : self.n+1;
			return self.step().then(() => self.forward(steps - 1));
		},

		/*
		 * Rotates the motor in backward direction
		 * @param {integer} steps - number of steps to perform
		 */
		backward: (steps) => {
			self.log(`Backward`);
			if (steps <= 0) {
				return self.stop();
			}
			// For dc motors
			if (self.type === 'dc') {
				return self.write([1, 0, 1])
				.then(() => {
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							self.stop().then(() => resolve(self));
						}, steps * self.delay);
					});
				});
			}
			// For stepper motors
			self.n = self.n == 0 ? 7 : self.n-1;
			return self.step().then(() => self.backward(steps - 1));
		},

		/*
		 * Outputs a message if logs are enabled
		 * @param {string} msg - the message to display
		 */
		log: (msg) => {
			if (!self.logs) {
				return Promise.resolve(self);
			}
			console.log(`${self.type} motor "${self.name}": ${msg}`);
			return Promise.resolve(self);
		}
	};

	return self;
};
