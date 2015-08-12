/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global ace */

module = module.exports;

var 
  path = require('path'),
  _ = require('lodash'),
  messenger = require(path.resolve(__dirname, '../messenger')),
  editor,
  session,
  currentFile = {};

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
    contentChanged: function(fileInfo){
      if(_.isObject(fileInfo)){
        currentFile = fileInfo;
        editor.setValue(fileInfo.contents);
        editor.focus();
      }
    }
  };
  
  messenger.subscribe.file('contentChanged', handlers.contentChanged);
};

module.load('asciidoc');