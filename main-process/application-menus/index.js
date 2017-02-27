/*jslint node: true */
/*jshint esversion: 6 */

const { Menu, app, ipcMain } = require('electron');

let sender = null;
let send = (name) => sender.send(`application-menu-${name}`);
let template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        submenu: [
          { label: 'AsciiDoc', accelerator: 'CmdOrCtrl+N', click: () => send('file-new-asciidoc') },
          { label: 'Markdown', accelerator: 'CmdOrCtrl+Shift+N', click: () => send('file-new-markdown') },
        ]
      },
      { type: 'separator' },
      { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => send('file-open') },
      { type: 'separator' },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('file-save') },
      { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('file-save-as') },
      { label: 'Save As HTML', accelerator: 'CmdOrCtrl+Shift+H', click: () => send('file-save-as-html') },
      { type: 'separator' },
      { label: 'Load DocsConfig.xml', accelerator: 'CmdOrCtrl+Shift+D', click: () => send('load-docs-config') },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => send('file-quit') },
    ]
  },
  {
    label: 'Format',
    submenu: [
      { label: 'Line Numbers', click: () => send('format-toggle-line-numbers') },
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => send('view-reload') },
      { label: 'Toggle DevTools', accelerator: 'CmdOrCtrl+Shift+T', click: () => send('view-dev-tools') }
    ]
  },
  {
    label: 'Help',
    submenu: [
      { label: 'Issues', click: () => send('help-issues') },
      { type: 'separator' },
      { label: 'About', click: () => send('help-about') }
    ]
  }
];

ipcMain.on('application-menu-init', (e, args) => {
    sender = e.sender;
});

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});