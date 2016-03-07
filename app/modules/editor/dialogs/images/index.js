module = module.exports;

const 
    dialogs = require('../../../dialogs'),
    _ = require('lodash'),
    path = require('path'),
    messenger = require(path.resolve(__dirname, '../../../messenger'));

var 
    $dialog, 
    $imagePathTextbox, 
    $browseButton,
    $doneButton;
    
var
    formatterModule,
    basePath;

var openDialog = () => {
    var options = {
        title: 'Select an Image',
        filters: [{ name: 'Images', extensions: ['png','jpg', 'gif'] }]
    };

    dialogs.openFile(options)
        .catch((error) => {
            dialogs.error('Error while attempting to add image', error);
        })
        .then((imageFileInfo) => {
            var format = _.clone(formatterModule.formatter.shortcuts.image);
            var relativePath = path.relative(basePath, imageFileInfo.path);
            format.left = format.left.replace('{0}', relativePath); 
            format.right = format.right.replace('{0}', relativePath); 
            formatterModule.wrapSelectedText(format);
        });
};

module.init = (formatterMod, dialogModule) => {
    formatterModule = formatterMod;
    formatterModule.editor.commands.addCommand(dialogModule.buildDialogCommand('image', 'Ctrl-Shift-I', openDialog));
};

messenger.subscribe.file('pathChanged', function (data, envelope) {
  basePath = data.basePath;
});