/// <reference path="../../../typings/jquery/jquery.d.ts"/>

var $result = $('#result');

var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var renderer = require(path.resolve(__dirname, './asciidoc.js')).get();;
var source = '';
var html = '';

messenger.subscribe.format('selectedFormat', function (data, envelope) {
  var fullPath = path.resolve(__dirname, './' + data.name.toLowerCase());
  renderer = require(fullPath).get();
});

messenger.subscribe.text('change', function (data, envelope) {
  source = data.source;
  html = renderer(source);
  $result.html(html);
});

messenger.subscribe.text('rerender', function (data, envelope) {
  html = renderer(source);
  $result.html(html);
});