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

var bindTab = function($tab, fileInfo){
  $tab.attr('title', fileInfo.path);
  $tab.attr('id', fileInfo.id);
  $tab.find('span.lw-name').text(fileInfo.fileName);
  $tab.find('button.lw-close').data('path', fileInfo.path);
};

var getFileInfoFromTab = function($tab){
  var 
    fileName = '', 
    filePath = '', 
    ext = '', 
    basePath = '';
  
  fileName = $tab.find('span.lw-name').text();
  filePath = $tab.attr('title');
  
  if(filePath.length === 0){
    ext = path.extname(fileName);
  } else {
    basePath = path.dirname(filePath);
    ext = path.extname(filePath);
  }
  
  var fileInfo = {
    path: filePath,
    id: $tab.attr('id'),
    fileName: fileName,
    basePath: basePath,
    ext: ext
  }
  
  return fileInfo;
};

// Switch documents
$tabsContainer.on('click', '.lw-tab', function(e){
  var $tab, fileInfo, isTabSelected;
  
  $tab = $(this);
  isTabSelected = $tab.hasClass('active');
  
  if(!isTabSelected){
    removeActiveClass();
    
    $tab.addClass('active');
    
    fileInfo = getFileInfoFromTab($tab);
    
    messenger.publish.file('fileSelected', fileInfo);
  }
  
});

// Open file in Explorer/Finder
$tabsContainer.on('dblclick', '.lw-tab', function(e){
  var filePath; 
  
  clearSelection();
  filePath = $(this).attr('title');
  
  if(filePath.length > 0){
    shell.showItemInFolder(filePath);
  }
  
});

// Close tab
$tabsContainer.on('click', '.lw-close', function(e){
  var $btn, $tab, isTabSelected, fileInfo;
  
  e.stopPropagation();
  
  $btn = $(this);
  $tab = $btn.parents('.lw-tab');
  
  isTabSelected = $tab.hasClass('active');
  
  fileInfo = getFileInfoFromTab($tab);
  
  $btn.blur();
  $tab.remove();
  
  if(isTabSelected){
    setTimeout(function() {
      $('.lw-tab').last().trigger('click');
    }, 5);
  }
  
  messenger.publish.file('fileClosed', fileInfo);
});

messenger.subscribe.file('file.pathInfo', function (fileInfo, envelope) {
  var $tab, useExistingTab;
  
  if (!_.isUndefined(fileInfo.path)) {
    useExistingTab = fileInfo.isSaveAs;
    if(useExistingTab){
      $tab = $tabsContainer.find('.active');
      bindTab($tab, fileInfo);
    } else {
      removeActiveClass();
      $tab = $(template);
      bindTab($tab, fileInfo);
      $tabsContainer.append($tab); 
    }
  }
});