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
    $window = $(window),
    suspendPublishSourceChange = false,
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
        
        contentChangedInternal: function(){
            var value = editor.getValue();
            if(value.length > 0){
                currentFile.contents = value;
                getBuildFlags(currentFile.contents);
                
                if(!suspendPublishSourceChange){
                    messenger.publish.file('sourceChange', currentFile);
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
                    editor.setValue('');
                } else {
                    suspendPublishSourceChange = true;
                    
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
                    
                    suspendPublishSourceChange = false;
                }

                editor.focus();
                editor.selection.clearSelection();
            }
        },
        
        showResults: function(){              
            $editor.css('width', appSettings.editorWidth());
            handlers.contentChangedInternal();
        },
        
        hideResults: function(){
            $editor.css('width', ($window.width() - appSettings.resultsButtonWidth() + 1) + 'px');  
            $editor.width(($window.width() - appSettings.resultsButtonWidth() + 1));  
        }
    };
    
    editor.on('change', _.throttle(handlers.contentChangedInternal, 1000));
    editor.focus();

    messenger.subscribe.menu('new', handlers.menuNew);
    messenger.subscribe.file('contentChanged', handlers.contentChangedExternal);
    messenger.subscribe.file('new', handlers.fileNew);
    messenger.subscribe.layout('showResults', handlers.showResults);
    messenger.subscribe.layout('hideResults', handlers.hideResults);
};

module.load('asciidoc');