module = module.exports;

var
    path = require('path'),
    messenger = require(path.resolve(__dirname, '../messenger'));

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