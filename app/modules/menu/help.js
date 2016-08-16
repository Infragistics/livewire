var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var shell = require('shell');
var config = require(path.resolve(__dirname, '../config')).get();
var dialogs = require('../dialogs');

var handlers = {
  issues: function () {
    shell.openExternal(config.urls.repository + '/issues');
  },
  about: function () {

    var version = null;
    const fs = require('fs');

    var showAboutDialog = (version) => {
      dialogs.messageBox({
        title: 'About',
        message: `Livewire


Version:   ${version}
GitHub:    http://github.com/infragistics/livewire`
      });
    };

    if(!version) {
      fs.readFile(path.resolve(__dirname, '../../../package.json'), 'utf8', (err, data) => {
        var info = JSON.parse(data);
        version = info.version;
        showAboutDialog(version);
      });
    } else {
      showAboutDialog(version)
    }
  }
};

messenger.subscribe.menu('issues', handlers.issues);
messenger.subscribe.menu('about', handlers.about);