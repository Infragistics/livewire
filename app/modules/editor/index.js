/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global appSettings */
/* global ace */

module = module.exports;

var
    path = require('path'),
    _ = require('lodash'),
    messenger = require(path.resolve(__dirname, '../messenger')),
    editor,
    $editor,
    $resultsButton,
    $window = $(window),
    session,
    currentFile = {},
    noop = function () { };


var _buildFlags = [];

var setHeight = function(offSetValue){
    $editor.css('height', $window.height() - offSetValue + 'px');
    $window.on('resize', function(e){
        $editor.css('height', $window.height() - offSetValue + 'px');
    });
};

module.load = function (mode) {
    
    $editor = $('#editor');
    $resultsButton = $('#result-button');
    
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

    require('./clipboard.js').init(editor);
    require('./formatting.js').init(editor);

    var buildFlagsExpression = /ifdef::(.*?)\[\]/g;

    var getBuildFlags = function (content) {
        var flags, buildFlags;

        flags = content.match(buildFlagsExpression);
        buildFlags = [];

        if (flags) {
            flags.forEach(function (flag) {
                flag = flag.replace(buildFlagsExpression, function (match) {
                    return match.replace('ifdef::', '').replace('[]', '');
                });

                buildFlags = buildFlags.concat(flag.split(','));
            });

            buildFlags = _.unique(buildFlags).sort();

            if (_.difference(buildFlags, _buildFlags).length > 0) {
                _buildFlags = buildFlags;
                messenger.publish.metadata('buildFlags', buildFlags);
            }
        }
    };

    var handlers = {

        menuNew: function () {
            activateEditor();
        },

        fileNew: function () {
            _buildFlags = [];
            editor.scrollToLine(0);
        },
        
        opened: function(fileInfo){
            if(fileInfo.size >= appSettings.largeFileSizeThresholdBytes()){
                handlers.hideResults();
            }
        },
        
        contentChangedInEditor: function(){
            var value = editor.getValue();
            if(value.length > 0){
                currentFile.contents = value;
                getBuildFlags(currentFile.contents);
                messenger.publish.file('sourceChange', currentFile);
            }
        },

        contentChanged: function (fileInfo) {
            var rowNumber;

            if (_.isObject(fileInfo)) {

                activateEditor();

                currentFile = fileInfo;

                if (fileInfo.isBlank) {
                    hideCursor();
                    editor.setValue('');
                } else {
                    showCursor();

                    _buildFlags = [];

                    getBuildFlags(fileInfo.contents);

                    editor.setValue(fileInfo.contents);

                    if (fileInfo.cursorPosition) {
                        rowNumber = fileInfo.cursorPosition.row;
                        editor.selection.moveCursorToPosition(fileInfo.cursorPosition);
                        editor.scrollToLine(rowNumber, true /* attempt to center in editor */, true /* animate */, noop);
                    } else {
                        editor.scrollToLine(0, false, false, noop);
                    }
                }

                editor.focus();
                editor.selection.clearSelection();
            }
        },
        
        showResults: function(){              
            $editor.css('width', appSettings.editorWidth());
            handlers.contentChangedInEditor();
        },
        
        hideResults: function(){
            $editor.css('width', ($window.width() - appSettings.resultsButtonWidth() + 1) + 'px');  
        }
    };
    
    handlers.contentChangedInEditor();
    editor.on('change', handlers.contentChangedInEditor);
    editor.focus();

    messenger.subscribe.menu('new', handlers.menuNew);
    messenger.subscribe.file('contentChanged', handlers.contentChanged);
    messenger.subscribe.file('new', handlers.fileNew);
    messenger.subscribe.file('opened', handlers.opened)
    messenger.subscribe.layout('showResults', handlers.showResults);
    messenger.subscribe.layout('hideResults', handlers.hideResults);
};

module.load('asciidoc');