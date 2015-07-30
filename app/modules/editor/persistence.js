(function (module) {

  'use strict';

  var path = require('path');
  var fs = require('fs');
  var dialogs = require(path.resolve(__dirname, '../dialogs'));
  var messenger = require(path.resolve(__dirname, '../messenger'));
  var editor;
  var filePath = '';
  
  module.init = function(editorInstance){
    editor = editorInstance;
  };
  
  messenger.subscribe.file('file.pathInfo', function (data, envelope) {
    if (data.isNewFile) {
      filePath = '';
    }
  });

  var menuHandlers = {

    newFile: function (data, envelope) {
      messenger.publish.file('file.pathInfo', { isNewFile: true });
      editor.setValue('');
    },

    open: function (data, envelope) {
      var options = {
        title: 'Open Markdown Files',
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      };

      dialogs.openFile(options).then(function (response) {
        filePath = response.path;
        messenger.publish.file('file.pathInfo', { path: response.path });
        editor.setValue(response.content);
        editor.clearSelection();
      });
    },

    save: function (data, envelope) {
      if (filePath.length > 0) {
        fs.writeFile(filePath, editor.getValue(), { encoding: 'utf8' }, function (err) {
          // todo: handle error 
        });
      } else {
        menuHandlers.saveAs(data, envelope);
      }
    },

    saveAs: function (data, envelope) {
      var options = {
        title: 'Save Markdown File',
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      };

      var content = editor.getValue();

      dialogs.saveFile(content, options, 'md').then(function(filePath){
        messenger.publish.file('file.pathInfo', {path: filePath});
      });
    }
  };
  
  messenger.subscribe.menu('file.new', menuHandlers.newFile);
  messenger.subscribe.menu('file.open', menuHandlers.open);
  messenger.subscribe.menu('file.save', menuHandlers.save);
  messenger.subscribe.menu('file.saveAs', menuHandlers.saveAs);

} (module.exports));