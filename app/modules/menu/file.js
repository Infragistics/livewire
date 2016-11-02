
const path = require('path');
const { remote } = require('electron');
const app = remote.app;
const messenger = require(path.resolve(__dirname, '../messenger'));
  
// most of the file menu collaborates directly with the ACE editor,
// therefore you will find the rest of the implementation in
// modules/editor/persistence.js
  
messenger.subscribe.menu('quit', function () {
  let quit = confirm('Are you sure you want to close Livewire?');
		if (quit) {
      app.quit();
		}
});