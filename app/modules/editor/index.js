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
    showGutter: false,
    readOnly: true
  });
  
  var showCursor = function(){
    editor.renderer.$cursorLayer.element.style.opacity = 1;
  };
  
  var hideCursor = function(){
    editor.renderer.$cursorLayer.element.style.opacity = 0;
  };
  
  var supressAceDepricationMessage = function(){
    editor.$blockScrolling = Infinity;
  };
  
  hideCursor(/* until a file is opened or new one is created */);
    
  supressAceDepricationMessage();

  session = editor.getSession();
  session.setMode('ace/mode/' + mode);
  session.setUseWrapMode(true);

  require('./clipboard.js').init(editor);
  require('./persistence.js');
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
        
        if(fileInfo.isBlank){
          hideCursor();
          editor.setValue('');
        } else {
          showCursor();
          editor.setValue(fileInfo.contents);
        }
          
        editor.focus();
        
      }
    },
    newFile: function(){
      if (editor.getReadOnly()) {
        editor.setReadOnly(false);
        showCursor();
      }
    }
  };
  
  messenger.subscribe.menu('file.new', handlers.newFile);
  messenger.subscribe.file('contentChanged', handlers.contentChanged);
};

module.load('asciidoc');