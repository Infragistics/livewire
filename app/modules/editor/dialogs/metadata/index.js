module = module.exports;

var $dialog;

var openDialog = () => {
    $dialog.modal();
};

module.init = (formatterModule, dialogModule) => {
    $dialog = $('#metadata-dialog');
    
    formatterModule.editor.commands.addCommand(
        dialogModule.buildDialogCommand('image', 'Ctrl-Shift-M', openDialog));
};