var _ = require('lodash');
var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));

const config = require(path.resolve(__dirname, '../config')).get();
const buildFlagsUtil = require(path.resolve(__dirname, '../buildFlags'));

var $buildFlagsContainer = $('#build-flags-container');
var _buildFlags;

var handlers = {
  
  buildFlagList: function(buildFlags){
    $buildFlagsContainer.html('');

    buildFlags = buildFlagsUtil.replaceIndividualFlagsWithProductFlags(buildFlags);
    
    buildFlags.forEach(function(flag){
      $buildFlagsContainer.append('<button data-role="build-flag" data-value="' + flag + '" ' + 
                                  'class="btn btn-default btn-xs">' + flag + '</button>');
    });
  },
  allFilesClosed: function(){
    $buildFlagsContainer.html('');
  }
};

messenger.subscribe.metadata('buildFlags', handlers.buildFlagList);
messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed);

$buildFlagsContainer.on('click', 'button[data-role="build-flag"]', function(e){
  var $button, buildFlag, flags;
  
  $button = $(this);
  buildFlag = $button.data('value');
  
  $('[data-role="build-flag"]').removeClass('selected');
  $button.addClass('selected');
  
  flags = buildFlagsUtil.getAllFromProductFlags([buildFlag]);
  
  messenger.publish.format('buildFlags', flags);
});