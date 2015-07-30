(function (module) {

  'use strict';

  var path = require('path');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  var shell = require('shell');

  var handlers = {
    issues: function () { 
      shell.openExternal('https://github.com/craigshoemaker/electric-mark/issues');
    },
    about: function () {
      shell.openExternal('https://github.com/craigshoemaker/electric-mark');
    }
  };

  messenger.subscribe.menu('help.issues', handlers.issues);
  messenger.subscribe.menu('help.about', handlers.about);

} (module.exports));