/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));
const ipc = require('electron').ipcRenderer;

require('./file.js');
require('./view.js');
require('./help.js');
require('./context.js');

ipc.send('application-menu-init');

let handlers = {
    
  // File 
  newMarkdownFile: () =>  messenger.publish.menu('new', { format: 'markdown' }),
  newAsciiDocFile: () =>  messenger.publish.menu('new', { format: 'asciidoc' }),
  open: () =>  messenger.publish.menu('open'),
  save: () =>  messenger.publish.menu('save'),
  saveAs: () =>  messenger.publish.menu('saveAs'),
  saveAsHtml: () =>  messenger.publish.menu('saveAsHtml'),
  loadDocsConfig: () => messenger.publish.menu('loadDocsConfig'),
  quit: () =>  messenger.publish.menu('quit'),

  // Format
  toggleLineNumbers: () => messenger.publish.menu('toggleLineNumbers'),
    
  // View
  reload: () =>  messenger.publish.menu('reload'),
  devTools: () =>  messenger.publish.menu('devToolsToggle'),
  fullScreen: () =>  messenger.publish.menu('fullScreenToggle'),
  autoHideMenu: () =>  messenger.publish.menu('autoHideMenu'),
    
  // Help
  issues: () =>  messenger.publish.menu('issues'),
  about: () =>  messenger.publish.menu('about')
};

ipc.on('application-menu-file-new-asciidoc', handlers.newAsciiDocFile);
ipc.on('application-menu-file-new-markdown', handlers.newMarkdownFile);
ipc.on('application-menu-file-open', handlers.open);
ipc.on('application-menu-file-save', handlers.save);
ipc.on('application-menu-file-save-as', handlers.saveAs);
ipc.on('application-menu-file-save-as-html', handlers.saveAsHtml);
ipc.on('application-menu-file-quit', handlers.quit);
ipc.on('application-menu-format-toggle-line-numbers', handlers.toggleLineNumbers);
ipc.on('application-menu-view-reload', handlers.reload);
ipc.on('application-menu-view-dev-tools', handlers.devTools);
ipc.on('application-menu-view-full-screen', handlers.fullScreen);
ipc.on('application-menu-view-auto-hide', handlers.autoHideMenu);
ipc.on('application-menu-help-issues', handlers.issues);
ipc.on('application-menu-help-about', handlers.about);
ipc.on('application-menu-load-docs-config', handlers.loadDocsConfig);