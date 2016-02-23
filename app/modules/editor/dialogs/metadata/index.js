module = module.exports;

const
    path = require('path'),
    data = require(path.resolve(__dirname, '../../../../data'));

var 
    $dialog,
    $doneButton;

var openDialog = () => {
    $dialog.modal();
};

module.init = (formatterModule, dialogModule) => {
    
    $dialog = $('#metadata-dialog');
    $doneButton = $('#metadata-done-button');
    
    formatterModule.editor.commands.addCommand(
        dialogModule.buildDialogCommand('image', 'Ctrl-Shift-M', openDialog));
        
    data.getControls().then((controls => {
        console.log(controls);
    }));
        
    $doneButton.click((e) => {
        
        $dialog.modal('hide');
    })
};