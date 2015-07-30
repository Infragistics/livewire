(function (module) {

  'use strict';

  var path = require('path');
  var remote = require('remote');
  var app = remote.require('app');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  
  // most of the file menu collaborates directly with the ACE editor,
  // therefore you will find the rest of the implementation in
  // modules/editor/persistence.js
  
  messenger.subscribe.menu('file.quit', function(){
    var quit = confirm('Are you sure you want to close this application?');
		if(quit) {
			app.quit();
		}
  });

} (module.exports));