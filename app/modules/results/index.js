var result = document.getElementById('result');

var 
  path = require('path'),
  _ = require('lodash'),
  
  messenger = require(path.resolve(__dirname, '../messenger')),
  renderer = require(path.resolve(__dirname, './asciidoc.js')).get(),
  formats = require(path.resolve(__dirname, '../formats')),
  
  source = '',
  html = '',
  shell = require('shell'),
  formatter = null;
  
var detectRenderer = function(fileInfo){
  var rendererPath, currentFormatter;
  
  currentFormatter = formats.getByFileExtension(fileInfo.ext);
  
  if (formatter === null || currentFormatter.name !== formatter.name) {
    formatter = currentFormatter;
    rendererPath = path.resolve(__dirname, './' + formatter.name.toLowerCase());
    renderer = require(rendererPath).get();
    
    messenger.publish.file('formatChanged', formatter);
  }
};

var handlers = {
  contentChanged: function(fileInfo){
    
    if(!_.isUndefined(fileInfo)){
      if (fileInfo.isBlank) {
        html = ''; 
      } else {
        detectRenderer(fileInfo);
        source = fileInfo.contents;
        html = renderer(source);
      }
      result.innerHTML = html;
    }
  }
};

messenger.subscribe.file('contentChanged', handlers.contentChanged);
messenger.subscribe.file('sourceChange', handlers.contentChanged);

messenger.subscribe.file('rerender', function (data, envelope) {
  html = renderer(source);
  result.innerHTML = html;
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