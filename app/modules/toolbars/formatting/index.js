/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

var path = require('path');
var messenger = require(path.resolve(__dirname, '../../messenger'));

$('#formatting-toolbar button[data-channel="menu"]').click(function () {
	var $button = $(this);
	var topic = $button.data('topic');
	messenger.publish.menu(topic);
	$button.blur();
});

$('#formatting-toolbar button[data-channel="format"]').click(function () {
	var $button = $(this);
	var shortcut = $button.data('shortcut');
	messenger.publish.format('wrapText', { shortcut: shortcut });
	$button.blur();
});