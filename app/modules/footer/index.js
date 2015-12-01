var _ = require('lodash');
var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));

var $buildFlagsContainer = $('#build-flags-container');
var _buildFlags;

var handlers = {
  
  buildFlagList: function(buildFlags){
    $buildFlagsContainer.html('');
    buildFlags.forEach(function(flag){
      $buildFlagsContainer.append('<button data-role="build-flag" data-value="' + flag + '" class="btn btn-default btn-xs">' + flag + '</button>');
    });
  },
  allFilesClosed: function(){
    $buildFlagsContainer.html('');
  }
};

messenger.subscribe.metadata('buildFlags', handlers.buildFlagList);
messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed);

$buildFlagsContainer.on('click', 'button[data-role="build-flag"]', function(e){
  var $button = $(this);
  var buildFlag = $button.data('value');
  
  $('[data-role="build-flag"]').removeClass('selected');
  
  $button.addClass('selected');
  
  messenger.publish.format('buildFlags', [buildFlag]);
});