/// <reference path="typings/node/node.d.ts"/>

(function(){

  'use strict';

  var app = require('app');
  var BrowserWindow = require('browser-window');
  var globalShortcut = require('global-shortcut');

  var mainWindow;

  app.on('ready', function () {

    mainWindow = new BrowserWindow({
      width: 1000,
      height: 800
    });

	mainWindow.show();
  
    mainWindow.openDevTools();

    mainWindow.loadUrl('file://' + __dirname + '/app/index.html');
    
    globalShortcut.register('CmdOrCtrl+F12', function(){
			mainWindow.show();
		});

    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

}());