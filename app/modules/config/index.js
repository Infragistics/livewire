/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const { remote } = require('electron');

let config = null;

var docsConfig = require('./docsConfig');

module.exports.get = function () {

	if (config === null) {
		config = require(path.resolve(__dirname, '../../config.js'));
		config.userDataPath = remote.app.getPath('userData');
		docsConfig.init(config);
	}

	return config;
};