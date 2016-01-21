/// <reference path="../../../typings/node/node.d.ts"/>
  
module = module.exports;

var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var clipboard = require('clipboard');
var editor = null;
var key = 'editor.copied.text'

module.init = function (editorInstance) {
  editor = editorInstance;
};

var copySelectedText = function () {
  var range = editor.getSelectionRange();
  var text = editor.session.getTextRange(range).replace(/\n/g, "\r\n"); //"\r\n" will make sure new lines are handled across all operating systems and editors
  clipboard.writeText(text, key);
  return range;
};

var handlers = {

  cut: function (data, envelope) {
    var range = copySelectedText();
    editor.getSession().remove(range);
  },

  copy: function (data, envelope) {
    copySelectedText();
  },

  paste: function (data, envelope) {
    var text = clipboard.readText(key);
    editor.insert(text);
  }
};

messenger.subscribe.contextMenu('cut', handlers.cut);
messenger.subscribe.contextMenu('copy', handlers.copy);
messenger.subscribe.contextMenu('paste', handlers.paste);
