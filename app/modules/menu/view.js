var path = require('path');
var remote = require('remote');
var app = remote.require('app');
var messenger = require(path.resolve(__dirname, '../messenger'));
var browserWindow;

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
  },

  fullScreenToggle: function () {
    var browserWindow = remote.getCurrentWindow();
    browserWindow.setFullScreen(!browserWindow.isFullScreen());
  },

  autoHideMenu: function () {
    browserWindow = remote.getCurrentWindow();
    var isMenuBarAutoHide = browserWindow.isMenuBarAutoHide();;

    if (isMenuBarAutoHide) {
      browserWindow.setAutoHideMenuBar(false);
      browserWindow.setMenuBarVisibility(true);
    } else {
      browserWindow.setAutoHideMenuBar(true);
    }
  }
};

messenger.subscribe.menu('reload', handlers.reload);
messenger.subscribe.menu('devToolsToggle', handlers.devToolsToggle);
messenger.subscribe.menu('fullScreenToggle', handlers.fullScreenToggle);
messenger.subscribe.menu('autoHideMenu', handlers.autoHideMenu);