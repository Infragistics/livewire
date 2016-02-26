module = module.exports;

const
    _ = require('lodash'),
    path = require('path'),
    data = require(path.resolve(__dirname, '../../../../data')),
    messenger = require(path.resolve(__dirname, '../../../messenger'));

var 
    $dialog,
    $doneButton,
    $controlNameBox,
    $tagsContainer,
    $tagsCheckboxes,
    
    _controls,
    _tags,
    
    _metadata;

var openDialog = () => {
    $dialog.modal();
};

var substringMatcher = (strs) => {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, (i, str) => {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

var bind = () => {
    $tagsCheckboxes.prop('checked', 'false');
    
    $controlNameBox.typeahead('val', _metadata.controlName.join(','));
        
    _metadata.tags.forEach((tag) => {
        $(`#metadata-dialog [data-tag="${tag}"]`).prop('checked', 'true');
    });
};

module.init = (formatterModule, dialogModule) => {
    
    $dialog = $('#metadata-dialog');
    $doneButton = $('#metadata-done-button');
    $controlNameBox = $('#metadata-control-name-box');
    $tagsContainer = $('#metadata-tags-container');
    $tagsCheckboxes = $tagsContainer.find('input [type="checkbox"]');
    
    formatterModule.editor.commands.addCommand(
        dialogModule.buildDialogCommand('image', 'Ctrl-Shift-M', openDialog));
        
    data.getTags().then((tags) => {
        _tags = tags;
        
        var id, tagText;
        _tags.forEach((tag) => {
            id = 'tag-' + tag.en.toLowerCase().replace(' ','-');
            tagText = tag.en;
            $tagsContainer.append(`<div>
                                    <input type="checkbox" data-tag="${tagText}" id="${id}" />
                                    <label for="${id}">${tagText}</label>
                                   </div>`);
        });
    });
        
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
    
    $dialog.on('shown.bs.modal', (e) => {
        $controlNameBox.focus();
        bind();
        
        // typeahead shows the suggestion list by default
        // and it takes a little time to build it
        // this ensures it is closed after focus is set 
        // to the box
        setTimeout(function() {
            $controlNameBox.typeahead('close');
        }, 5);
    });
        
    $doneButton.click((e) => {
        var checkboxes = $tagsContainer.find(':checked');
        var tags = [];
        
        checkboxes.each((index, checkbox) => {
            var $checkbox = $(checkbox);
            tags.push($checkbox.data('tag'));
        });
        
        _metadata.tags = tags;
        _metadata.controlName = $controlNameBox.typeahead('val').split(',');
        
        messenger.publish.metadata('metadataChanged', _metadata);
        
        checkboxes.attr('checked', false);
        $controlNameBox.val('');
        
        $dialog.modal('hide');
    })
};

var handlers = {
    fileOpened: (e) => {
        _metadata = e.metadata;
    },
    contentChanged: (selectedFileInfo) => {
        if(selectedFileInfo && selectedFileInfo.metadata){
            _metadata = selectedFileInfo.metadata;
        } else {
            _metadata = {};
        }
    }
};

messenger.subscribe.file('opened', handlers.fileOpened);
messenger.subscribe.file('contentChanged', handlers.contentChanged);