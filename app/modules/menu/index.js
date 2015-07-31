(function (module) {

  'use strict';
  
  var remote = require('remote');
  var Menu = remote.require('menu');
  var path = require('path');
  var messenger = require(path.resolve(__dirname, '../messenger'));
  
  var handlers = {
    
    // File 
    newFile:      function(){ messenger.publish.menu('file.new') },
    open:         function(){ messenger.publish.menu('file.open'); },
    save:         function(){ messenger.publish.menu('file.save'); },
    saveAs:       function(){ messenger.publish.menu('file.saveAs'); },
    quit:         function(){ messenger.publish.menu('file.quit'); },
    
    // View
    reload:       function(){ messenger.publish.menu('view.reload'); },
    devTools:     function(){ messenger.publish.menu('view.devToolsToggle'); },
    fullScreen:   function(){ messenger.publish.menu('view.fullScreenToggle'); },
    autoHideMenu: function(){ messenger.publish.menu('view.autoHideMenu'); },
    
    // Help
    issues:       function(){ messenger.publish.menu('help.issues'); },
    about:        function(){ messenger.publish.menu('help.about'); }
  }
  
  var template = [
    {
      label: 'File',
      submenu: [
        { label: 'New',     accelerator: 'CmdOrCtrl+N',       click: handlers.newFile },
        { type: 'separator' },
        { label: 'Open',    accelerator: 'CmdOrCtrl+O',       click: handlers.open    },
        { type: 'separator' },
        { label: 'Save',    accelerator: 'CmdOrCtrl+S',       click: handlers.save    },
        { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', click: handlers.saveAs  },
        { type: 'separator' },
        { label: 'Quit',    accelerator: 'CmdOrCtrl+Q',       click: handlers.quit    },
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload',                accelerator: 'CmdOrCtrl+R',       click: handlers.reload        },
        { label: 'Toggle DevTools',       accelerator: 'CmdOrCtrl+Shift+T', click: handlers.devTools      },
        { label: 'Toggle Full Screen',    accelerator: 'CmdOrCtrl+Shift+F', click: handlers.fullScreen    },
        { label: 'Toggle Auto Hide Menu', accelerator: 'CmdOrCtrl+Shift+H', click: handlers.autoHideMenu  }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Issues',  click: handlers.issues },
        { type: 'separator' },
        { label: 'About',   click: handlers.about  }
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);

} (module.exports));