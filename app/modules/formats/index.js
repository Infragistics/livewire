module = module.exports;

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var formats = [];
var config = require(path.resolve(__dirname, '../config')).get();

module.get = function (name) {
	var fullPath = path.resolve(__dirname, './' + name + '.json');
	var format = fs.readFileSync(fullPath, { encoding: 'utf8' });
	return JSON.parse(format);
};

module.getByFileExtension = function (ext) {
	var returnValue = null;
	
	if(ext === undefined) {
		formats.forEach(function (format) {
			if (format.name.toLowerCase() === config.defaultFormat.toLowerCase()) {
				returnValue = format;
			}
		});
	} else {
		formats.forEach(function (format) {
			if (format.extensions.indexOf(ext) !== -1) {
				returnValue = format;
			}
		});
	}
	if (returnValue == null) {
		throw new Error('Format not found. ext: ' + ext);
	}
	return returnValue;
};


module.getAll = function () {
	if (formats.length === 0) {
		var filePaths = fs.readdirSync(__dirname);
		var jsons = _.filter(filePaths, function (file) {
			return _.endsWith(file, '.json');
		});

		jsons.forEach(function (filePath) {
			var name = path.basename(filePath).replace(/.json/, '');
			var format = module.get(name);
			formats.push(format);
		});
	}
	return formats;
};

module.getAll();