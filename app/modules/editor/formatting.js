/// <reference path="../../../typings/node/node.d.ts"/>
	
module = module.exports;

var 
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	_ = require('lodash'),
    fs = require('fs'),
	config = require(path.resolve(__dirname, '../config')).get(),
    dialogs = require('./dialogs');;
    
module.editor = null;
module.formatter = require(path.resolve(__dirname, '../formats')).get(config.defaultFormat);
  
messenger.subscribe.file('formatChanged', (data, envelope) => {
	module.formatter = data;
});

messenger.subscribe.format('wrapText', (data, envelope) => {  
	module.editor.commands.exec(envelope.data.shortcut);
	
	// todo: make this generic if more dialogs are
	// added to the editor
	if(envelope.data.shortcut !== 'link' || envelope.data.shortcut !== 'image'){
		module.editor.focus();
	}
});

var isRangeEmpty = (range) => {
	return range.end.column === range.start.column;
};

module.wrapSelectedText = (format) => {
	var range, selectedText, wrapAtBeginningOfLine = false;
	
	range = module.editor.getSelectionRange();	
	
	if(isRangeEmpty(range) && format.cursorOffset){
		if(format.cursorOffset.wrapAtBeginningOfLine){
			wrapAtBeginningOfLine = true;
			module.editor.selection.selectLine();
			range = module.editor.getSelectionRange();
		}
	}
	
	selectedText = module.editor.session.getTextRange(range);
	
	module.editor.getSession().replace(range, format.left + selectedText + format.right);
	
	if(!_.isUndefined(format.cursorOffset)){
		if(format.cursorOffset.fromLeft){
			module.editor.getSelection().moveCursorTo(range.start.row, range.start.column + format.cursorOffset.value);
		} else {
			range = module.editor.getSelectionRange();
			module.editor.getSelection().moveCursorTo(range.start.row, range.end.column - format.cursorOffset.value);			
		}
		module.editor.clearSelection();
	}
	
	if(wrapAtBeginningOfLine){
		module.editor.selection.moveCursorLineEnd();
	}
	
};

var buildCommand = (name, shortcut) => {
	return {
		name: name,
		bindKey: { 
			win: shortcut.replace(/Command/, 'Ctrl'), 
			mac: shortcut.replace(/Ctrl/, 'Command') },
		exec: () => {
			module.wrapSelectedText(module.formatter.shortcuts[name]);
		}
	}
};

module.init = (editorInstance) => {
	
	module.editor = editorInstance;
    	
	module.editor.commands.addCommand(buildCommand('bold', 'Ctrl-B'));
	module.editor.commands.addCommand(buildCommand('italic', 'Ctrl-I'));
	module.editor.commands.addCommand(buildCommand('code', 'Ctrl-D'));
	module.editor.commands.addCommand(buildCommand('h1', 'Ctrl-1'));
	module.editor.commands.addCommand(buildCommand('h2', 'Ctrl-2'));
	module.editor.commands.addCommand(buildCommand('h3', 'Ctrl-3'));
	module.editor.commands.addCommand(buildCommand('quote', 'Ctrl-\''));
	module.editor.commands.addCommand(buildCommand('unordered', 'Ctrl-.'));
	module.editor.commands.addCommand(buildCommand('ordered', 'Ctrl-,'));
	module.editor.commands.addCommand(buildCommand('hr', 'Ctrl--'));
	
	module.editor.commands.addCommand({
		name: 'help', // pass through for help dialog
		bindKey: {
			win: 'ctrl+shift+/',
			mac: 'cmd+shift+?'
		},
		exec: () => {
			messenger.publish.dialog('help.open');
		}
	});
    
    dialogs.init(module);
};