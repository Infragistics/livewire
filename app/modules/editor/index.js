/* global ace */

(function (ace, module) {

  'use strict';

  var marked = require('marked');
  var editor;
  var session;
  var $result = $('#result');

  editor = ace.edit('editor');
  editor.setOptions({
    fontSize: '18px',
    theme: 'ace/theme/github',
    showPrintMargin: false,
    highlightActiveLine: false,
    showGutter: false
  });
  
  // required by ace to suppress
  // a deprication message
  editor.$blockScrolling = Infinity;

  session = editor.getSession();
  session.setMode('ace/mode/markdown');
  session.setUseWrapMode(true);

  var clipboard = require('./clipboard.js');
  clipboard.init(editor);
  
  var menuActions = require('./persistence.js');
  menuActions.init(editor);

  var convertToHTML = function () {
    var html = marked(editor.getValue());
    $result.html(html);
  };

  convertToHTML();

  editor.on('change', convertToHTML);

} (ace, module.exports));