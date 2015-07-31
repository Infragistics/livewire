(function(module){

  'use strict';
  
  require.main.require('./modules/menu');
  require.main.require('./modules/menu/file.js');
  require.main.require('./modules/menu/view.js');
  require.main.require('./modules/menu/help.js');
  require.main.require('./modules/menu/context.js');
  require.main.require('./modules/editor');
  require.main.require('./modules/footer');
  
}(module.exports));