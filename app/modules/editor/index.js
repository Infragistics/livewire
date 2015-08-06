/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global ace */

(function (ace, module) {

  'use strict';

  var editor;
  var session;
  var path = require('path');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  
  module.load = function(mode){

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
  
    var onChange = function(){
      messenger.publish.text('change', { source: editor.getValue() });
    };
    
    onChange();
  
    editor.on('change', onChange);
    editor.focus();
  };
  
  module.load('asciidoc');

} (ace, module.exports));