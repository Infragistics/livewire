/*jslint node: true */
/*jshint esversion: 6 */

const { BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const path = require('path');

const createDefaultMenu = (sender) => {
	let menu = new Menu();

	menu.append(new MenuItem({
		label: 'Cut',
		accelerator: 'CmdOrCtrl+Z',
		click: () => sender.send('editor-context-menu-cut') 
	}));

	menu.append(new MenuItem({
		label: 'Copy',
		accelerator: 'CmdOrCtrl+C',
		click: () => sender.send('editor-context-menu-copy')
	}));

	menu.append(new MenuItem({
		label: 'Paste',
		accelerator: 'CmdOrCtrl+V',
		click: () => sender.send('editor-context-menu-paste')
	}));

	return menu;
};


ipcMain.on('show-editor-context-menu', (e, args) => {
	const win = BrowserWindow.fromWebContents(e.sender);
	let menu = {};

	if(args.dynamicMenus && args.dynamicMenus.length > 0) {
		let menus = args.dynamicMenus.reverse();
		menu = createDefaultMenu(e.sender);
		menus.forEach((dynamicMenu) => {
			let _menu = require(path.resolve(__dirname, `./${dynamicMenu.name}.js`));
			menu = _menu.create(dynamicMenu.values, menu, e.sender);
		});
	} else {
		menu = createDefaultMenu(e.sender);
	}

	menu.popup(win);
});