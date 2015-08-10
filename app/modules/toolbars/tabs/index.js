module = module.exports;

var path = require('path');
var messenger = require(path.resolve(__dirname, '../../messenger'));
var _ = require('lodash');

var $tabs = $('#lw-tabs')

var template = '<div class="tab active" title=""><span class="name"></span> <button title="close" data-path=""><i class="fa fa-times-circle-o"></i></button></div>';

var file = {
	name: "",
	path: ""
}; 

messenger.subscribe.file('file.pathInfo', function (data, envelope) {

  if (!_.isUndefined(data.path)) {
    
    file.path = data.path;
    file.name = path.basename(file.path);
    
    var $tab = $(template);
    $tab.find('.name').text(file.name);
    $tab.attr('title', file.path);
    $tab.find('button').attr('data-path', file.path);
    $tabs.append($tab);
  }
});