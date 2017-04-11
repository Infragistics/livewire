/// <reference path="../../../typings/node/node.d.ts"/>

var path = require('path');
var postal = require(path.resolve(__dirname, '../../bower_components/postal.js/lib/postal.js'));

var channels = {
	menu: 'menu',
	contextMenu: 'contextMenu',
	file: 'file',
	text: 'text',
	format: 'format',
	dialog: 'dialog',
	metadata: 'metadata',
    layout: 'layout'
};

var publish = function (channel, topic, data) {
	postal.publish({ channel: channel, topic: topic, data: data });
};

var subscribe = function (channel, topic, callback) {
	return postal.subscribe({ channel: channel, topic: topic, callback: callback });
};

module.exports.publish = {
	menu: function (topic, data) { publish(channels.menu, topic, data); },
	contextMenu: function (topic, data) { publish(channels.contextMenu, topic, data); },
	file: function (topic, data) { publish(channels.file, topic, data); },
	text: function (topic, data) { publish(channels.text, topic, data); },
	format: function (topic, data) { publish(channels.format, topic, data); },
	dialog: function (topic, data) { publish(channels.dialog, topic, data); },
	metadata: function (topic, data) { publish(channels.metadata, topic, data); },
	layout: function (topic, data) { publish(channels.layout, topic, data); }
};

module.exports.subscribe = {
	menu: function (topic, callback) { return subscribe(channels.menu, topic, callback); },
	contextMenu: function (topic, callback) { return subscribe(channels.contextMenu, topic, callback); },
	file: function (topic, callback) { return subscribe(channels.file, topic, callback); },
	text: function (topic, callback) { return subscribe(channels.text, topic, callback); },
	format: function (topic, callback) { return subscribe(channels.format, topic, callback); },
	dialog: function (topic, callback) { return subscribe(channels.dialog, topic, callback); },
	metadata: function (topic, callback) { return subscribe(channels.metadata, topic, callback); },
	layout: function (topic, callback) { return subscribe(channels.layout, topic, callback); }
};

module.exports.unsubscribe = function(subscription){
    postal.unsubscribe(subscription);
};