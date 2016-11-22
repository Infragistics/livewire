/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const
    path = require('path'),
    messenger = require(path.resolve(__dirname, '../messenger')),
    dialogs = require(path.resolve(__dirname, '../dialogs')),
    files = require(path.resolve(__dirname, '../files'));

function setWindowTitle(name) {
    var title = 'Livewire';
    if (name) {
        title = name + ' - ' + title;
    }
    document.title = title;
}

var handlers = {
    fileSelected: function(e) {
        setWindowTitle(e.fileName);
    },
    fileOpened: function(e) {
        setWindowTitle(e.fileName);
    },
    fileAllFilesClosed: function (e) {
        setWindowTitle();
    }
};

messenger.subscribe.file('selected', handlers.fileSelected);
messenger.subscribe.file('opened', handlers.fileOpened);
messenger.subscribe.file('allFilesClosed', handlers.fileAllFilesClosed);
messenger.subscribe.file('titleChanged', handlers.fileSelected);

window.onbeforeunload = (e) => {
	if(files.hasUnsavedChanges()) {
		dialogs.messageBox({
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm',
			message: `The following files have unsaved changes:

- ${files.getDirtyFileList().join('\n- ')}

Are you sure you want to quit?`
		}).then((shouldRemainOpen) => {
			if(!shouldRemainOpen) {
				window.onbeforeunload = () => {};
				window.close();
			}
		});
		e.returnValue = false;
	}
};