(function (JSON, module) {

	'use strict';
	
	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');
	
	module.get = function(name){
		var fullPath = path.resolve(__dirname, './' + name + '.json');
		var format = fs.readFileSync(fullPath, {encoding: 'utf8'});
		return JSON.parse(format);
	};
	
	module.getAll = function(callback){
		fs.readdir(__dirname, function(err, filePaths){
			if(err) {
				// todo: some sort of valuable error handling
				console.log(err);
				return;
			}
			
			var jsons = _.filter(filePaths, function(file){
				return _.endsWith(file, '.json');
			}); 
			
			var formats = [];
			
			jsons.forEach(function(filePath){
				var name = path.basename(filePath).replace(/.json/, '');
				var format = module.get(name);
				formats.push(format);
			});
			
			callback(formats);
		});
	};

} (JSON, module.exports));