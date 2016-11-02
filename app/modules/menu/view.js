const path = require('path');
const { remote } = require('electron');
const app = remote.app;
const messenger = require(path.resolve(__dirname, '../messenger'));

var handlers = {

  quit: function (data, envelope) {
    var quit = confirm('Are you sure you want to close this application?');
    if (quit) {
      app.quit();
    }
  },

  reload: function () {
    remote.getCurrentWindow().reload();
  },

  devToolsToggle: function () {
    remote.getCurrentWindow().toggleDevTools();
  }
};

messenger.subscribe.menu('reload', handlers.reload);
messenger.subscribe.menu('devToolsToggle', handlers.devToolsToggle);
messenger.subscribe.menu('fullScreenToggle', handlers.fullScreenToggle);
messenger.subscribe.menu('autoHideMenu', handlers.autoHideMenu);