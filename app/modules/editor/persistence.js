(function (module) {

  'use strict';

  var path = require('path');
  var fs = require('fs');
  
  var dialogs = require(path.resolve(__dirname, '../dialogs'));
  var messenger = require(path.resolve(__dirname, '../messenger'));
  
  var editor;
  var filePath = '';
  
  var formats = require(path.resolve(__dirname, '../formats'));
  var formatter = null;
  
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
      var formatName = envelope.data.format;
      formatter = formats.get(formatName);
      messenger.publish.format('selectedFormat', formatter);
      messenger.publish.file('file.pathInfo', { isNewFile: true });
      editor.setValue(formatter.defaultContent);
      editor.clearSelection();
    },

    open: function (data, envelope) {
      var options = {
        title: 'Open',
        filters: []
      };

      formats.getAll(function (formats) {

        formats.forEach(function (format) {
          options.filters.push({ name: format.name, extensions: format.extensions });
        });

        dialogs.openFile(options).then(function (response) {
          filePath = response.path;
          messenger.publish.file('file.pathInfo', { path: response.path });
          editor.setValue(response.content);
          editor.clearSelection();
        });
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
        title: 'Save File'
      };

      var content = editor.getValue();
      
      // todo - change this
      if(formatter === null){
        formatter = formats.get('asciidoc');
      }

      dialogs.saveFile(content, options, formatter.defaultExtension).then(function(newFilePath){
        filePath = newFilePath;
        messenger.publish.file('file.pathInfo', {path: filePath});
        messenger.publish.text('rerender');
      });
    }
  };
  
  messenger.subscribe.menu('file.new', menuHandlers.newFile);
  messenger.subscribe.menu('file.open', menuHandlers.open);
  messenger.subscribe.menu('file.save', menuHandlers.save);
  messenger.subscribe.menu('file.saveAs', menuHandlers.saveAs);

} (module.exports));