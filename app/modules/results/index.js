/// <reference path="../../../typings/jquery/jquery.d.ts"/>

(function ($, module) {

  'use strict';

  var $result = $('#result');

  var path = require('path');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  var renderer = require(path.resolve(__dirname, './markdown.js')).get();
  var source = '';
  var html = '';
   
  messenger.subscribe.text('change', function (data, envelope) {
    source = data.source;
    html = renderer(source);
    $result.html(html);
  });
  
  messenger.subscribe.text('rerender', function (data, envelope) {
    html = renderer(source);
    $result.html(html);
  });

} ($, module.exports));