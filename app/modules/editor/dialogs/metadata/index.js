module = module.exports;

const
    _ = require('lodash'),
    path = require('path'),
    data = require(path.resolve(__dirname, '../../../../data'));

var 
    $dialog,
    $doneButton,
    $controlNameBox,
    
    _controls;

var openDialog = () => {
    $dialog.modal();
};

module.init = (formatterModule, dialogModule) => {
    
    $dialog = $('#metadata-dialog');
    $doneButton = $('#metadata-done-button');
    $controlNameBox = $('#metadata-control-name-box');
    
    formatterModule.editor.commands.addCommand(
        dialogModule.buildDialogCommand('image', 'Ctrl-Shift-M', openDialog));
        
    data.getControls().then((controls => {
        _controls = controls;
        
        var allControls = [];
        
        var keys = _.keys(_controls);
        keys.forEach((key) => {
            allControls = allControls.concat(_controls[key]);
        });
        
        $controlNameBox.typeahead(
            { hint: true, highlight: true, minLength: 1 },
            { name: 'controls', source: substringMatcher(allControls) });
    }));
        
    $doneButton.click((e) => {
        
        $dialog.modal('hide');
    })
};

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};