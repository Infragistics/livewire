/// <reference path="../../../typings/jquery/jquery.d.ts"/>

(function ($, module) {

  'use strict';

  var $result = $('#result');

  var path = require('path');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  var renderer = require(path.resolve(__dirname, './markdown.js')).get();
   
  messenger.subscribe.text('change', function (data, envelope) {
    var html = renderer(data.source);
    $result.html(html);
  });

} ($, module.exports));