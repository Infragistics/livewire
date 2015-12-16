/// <reference path="../../../typings/node/node.d.ts"/>
	
module = module.exports;


var 
	editor = null,
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	_ = require('lodash'),
	config = require(path.resolve(__dirname, '../config')).get(),
	formatter = require(path.resolve(__dirname, '../formats')).get(config.defaultFormat),
	remote = require('remote'),
	nodeDialog = remote.require('dialog'),
	fileNameCleaner =  require('./fileNameCleaner.js');
	
var $browseDialog, $linkInput, $browseBtn, $doneBtn;

$(function(){
	$browseDialog = $("#browseDialog");
	$linkInput = $("#linkInput");
	$browseBtn = $("#browseBtn");
	$doneBtn = $("#doneBtn");
	
	var createLink = function (filePaths) {
		var filePath, format, side;
		if (!filePaths || !filePaths.length) {
			console.log('No file paths selected');
		} else {
			if (typeof filePaths === 'string') {
				filePath = filePaths;
			} else {
				filePath = path.basename(filePaths[0]);
			}
			
			// transform file name:
			filePath = filePath.replace(new RegExp('\\.(' + formatter.extensions.join('|') + ')$'), '.html');
			filePath = fileNameCleaner.clean(filePath);
			
			format = $.extend({}, formatter.shortcuts.link);
			
			side = /\{0\}/.test(format.left) ? 'left': 'right'; 
			
			format[side] = format[side].replace('{0}', filePath);
			wrapSelectedText(format);
		}
		$browseDialog.modal('hide');
		$linkInput.val('').off('keyup');
		editor.focus(); 
	};
	
	$browseDialog.on('shown.bs.modal', function (e) {
		$linkInput.focus();
		$linkInput.on('keyup', function(e){
			if (e.keyCode === 13) {
				createLink($linkInput.val());
			}
		});
	});
	
	$browseBtn.one('click', function(){
		var options = {
			title: 'Select A File',
			properties: ['openFile'],
			filters: [{ name: formatter.name, extensions: formatter.extensions }]
		};
		nodeDialog.showOpenDialog(options, createLink);
	});
	$doneBtn.one('click', function(){
		createLink($linkInput.val());
	});
});

messenger.subscribe.file('formatChanged', function(data, envelope){
	formatter = data;
});

messenger.subscribe.format('wrapText', function(data, envelope){  
	editor.commands.exec(envelope.data.shortcut);
	
	// todo: make this generic if more dialogs are
	// added to the editor
	if(envelope.data.shortcut !== 'link'){
		editor.focus();
	}
});

var isRangeEmpty = function(range){
	return range.end.column === range.start.column;
};

var wrapSelectedText = function(format){
	var range, selectedText, wrapAtBeginningOfLine = false;
	
	range = editor.getSelectionRange();	
	
	if(isRangeEmpty(range) && format.cursorOffset){
		if(format.cursorOffset.wrapAtBeginningOfLine){
			wrapAtBeginningOfLine = true;
			editor.selection.selectLine();
			range = editor.getSelectionRange();
		}
	}
	
	selectedText = editor.session.getTextRange(range);
	
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
	
	if(wrapAtBeginningOfLine){
		editor.selection.moveCursorLineEnd();
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

var buildDialogCommand = function(name, shortcut){
	return {
		name: name,
		bindKey: { 
			win: shortcut.replace(/Command/, 'Ctrl'), 
			mac: shortcut.replace(/Ctrl/, 'Command') },
		exec: function(){
			$browseDialog.modal();
		}
	}
};

module.init = function (editorInstance) {
	
	editor = editorInstance;
	
	editor.commands.addCommand(buildCommand('bold', 'Ctrl-B'));
	editor.commands.addCommand(buildCommand('italic', 'Ctrl-I'));
	editor.commands.addCommand(buildCommand('code', 'Ctrl-D'));
	editor.commands.addCommand(buildDialogCommand('link', 'Ctrl-K'));
	editor.commands.addCommand(buildCommand('image', 'Ctrl-Shift-I'));
	editor.commands.addCommand(buildCommand('h1', 'Ctrl-1'));
	editor.commands.addCommand(buildCommand('h2', 'Ctrl-2'));
	editor.commands.addCommand(buildCommand('h3', 'Ctrl-3'));
	editor.commands.addCommand(buildCommand('quote', 'Ctrl-\''));
	editor.commands.addCommand(buildCommand('unordered', 'Ctrl-.'));
	editor.commands.addCommand(buildCommand('ordered', 'Ctrl-,'));
	editor.commands.addCommand(buildCommand('hr', 'Ctrl--'));
	
	editor.commands.addCommand({
		name: 'help', // pass through for help dialog
		bindKey: {
			win: 'ctrl+shift+/',
			mac: 'cmd+shift+?'
		},
		exec: function(){
			messenger.publish.dialog('help.open');
		}
	});
};