(function (module) {

	'use strict';

	var editor = null;
	
	var path = require('path');
	
	var grammar = require(path.resolve(__dirname, '../grammars')).get('markdown');
	
	var wrapSelectedText = function(format){
		var range = editor.getSelectionRange();
		var selectedText = editor.session.getTextRange(range);
		editor.getSession().replace(range, format.left + selectedText + format.right);
		
		if(format.cursorOffset > 0){
			editor.getSelection().moveCursorLeft();
			editor.clearSelection();
		}
	};

	module.init = function (editorInstance) {
		
		editor = editorInstance;

		editor.commands.addCommand({
			name: 'bold',
			bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
			exec: function (e) {
				wrapSelectedText(grammar.bold);
			}
		});
		
		editor.commands.addCommand({
			name: 'italic',
			bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
			exec: function (e) {
				wrapSelectedText(grammar.italic);
			}
		});
		
		editor.commands.addCommand({
			name: 'code',
			bindKey: { win: 'Ctrl-D', mac: 'Command-D' },
			exec: function (e) {
				wrapSelectedText(grammar.code);
			}
		});
		
		editor.commands.addCommand({
			name: 'link',
			bindKey: { win: 'Ctrl-K', mac: 'Command-K' },
			exec: function (e) {
				wrapSelectedText(grammar.link);
			}
		});
		
		editor.commands.addCommand({
			name: 'image',
			bindKey: { win: 'Ctrl-Shift-I', mac: 'Command-Shift-I' },
			exec: function (e) {
				wrapSelectedText(grammar.image);
			}
		});
	};

} (module.exports));