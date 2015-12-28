/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global ace */

module = module.exports;

var
    path = require('path'),
    _ = require('lodash'),
    messenger = require(path.resolve(__dirname, '../messenger')),
    editor,
    session,
    currentFile = {},
    noop = function () { };


var _buildFlags = [];

module.load = function (mode) {

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

    var onChange = function () {
        currentFile.contents = editor.getValue();
        getBuildFlags(currentFile.contents);
        messenger.publish.file('sourceChange', currentFile);
    };

    onChange();

    editor.on('change', onChange);

    editor.focus();

    var handlers = {

        menuNew: function () {
            activateEditor();
        },

        fileNew: function () {
            _buildFlags = [];
            editor.scrollToLine(0);
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
                    }
                }

                editor.focus();
                editor.selection.clearSelection();

            }
        }
    };

    messenger.subscribe.menu('new', handlers.menuNew);
    messenger.subscribe.file('contentChanged', handlers.contentChanged);
    messenger.subscribe.file('new', handlers.fileNew);
};

module.load('asciidoc');