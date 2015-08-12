/// <reference path="../../../../typings/node/node.d.ts"/>
/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

module = module.exports;

var 
  path = require('path'),
  messenger = require(path.resolve(__dirname, '../../messenger')),
  _ = require('lodash'),
  shell = require('shell'),

  $tabsContainer = $('#lw-tabs'),  
  template = '<div class="lw-tab active" title="PATH"><span class="lw-name">NAME</span> <button class="lw-close" title="close" data-path="PATH"><i class="fa fa-times-circle-o"></i></button></div>';
  
var removeActiveClass = function(){
  $('.lw-tab').removeClass('active');
};

var clearSelection = function(){
  window.getSelection().empty();  
};

// Switch documents
$tabsContainer.on('click', '.lw-tab', function(e){
  var $tab, filePath;
  
  removeActiveClass();
  
  $tab = $(this);
  $tab.addClass('active');
  
  filePath = $tab.attr('title');
  
  messenger.publish.file('fileSelected', {filePath: filePath});
});

// Open file in Explorer/Finder
$tabsContainer.on('dblclick', '.lw-tab', function(e){
  var filePath; 
  
  clearSelection();
  filePath = $(this).attr('title');
  shell.showItemInFolder(filePath);
});

// Close tab
$tabsContainer.on('click', '.lw-close', function(e){
  var $btn, $tab, isTabSelected, filePath;
  
  e.stopPropagation();
  
  $btn = $(this);
  filePath = $btn.data('path');
  $tab = $btn.parents('.lw-tab');
  
  isTabSelected = $tab.hasClass('active');
  
  $btn.blur();
  $tab.remove();
  
  if(isTabSelected){
    setTimeout(function() {
      $('.lw-tab').last().trigger('click');
    }, 5);
  }
  
  messenger.publish.file('fileClosed', {filePath: filePath});
});

messenger.subscribe.file('file.pathInfo', function (fileInfo, envelope) {
  var $tab;
  
  var bindTab = function($tab){
    $tab.attr('title', fileInfo.path);
    $tab.find('span.lw-name').text(fileInfo.fileName);
    $tab.find('button.lw-close').data('path', fileInfo.path);
  };
  
  if (!_.isUndefined(fileInfo.path)) {
    if(fileInfo.keepExistingTab){
      $tab = $tabsContainer.find('.active');
      bindTab($tab);
    } else {
      removeActiveClass();
      $tab = $(template);
      bindTab($tab);
      $tabsContainer.append($tab); 
    }
  }
});