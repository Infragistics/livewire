/// <reference path="../../../typings/node/node.d.ts"/>

(function(module){
	
	'use strict';
	
	var path = require('path');
	var postal = require(path.resolve(__dirname, '../../bower_components/postal.js/lib/postal.js'));
	
	var channels = {
		menu:			'menu',
		contextMenu:	'contextMenu',
		file: 			'file'
	};
	
	var publish = function(channel, topic, data){
		postal.publish({ channel: channel, topic: topic, data: data });
	};
	
	var subscribe = function(channel, topic, callback){
		postal.subscribe({ channel: channel, topic: topic, callback: callback });
	};
	
	module.publish = {		
		menu: 			function(topic, data){ publish(channels.menu, topic, data); },
		contextMenu:	function(topic, data){ publish(channels.contextMenu, topic, data); },
		file:			function(topic, data){ publish(channels.file, topic, data); }
	};	
	
	module.subscribe = {
		menu:			function(topic, callback){ subscribe(channels.menu, topic, callback); },
		contextMenu:	function(topic, callback){ subscribe(channels.contextMenu, topic, callback); },
		file:			function(topic, callback){ subscribe(channels.file, topic, callback); }
	};
	
}(module.exports));