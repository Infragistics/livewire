/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

var
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../../messenger')),
	isEnabled = false;

$('button[data-channel="menu"]').click(function () {
	var $button, topic, commandAlwaysAvailable;
	
	commandAlwaysAvailable = ($(this).data('always-available') === true);
	
	$button = $(this);
	
	if(isEnabled || commandAlwaysAvailable){
		topic = $button.data('topic');
		messenger.publish.menu(topic);
	}
	
	$button.blur();
});

$('#formatting-toolbar button[data-channel="format"]').click(function () {
	var $button, shortcut;
	
	$button = $(this);
	
	if(isEnabled){
		shortcut = $button.data('shortcut');
		messenger.publish.format('wrapText', { shortcut: shortcut });
	}
	
	$button.blur();
});

$('#formatting-toolbar button[data-channel="dialog"]').click(function () {
    var $element, action;
    
    $element = $(this);
    action = $element.data('action');
	messenger.publish.dialog(action, {});
    
	$element.blur();
});


var handlers = {
	enable: function(){
		isEnabled = true;
	},
	allFilesClosed: function(){
		isEnabled = false;
	}
};

messenger.subscribe.file('opened', handlers.enable);
messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed);