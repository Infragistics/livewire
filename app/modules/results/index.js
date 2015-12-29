/* global appSettings */

var
  $result, 
  $splitController,
  path = require('path'),
  _ = require('lodash'),
  
  messenger = require(path.resolve(__dirname, '../messenger')),
  renderer = require(path.resolve(__dirname, './asciidoc.js')).get(),
  formats = require(path.resolve(__dirname, '../formats')),
  
  source = '',
  shell = require('shell'),
  formatter = null,
  subscriptions = {},
  
  _fileInfo,
  _buildFlags = [];
  
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
  newFile: function(){
    $result.animate({
        scrollTop: $result.offset().top
    }, 10);
  },
  contentChanged: function(fileInfo){
    var flags = '';
    
    _fileInfo = fileInfo;
    
    if(!_.isUndefined(_fileInfo)){
      if (_fileInfo.isBlank) {
        $result.html('');
      } else {
        detectRenderer(_fileInfo);
        source = _fileInfo.contents;
        
        _buildFlags.forEach(function(buildFlag){
          flags += ':' + buildFlag + ':\n'
        });
        
        source = flags + source;
        
        renderer(source, function(e){
          $result.html(e.html);
        });
      }
    }
  },
  buildFlags: function(buildFlags){
    _buildFlags = buildFlags;
    handlers.contentChanged(_fileInfo);
  },
  hideResults: function(){
      unsubscribe();
      $result.hide();
      $splitController.one('click', function(){
          $result.show();
          subscribe();
          messenger.publish.layout('showResults');
      });
  }
};

var subscribe = function(){ 
    subscriptions.newFile = messenger.subscribe.file('new', handlers.newFile);
    subscriptions.opened = messenger.subscribe.file('opened', handlers.newFile);
    subscriptions.contentChanged = messenger.subscribe.file('contentChanged', handlers.contentChanged);
    subscriptions.sourceChanged = messenger.subscribe.file('sourceChange', handlers.contentChanged);
    subscriptions.buildFlags = messenger.subscribe.format('buildFlags', handlers.buildFlags);
    subscriptions.hideResults = messenger.subscribe.layout('hideResults', handlers.hideResults);
};

var unsubscribe = function(){
    subscriptions.newFile.unsubscribe();
    subscriptions.opened.unsubscribe();
    subscriptions.contentChanged.unsubscribe();
    subscriptions.sourceChanged.unsubscribe();
    subscriptions.buildFlags.unsubscribe();
    subscriptions.hideResults.unsubscribe();
};

subscribe();

messenger.subscribe.file('rerender', function (data, envelope) {
  renderer(source, function(e){
    $result.html(e.html);
  });
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

$(function(){
   $result = $('#result');
   $splitController = $('#split-controller');
   
   $result
        .css('left', appSettings.split()) 
        .css('width', appSettings.resultsWidth()); 
});