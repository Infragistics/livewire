var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));

var handlers = {
	cut: function () { messenger.publish.contextMenu('cut'); },
	copy: function () { messenger.publish.contextMenu('copy'); },
	paste: function () { messenger.publish.contextMenu('paste'); }
};

var editorMenu = new Menu();

editorMenu.append(new MenuItem({
	label: 'Cut',
	accelerator: 'CmdOrCtrl+Z',
	click: handlers.cut
}));

editorMenu.append(new MenuItem({
	label: 'Copy',
	accelerator: 'CmdOrCtrl+C',
	click: handlers.copy
}));

editorMenu.append(new MenuItem({
	label: 'Paste',
	accelerator: 'CmdOrCtrl+V',
	click: handlers.paste
}));

window.addEventListener('contextmenu', function (e) {
	e.preventDefault();

	if (e.srcElement.className === 'ace_text-input') {
		editorMenu.popup(remote.getCurrentWindow());
	}
}, false);