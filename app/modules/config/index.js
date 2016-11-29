/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const path = require('path');

let config = null;

module.get = function () {

	if (config === null) {
		config = require(path.resolve(__dirname, '../../config.js'));
	}

	return config;
};