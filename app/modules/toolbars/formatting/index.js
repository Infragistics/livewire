/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

var
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../../messenger')),
	isEnabled = false;

$(' button[data-channel="menu"]').click(function () {
	var $button, topic;
	
	if(isEnabled){
		$button = $(this);
		topic = $button.data('topic');
		messenger.publish.menu(topic);
		$button.blur();
	}
});

$('#formatting-toolbar button[data-channel="format"]').click(function () {
	var $button, shortcut;
	
	if(isEnabled){
		$button = $(this);
		shortcut = $button.data('shortcut');
		messenger.publish.format('wrapText', { shortcut: shortcut });
		$button.blur();
	}
});

var handlers = {
	enable: function(){
		isEnabled = true;
	}
};

messenger.subscribe.file('fileOpened', handlers.enable);