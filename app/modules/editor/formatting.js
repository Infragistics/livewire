/// <reference path="../../../typings/node/node.d.ts"/>
	
module = module.exports;

var 
	editor = null,
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	_ = require('lodash'),
	config = require(path.resolve(__dirname, '../config')).get(),
	formatter = require(path.resolve(__dirname, '../formats')).get(config.defaultFormat);

messenger.subscribe.file('formatChanged', function(data, envelope){
	formatter = data;
});

messenger.subscribe.format('wrapText', function(data, envelope){  
	wrapSelectedText(formatter.shortcuts[envelope.data.shortcut]);
	editor.focus();
});

var wrapSelectedText = function(format){
	var range = editor.getSelectionRange();
	var selectedText = editor.session.getTextRange(range);
	editor.getSession().replace(range, format.left + selectedText + format.right);
	
	if(!_.isUndefined(format.cursorOffset)){
		if(format.cursorOffset.fromLeft){
			editor.getSelection().moveCursorTo(range.start.row, range.start.column + format.cursorOffset.value);
		} else {
			range = editor.getSelectionRange();
			editor.getSelection().moveCursorTo(range.start.row, range.end.column - format.cursorOffset.value);			
		}
		editor.clearSelection();
	}
};

var buildCommand = function(name, shortcut){
	return {
		name: name,
		bindKey: { 
			win: shortcut.replace(/Command/, 'Ctrl'), 
			mac: shortcut.replace(/Ctrl/, 'Command') },
		exec: function(){
			wrapSelectedText(formatter.shortcuts[name]);
		}
	}
};

module.init = function (editorInstance) {
	
	editor = editorInstance;
	
	editor.commands.addCommand(buildCommand('bold', 'Ctrl-B'));
	editor.commands.addCommand(buildCommand('italic', 'Ctrl-I'));
	editor.commands.addCommand(buildCommand('code', 'Ctrl-D'));
	editor.commands.addCommand(buildCommand('link', 'Ctrl-K'));
	editor.commands.addCommand(buildCommand('image', 'Ctrl-Shift-I'));
	editor.commands.addCommand(buildCommand('h1', 'Ctrl-1'));
	editor.commands.addCommand(buildCommand('h2', 'Ctrl-2'));
	editor.commands.addCommand(buildCommand('h3', 'Ctrl-3'));
	editor.commands.addCommand(buildCommand('quote', 'Ctrl-\''));
	editor.commands.addCommand(buildCommand('unordered', 'Ctrl-.'));
	editor.commands.addCommand(buildCommand('ordered', 'Ctrl-,'));
	editor.commands.addCommand(buildCommand('hr', 'Ctrl-H'));
	
	editor.commands.addCommand({
		name: 'help', // pass through for help dialog
		bindKey: {
			win: 'ctrl+shift+?',
			mac: 'cmd+shift+?'
		},
		exec: function(){
			messenger.publish.dialog('help.open');
		}
	});
};