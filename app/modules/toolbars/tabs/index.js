/// <reference path="../../../../typings/node/node.d.ts"/>
/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

module = module.exports;

var 
  path = require('path'),
  messenger = require(path.resolve(__dirname, '../../messenger')),
  _ = require('lodash'),
  shell = require('shell'),

  
  $tabsContainer = $('#lw-tabs'),
  $tabs = null,
  
  template = '<div class="lw-tab active" title="PATH">NAME <button class="lw-close" title="close" data-path="PATH"><i class="fa fa-times-circle-o"></i></button></div>',
  file = { name: '', path: '' };
  
var removeActiveClass = function(){
  $('.lw-tab').removeClass('active');
};

var clearSelection = function(){
  window.getSelection().empty();  
};

// Switch documents
$tabsContainer.on('click', '.lw-tab', function(e){
  removeActiveClass();
  $(this).addClass('active');
});

// Open file in Explorer/Finder
$tabsContainer.on('dblclick', '.lw-tab', function(e){
  var filePath = $(this).attr('title');
  clearSelection();
  shell.showItemInFolder(filePath);
});

// Close tab
$tabsContainer.on('click', '.lw-close', function(e){
  var $btn, $tab, isTabSelected;
  
  debugger;
  
  $btn = $(this);
  $tab = $btn.parents('.lw-tab');
  
  isTabSelected = $tab.hasClass('active');
  
  $btn.blur();
  $tab.remove();
  
  if(isTabSelected){
    setTimeout(function() {
      $('.lw-tab').last().trigger('click');
    }, 5);
  }
  
  e.stopPropagation();
  
});

messenger.subscribe.file('file.pathInfo', function (data, envelope) {

  if (!_.isUndefined(data.path)) {
        
    removeActiveClass();
    
    file.path = data.path;
    file.name = path.basename(file.path);

    var tab = template.replace(/PATH/g, file.path);
    tab = tab.replace(/NAME/, file.name);
    $tabsContainer.append(tab);
  }
});