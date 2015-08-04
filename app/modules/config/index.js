(function (module) {

	'use strict';
	
	var fs = require('fs');
	var path = require('path');
	
	var config = null;
	
	module.get = function(){

		if(config === null){
			var fullPath = path.resolve(__dirname, '../../config.json');
			var text = fs.readFileSync(fullPath, {encoding: 'utf8'});
			config = JSON.parse(text);
		}
		
		return config;
		
	};


} (module.exports));