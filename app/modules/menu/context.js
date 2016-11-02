/*jslint node: true */
/*jshint esversion: 6 */

const ipc = require('electron').ipcRenderer;
const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));

const handlers = {
	cut: function () { messenger.publish.contextMenu('cut'); },
	copy: function () { messenger.publish.contextMenu('copy'); },
	paste: function () { messenger.publish.contextMenu('paste'); }
};

ipc.on('editor-context-menu-cut', handlers.cut);
ipc.on('editor-context-menu-copy', handlers.copy);
ipc.on('editor-context-menu-paste', handlers.paste);

window.addEventListener('contextmenu', function (e) {
	e.preventDefault();

	if (e.srcElement.className === 'ace_text-input') {
		ipc.send('show-editor-context-menu');
	}
	
}, false);