/*jslint node: true */
/*jshint esversion: 6 */
/* global ace */

module = module.exports;

var
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),

    dialogs = require(path.resolve(__dirname, '../dialogs')),
    messenger = require(path.resolve(__dirname, '../messenger')),
    formats = require(path.resolve(__dirname, '../formats')),
    files = require(path.resolve(__dirname, '../files')),

    filePath = '',
    basePath = '',
    formatter = null,
    $result = $('#result'),
    BOM = '\ufeff';

const saveAsHtmlBeforeSaveRules = require('./saveAsHtml-before-save-rules.js');

messenger.subscribe.file('pathChanged', (data, envelope) => {
    if (data.isNewFile) {
        filePath = '';
        basePath = '';
    }
});

var menuHandlers = {

    newFile: (data, envelope) => {
        var formatName, fileInfo;

        filePath = '';
        basePath = '';

        formatName = envelope.data.format;
        formatter = formats.get(formatName);

        fileInfo = files.getFileInfo(null, formatter);

        messenger.publish.file('newId', { id: fileInfo.id, path: fileInfo.path, formatter: formatter });
        messenger.publish.file('pathChanged', fileInfo);

        fileInfo.contents = formatter.defaultContent;
        messenger.publish.file('new', fileInfo);
        messenger.publish.file('opened', fileInfo);
    },

    open: (filePaths) => {
        

        let openFile = (response) => {
            var fileInfo, fileContents, metadataMatches, metadata;

            filePath = response.path;
            basePath = path.dirname(filePath);

            fileInfo = files.getFileInfo(response.path);
            fileInfo.size = response.size;

            formatter = formats.getByFileExtension(fileInfo.ext);

            messenger.publish.file('newId', { id: fileInfo.id, path: fileInfo.path });
            messenger.publish.file('pathChanged', fileInfo);

            if (!fileInfo.isFileAlreadyOpen) {
                fileContents = _.trimLeft(response.content, BOM);
                
                metadataMatches = fileContents.match(formatter.metadataPatterns.full);
                
                if(metadataMatches){
                    metadata = metadataMatches[0].replace(formatter.metadataPatterns.left, '');
                    metadata = metadata.replace(formatter.metadataPatterns.right, '');
                    fileInfo.metadata = JSON.parse(metadata);  
                }
                
                fileContents = fileContents.replace(formatter.metadataPatterns.full, '');
                fileContents = _.trimLeft(fileContents, '\n\n');
                
                fileInfo.contents = fileContents;
                messenger.publish.file('opened', fileInfo);
            }
        };

        if(filePaths) {
            filePaths.forEach((filePath) => {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    openFile({ path: filePath, content: data });
                });
            });
        } else {
            let options, supportedFormats, allFormats;

            options = {
                title: 'Open',
                filters: []
            };

            supportedFormats = formats.getAll();

            allFormats = {
                name: 'All',
                extensions: []
            };

            supportedFormats.forEach((format) => {
                options.filters.push({ name: format.name, extensions: format.extensions });
                allFormats.extensions = allFormats.extensions.concat(format.extensions);
            });

            options.filters.unshift(allFormats);

            dialogs.openFile(options).then(openFile).catch((error) => {
                debugger;
                console.log(error);
            });
        }
    },

    save: (data, envelope) => {
        var fileContent, editor;
        editor = ace.edit('editor');
        fileContent = editor.getValue();

        if (fileContent.length > 0) {
            if (filePath.length > 0) {

                var metadata = files.getCurrentMetadataString(formatter);
                
                if (!_.startsWith(fileContent, BOM)) {
                    fileContent = BOM + metadata + fileContent;
                }

                fs.writeFile(filePath, fileContent, { encoding: 'utf8' }, (err) => {
                    console.log(err);
                });

                messenger.publish.file('isCleanByFilePath', filePath);
            } else {
                menuHandlers.saveAs(data, envelope);
            }
        }
    },

    saveAs: (data, envelope) => {
        var fileContent, options, defaultExtension, editor;

        editor = ace.edit('editor');
        fileContent = editor.getValue();

        options = {
            title: 'Save File',
            filters: []
        };

        var metadata = files.getCurrentMetadataString(formatter);
                
        if (!_.startsWith(fileContent, BOM)) {
            fileContent = BOM + metadata + fileContent;
        }

        defaultExtension = '';

        if (formatter !== null) {
            defaultExtension = formatter.defaultExtension;
        }

        options.filters.push({ name: formatter.name, extensions: [formatter.defaultExtension] });

        dialogs.saveFile(fileContent, options, defaultExtension).then((newFilePath) => {
            var fileInfo;

            filePath = newFilePath;
            basePath = path.dirname(filePath);

            fileInfo = files.getCurrentFileInfo();
            fileInfo.fileName = path.basename(filePath);
            fileInfo.basePath = path.dirname(filePath);
            fileInfo.isFileAlreadyOpen = false;
            fileInfo.isSaveAs = true;

            messenger.publish.file('titleChanged', fileInfo);
            messenger.publish.file('pathChanged', fileInfo);
            messenger.publish.file('rerender');
            messenger.publish.file('saveAsComplete', { id: files.getCurrentID(), path: filePath });

            // publishing isCleanByFilePath must come after publishing saveAsComplete
            messenger.publish.file('isCleanByFilePath', filePath);
        }).catch((error) => {
            debugger;
            console.log(error);
        });

    },

    saveAsHtml: (data, envelope) => {
        var options, exp, html;

        options = {
            title: 'Save As HTML',
            filters: [
                { name: 'HTML', extensions: ['html'] }
            ]
        };
        
        html = $result.html();
        html = saveAsHtmlBeforeSaveRules.apply(html, { 'basePath': basePath }, $);

        dialogs.saveFile(html, options, 'html').catch((err) => {
            // todo: handle error
            console.log(err);
        });
    }
};

var fileHandlers = {
    fileSelected: (fileInfo, envelope) => {
        filePath = fileInfo.path;
        basePath = fileInfo.basePath;
        formatter = formats.getByFileExtension(fileInfo.ext);
    }
};

messenger.subscribe.menu('new', menuHandlers.newFile);
messenger.subscribe.menu('open', menuHandlers.open);
messenger.subscribe.menu('save', menuHandlers.save);
messenger.subscribe.menu('saveAs', menuHandlers.save);
messenger.subscribe.menu('saveAsHtml', menuHandlers.saveAsHtml);

messenger.subscribe.file('selected', fileHandlers.fileSelected);