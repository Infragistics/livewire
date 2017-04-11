/*jslint node: true */
/*jshint esversion: 6 */
/* global appSettings */
/* global ace */

module = module.exports;

var
    path = require('path'),
    _ = require('lodash'),
    messenger = require(path.resolve(__dirname, '../messenger')),
    editor,
    $editor,
    $window = $(window),
    suspendPublishSourceChange = false,
    session,
    currentFile = {},
    noop = function () { },
    
    _suspendOnChangeEventHandler = false,
    _isBulkOpen = false;
    
var buildFlags = require('./buildFlags.js');

var setHeight = function(offSetValue){
    $editor.css('height', $window.height() - offSetValue + 'px');
    $window.on('resize', function(e){
        $editor.css('height', $window.height() - offSetValue + 'px');
        editor.resize();
    });
};

var setEditorValueSilent = (value) => {
    _suspendOnChangeEventHandler = true;
    editor.setValue(value.trim(), -1);
    
    // needed to work around ACE's tendancy
    // to raise change events after setting
    // the value of the editor imperativley
    setTimeout(() => {
        _suspendOnChangeEventHandler = false;
    }, 1000);
};

module.load = function (mode) {
    
    $editor = $('#editor');
    
    setHeight(appSettings.editingContainerOffset());

    $editor.css('width', appSettings.editorWidth());

    editor = ace.edit('editor');
    editor.setOptions({
        fontSize: '18px',
        theme: 'ace/theme/github',
        showPrintMargin: false,
        highlightActiveLine: false,
        showGutter: false,
        readOnly: true
    });

    editor.setOption('spellcheck', true);

    var showCursor = function () {
        editor.renderer.$cursorLayer.element.style.opacity = 1;
    };

    var hideCursor = function () {
        editor.renderer.$cursorLayer.element.style.opacity = 0;
    };

    var supressAceDepricationMessage = function () {
        editor.$blockScrolling = Infinity;
    };

    var activateEditor = function () {
        if (editor.getReadOnly()) {
            editor.setReadOnly(false);
            showCursor();
        }
    };

    hideCursor(/* until a file is opened or new one is created */);

    supressAceDepricationMessage();

    session = editor.getSession();
    session.setMode('ace/mode/' + mode);
    session.setUseWrapMode(true);

    require('./spellcheck');
    require('./clipboard.js').init(editor);
    require('./formatting.js').init(editor);

    var handlers = {

        menuNew: function () {
            activateEditor();
        },

        toggleLineNumbers: function() {
            editor.setOption('showGutter', !editor.getOption('showGutter'));
        },

        fileNew: function () {
            editor.scrollToLine(0);
        },
        
        contentChangedInternal: function(){
            if(!_isBulkOpen) {
                if(!_suspendOnChangeEventHandler){
                    var value = editor.getValue();
                    if(value.length > 0){
                        currentFile.contents = value;
                        buildFlags.detect(currentFile.contents);
                        
                        if(!suspendPublishSourceChange){
                            messenger.publish.file('sourceChange', currentFile);
                            messenger.publish.file('sourceDirty', currentFile.id);
                        }
                    }
                }
            }
        },

        contentChangedExternal: function (fileInfo) {
            var rowNumber;

            if (_.isObject(fileInfo)) {

                activateEditor();

                currentFile = fileInfo;

                if (fileInfo.isBlank) {
                    hideCursor();
                    setEditorValueSilent('');
                } else {
                    suspendPublishSourceChange = true;
                    
                    showCursor();
                    
                    buildFlags.detect(fileInfo.contents);
                    
                    setEditorValueSilent(fileInfo.contents);

                    if (fileInfo.cursorPosition) {
                        rowNumber = fileInfo.cursorPosition.row;
                        editor.selection.moveCursorToPosition(fileInfo.cursorPosition);
                        editor.scrollToLine(rowNumber, true /* attempt to center in editor */, true /* animate */, noop);
                    } else {
                        editor.scrollToLine(0, false, false, noop);
                    }
                    
                    suspendPublishSourceChange = false;
                }

                editor.focus();
                editor.selection.clearSelection();
            }
        },
        
        showResults: function(){              
            $editor.css('width', appSettings.editorWidth());
            handlers.contentChangedInternal();
            editor.resize();    
        },
        
        hideResults: function(){    
            $editor.css('width', ($window.width() - appSettings.resultsButtonWidth() + 1) + 'px');
            editor.resize();    
        },
        
        modalClosed: function () {
            editor.focus();
        },

        getContextMenuInfo: () => {
            var 
                  editor = ace.edit('editor')
                , selectionRange = editor.getSelectionRange()
                , hasTextSelection
                , mispelledWord = ''
                , info = {};

            hasTextSelection = (selectionRange.start.column !== selectionRange.end.column);

            if(hasTextSelection) {
                // text is selected to cut, copy or paste -
                // just notify the main process to render the
                // context menu
                messenger.publish.file('context-menu-info-response', info);
            } else {
                editor.selection.selectWord();
                mispelledWord = editor.getSelectedText();

                info.mispelledWord = mispelledWord;

                messenger.publish.file('mispellings-request', info);
            }
        },

        replaceMissspelling: (info) => {
            ace.edit('editor').session.replace(editor.selection.getRange(), info.replacementWord);
        }
    };
    
    editor.on('change', _.throttle(handlers.contentChangedInternal, 1000));
    editor.focus();

    messenger.subscribe.menu('toggleLineNumbers', handlers.toggleLineNumbers);
    messenger.subscribe.menu('new', handlers.menuNew);
    messenger.subscribe.file('contentChanged', handlers.contentChangedExternal);
    messenger.subscribe.file('new', handlers.fileNew);
    messenger.subscribe.file('beforeBulkOpen', () => _isBulkOpen = true);
    messenger.subscribe.file('afterBulkOpen', () => _isBulkOpen = false);
    messenger.subscribe.layout('showResults', handlers.showResults);
    messenger.subscribe.layout('hideResults', handlers.hideResults);
    messenger.subscribe.dialog('modal.closed', handlers.modalClosed);
    messenger.subscribe.file('context-menu-info-request', handlers.getContextMenuInfo);
    messenger.subscribe.file('replace-misspelling', handlers.replaceMissspelling)
};

module.load('asciidoc');