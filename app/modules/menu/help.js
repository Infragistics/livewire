var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var shell = require('shell');
var config = require(path.resolve(__dirname, '../config')).get();

var handlers = {
  issues: function () {
    shell.openExternal(config.urls.repository + '/issues');
  },
  about: function () {
    shell.openExternal(config.urls.repository);
  }
};

messenger.subscribe.menu('help.issues', handlers.issues);
messenger.subscribe.menu('help.about', handlers.about);