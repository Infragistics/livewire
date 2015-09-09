/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global ace */

module = module.exports;

var 
  path = require('path'),
  _ = require('lodash'),
  messenger = require(path.resolve(__dirname, '../messenger')),
  editor,
  session,
  currentFile = {},
  noop = function(){};

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
  
  var activateEditor = function(){
    if (editor.getReadOnly()) {
      editor.setReadOnly(false);
      showCursor();
    }
  };
  
  hideCursor(/* until a file is opened or new one is created */);
    
  supressAceDepricationMessage();

  session = editor.getSession();
  session.setMode('ace/mode/' + mode);
  session.setUseWrapMode(true);

  require('./clipboard.js').init(editor);
  require('./formatting.js').init(editor);

  var onChange = function () {
    currentFile.contents = editor.getValue();
    messenger.publish.file('sourceChange', currentFile);
  };

  onChange();

  editor.on('change', onChange);
  editor.focus();
  
  var handlers = {
    fileNew: function(){
      editor.scrollToLine(0);
    },
    contentChanged: function(fileInfo){
      var rowNumber;
      
      if(_.isObject(fileInfo)){
        
        activateEditor();
        
        currentFile = fileInfo;
        
        if(fileInfo.isBlank){
          hideCursor();
          editor.setValue('');
        } else {
          showCursor();
          editor.setValue(fileInfo.contents);
          
          if(fileInfo.cursorPosition){
            rowNumber = fileInfo.cursorPosition.row;
            editor.selection.moveCursorToPosition(fileInfo.cursorPosition);
            editor.scrollToLine(rowNumber, true /* attempt to center in editor */, true /* animate */, noop);
          }
        }
          
        editor.focus();
        editor.selection.clearSelection();
        
      }
    }
  };
  
  messenger.subscribe.menu('new', activateEditor);
  messenger.subscribe.file('contentChanged', handlers.contentChanged);
  messenger.subscribe.file('new', handlers.fileNew);
};

module.load('asciidoc');