/*jslint node: true */
/*jshint esversion: 6 */

const { BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');

const editorMenu = new Menu();
let sender = null;

editorMenu.append(new MenuItem({
	label: 'Cut',
	accelerator: 'CmdOrCtrl+Z',
	click: () => sender.send('editor-context-menu-cut') 
}));

editorMenu.append(new MenuItem({
	label: 'Copy',
	accelerator: 'CmdOrCtrl+C',
	click: () => sender.send('editor-context-menu-copy')
}));

editorMenu.append(new MenuItem({
	label: 'Paste',
	accelerator: 'CmdOrCtrl+V',
	click: () => sender.send('editor-context-menu-paste')
}));

ipcMain.on('show-editor-context-menu', (e, args) => {
    sender = e.sender;
	const win = BrowserWindow.fromWebContents(e.sender);
	editorMenu.popup(win);
});