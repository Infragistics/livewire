/// <reference path="typings/node/node.d.ts"/>
/*jslint node: true */
/*jshint esversion: 6 */

const { app, BrowserWindow, globalShortcut } = require('electron');

require('./main-process/application-menus');
require('./main-process/context-menus');

let mainWindow;

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window. 
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  return true;
});

if (shouldQuit) {
  app.quit();
}

app.on('ready', function () {

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: __dirname + '/icon.png'
  });

  mainWindow.show();
  
  //mainWindow.openDevTools();

  mainWindow.loadURL('file://' + __dirname + '/app/index.html');
  
  mainWindow.webContents.on('did-finish-load', function() {
    if(process.platform.toLowerCase() === 'darwin'){
      mainWindow.webContents.send('isMac', true);
    }
  });

  globalShortcut.register('CmdOrCtrl+F12', function () {
    mainWindow.show();
	});

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform.toLowerCase() !== 'darwin') {
    app.quit();
  }
});