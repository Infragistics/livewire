/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global ace */

module = module.exports;

var editor;
var session;
var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var currentFile = {};

module.load = function (mode) {

  editor = ace.edit('editor');
  editor.setOptions({
    fontSize: '18px',
    theme: 'ace/theme/github',
    showPrintMargin: false,
    highlightActiveLine: false,
    showGutter: false
  });
    
  // required by ace to suppress a deprication message
  editor.$blockScrolling = Infinity;

  session = editor.getSession();
  session.setMode('ace/mode/' + mode);
  session.setUseWrapMode(true);

  require('./clipboard.js').init(editor);
  require('./persistence.js').init(editor);
  require('./formatting.js').init(editor);

  var onChange = function () {
    currentFile.contents = editor.getValue();
    messenger.publish.file('sourceChange', currentFile);
  };

  onChange();

  editor.on('change', onChange);
  editor.focus();
  
  var handlers = {
    contentChanged: function(file){
      currentFile = file;
      editor.setValue(file.contents);
      //editor.clearSelection();
      editor.focus();
    }
  };
  
  messenger.subscribe.file('contentChanged', handlers.contentChanged);
};

module.load('asciidoc');