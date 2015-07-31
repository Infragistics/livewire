(function (JSON, module) {

	'use strict';
	
	var fs = require('fs');
	var path = require('path');
	
	module.get = function(name){
		var fullPath = path.resolve(__dirname, './' + name + '.json');
		var grammar = fs.readFileSync(fullPath, {encoding: 'utf8'});
		return JSON.parse(grammar);
	};

} (JSON, module.exports));