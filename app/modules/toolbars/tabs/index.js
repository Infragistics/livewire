/// <reference path="../../../../typings/node/node.d.ts"/>
/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

module = module.exports;

var 
  path = require('path'),
  messenger = require(path.resolve(__dirname, '../../messenger')),
  _ = require('lodash'),
  shell = require('shell'),

  $tabsContainer = $('#lw-tabs'),  
  template = '<div class="lw-tab active" title="PATH">NAME <button class="lw-close" title="close" data-path="PATH"><i class="fa fa-times-circle-o"></i></button></div>';
  
var removeActiveClass = function(){
  $('.lw-tab').removeClass('active');
};

var clearSelection = function(){
  window.getSelection().empty();  
};

// Switch documents
$tabsContainer.on('click', '.lw-tab', function(e){
  removeActiveClass();
  
  var $tab = $(this);
  $tab.addClass('active');
  
  var filePath = $tab.attr('title');
  
  messenger.publish.file('fileSelected', {filePath: filePath});
});

// Open file in Explorer/Finder
$tabsContainer.on('dblclick', '.lw-tab', function(e){
  var filePath = $(this).attr('title');
  clearSelection();
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

messenger.subscribe.file('file.pathInfo', function (data, envelope) {
  if (!_.isUndefined(data.path)) {
    removeActiveClass();
    var tab = template.replace(/PATH/g, data.path);
    tab = tab.replace(/NAME/, data.fileName);
    $tabsContainer.append(tab);
  }
});