/*jslint node: true */
/*jshint esversion: 6 */

const ipc = require('electron').ipcRenderer;
const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));

const handlers = {
	cut: () => { messenger.publish.contextMenu('cut'); },
	copy: () => { messenger.publish.contextMenu('copy'); },
	paste:() => { messenger.publish.contextMenu('paste'); },
	replaceMisspelling: (e, args) => messenger.publish.file('replace-misspelling', args),
	contextMenuInfoResponse: (info) => {

		var args = {
			dynamicMenus: []
		};

		if(info.spellingSuggestions) {
			args.dynamicMenus.push({
				name: 'spellingSuggestions',
				values: info.spellingSuggestions
			});

			args.dynamicMenus.push({ 
				name: 'addToDictionary',
				values: ['Add to Dictionary']
			});
		}

		ipc.send('show-editor-context-menu', args);

	},

	addToDictionary: (e, args) => {
		messenger.publish.file('spell-check-add-to-dictionary', args);
	}
};

ipc.on('editor-context-menu-cut', handlers.cut);
ipc.on('editor-context-menu-copy', handlers.copy);
ipc.on('editor-context-menu-paste', handlers.paste);
ipc.on('editor-context-menu-replace-mispelling', handlers.replaceMisspelling);
ipc.on('editor-context-menu-add-to-dictionary', handlers.addToDictionary);

window.addEventListener('contextmenu', function (e) {
	e.preventDefault();

	if (e.srcElement.className === 'ace_text-input') {
		messenger.publish.file('context-menu-info-request', e);
	}
		
}, false);

messenger.subscribe.file('context-menu-info-response', handlers.contextMenuInfoResponse);