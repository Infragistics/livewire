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

const clone = (obj) => JSON.parse(JSON.stringify(obj));

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
        
        if(!/^http/.test(filePath)){
            filePath = filePath.replace(new RegExp('\\.(' + formatterModule.formatter.extensions.join('|') + ')$'), '.html');
            filePath = fileNameCleaner.clean(filePath);
        }

        format = clone(formatterModule.formatter.shortcuts.link);

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

    $browseBtn.click(() => {
        var options = {
            title: 'Select A File',
            properties: ['openFile'],
            filters: [{ name: formatterModule.formatter.name, extensions: formatterModule.formatter.extensions }]
        };
        nodeDialog.showOpenDialog(options, createLink);
    });
    
    $doneBtn.click(() => {
        createLink($linkInput.val());
    });
};