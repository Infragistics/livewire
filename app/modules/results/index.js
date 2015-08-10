/// <reference path="../../../typings/jquery/jquery.d.ts"/>

var $result = $('#result');

var 
  path = require('path'),
  messenger = require(path.resolve(__dirname, '../messenger')),
  renderer = require(path.resolve(__dirname, './asciidoc.js')).get(),
  source = '',
  html = '',
  shell = require('shell');

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

var openExternalLinksInBrowser = function (e) {
  var href;
  var element = e.target;

  if (element.nodeName === 'A') {
    href = element.getAttribute('href');
    shell.openExternal(href);
    e.preventDefault();
  }
};

document.addEventListener('click', openExternalLinksInBrowser, false);