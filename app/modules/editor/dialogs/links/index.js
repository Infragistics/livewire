module = module.exports;

const 
    path = require('path'),
    messenger = require(path.resolve(__dirname, '../../../messenger')),
    remote = require('remote'),
    nodeDialog = remote.require('dialog'),
    fileNameCleaner =  require('../../fileNameCleaner.js');
    
var 
    $browseDialog, 
    $linkInput, 
    $browseBtn, 
    $doneBtn,   
    formatterModule;

var createLink = (filePaths) => {
    var filePath, format, side;
    if (!filePaths || !filePaths.length) {
        console.log('No file paths selected');
    } else {
        if (typeof filePaths === 'string') {
            filePath = filePaths;
        } else {
            filePath = path.basename(filePaths[0]);
        }
        
        // transform file name:
        filePath = filePath.replace(new RegExp('\\.(' + formatterModule.formatter.extensions.join('|') + ')$'), '.html');
        filePath = fileNameCleaner.clean(filePath);

        format = $.extend({}, formatterModule.formatter.shortcuts.link);

        side = /\{0\}/.test(format.left) ? 'left' : 'right';

        format[side] = format[side].replace('{0}', filePath);
        formatterModule.wrapSelectedText(format);
    }
    $browseDialog.modal('hide');
    $linkInput.val('').off('keyup');
    formatterModule.editor.focus();
};

module.init = (formatterMod, dialogModule) => {
    formatterModule = formatterMod;
    
    formatterModule.editor.commands.addCommand(dialogModule.buildDialogCommand('link', 'Ctrl-K', () => {
        $browseDialog.modal();
    }));
    
    $browseDialog = $('#browseDialog');
    $linkInput = $('#linkInput');
    $browseBtn = $('#browseBtn');
    $doneBtn = $('#doneBtn');

    $browseDialog.on('shown.bs.modal', (e) => {
        $linkInput.focus();
        $linkInput.on('keyup', (e) => {
            if (e.keyCode === 13) {
                createLink($linkInput.val());
            }
        });
    });

    $browseBtn.one('click', () => {
        var options = {
            title: 'Select A File',
            properties: ['openFile'],
            filters: [{ name: formatterModule.formatter.name, extensions: formatterModule.formatter.extensions }]
        };
        nodeDialog.showOpenDialog(options, createLink);
    });
    
    $doneBtn.one('click', () => {
        createLink($linkInput.val());
    });
};