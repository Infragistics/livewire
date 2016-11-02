const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));
const { shell } = require('electron');
const config = require(path.resolve(__dirname, '../config')).get();
const dialogs = require('../dialogs');
const packageJsonReader = require(path.resolve(__dirname, '../config/packageJsonReader.js'));

let handlers = {
  issues: function () {
    shell.openExternal(config.urls.repository + '/issues');
  },
  about: function () {

    let version = null;
    const fs = require('fs');

    let showAboutDialog = (version) => {
      dialogs.messageBox({
        title: 'About',
        message: `Livewire


Version:   ${version}
GitHub:    http://github.com/infragistics/livewire`
      });
    };

    if(!version) {
      packageJsonReader.get().then((config) => {
        version = config.version;
        showAboutDialog(version);
      });
    } else {
      showAboutDialog(version)
    }
  }
};

messenger.subscribe.menu('issues', handlers.issues);
messenger.subscribe.menu('about', handlers.about);