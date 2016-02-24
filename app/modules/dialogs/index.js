/*
 *
 * A lightweight wrapper around the native dialog API
 * in order to make a more explicit, promise-based API.
 * 
 */
module = module.exports;

var _ = require('lodash');
var fs = require('fs');

var remote = require('remote');
var dialog = remote.require('dialog');

module.openFile = function (options) {
    return new Promise((resolve, reject) => {
        var dialogOptions = {
            properties: ['openFile']
        };

        if (!_.isUndefined(options)) {
            dialogOptions = _.defaults(dialogOptions, options);
        }

        var callback = function (filePaths) {
            if (_.isUndefined(filePaths)) {
                reject();
            } else {
                var filePath = filePaths[0];
                fs.stat(filePath, function(statError, fileStats){
                    var bytes = fileStats['size'];
                    fs.readFile(filePath, 'utf8', function (err, contents) {
                        if (err) reject(err);
                        var result = {
                            path: filePath,
                            content: contents,
                            size: bytes
                        }
                        resolve(result);
                    });
                });
            }
        };

        dialog.showOpenDialog(dialogOptions, callback); 
    });
};

module.openDirectory = function (options) {
	return new Promise((resolve, reject) => {
        var dialogOptions = {
            properties: ['openDirectory', 'multiSelections']
        };

        if (!_.isUndefined(options)) {
            dialogOptions = _.defaults(dialogOptions, options);
        }

        var callback = function (directoryPaths) {
            directoryPaths = (_.isUndefined(directoryPaths)) ? [] : directoryPaths;
            resolve(directoryPaths);
        };

        dialog.showOpenDialog(dialogOptions, callback); 
    });
};

module.createDirectory = function (options) {
	return new Promise((resolve, reject) => {
        var dialogOptions = {
            properties: ['createDirectory']
        };

        if (!_.isUndefined(options)) {
            dialogOptions = _.defaults(dialogOptions, options);
        }

        var callback = function (directoryPath) {
            resolve(directoryPath);
        };

        dialog.showOpenDialog(dialogOptions, callback); 
    });
};

module.saveFile = function (content, options, defaultExtension) {
	return new Promise((resolve, reject) => {
        var dialogOptions = {};

        if (!_.isUndefined(options)) {
            dialogOptions = _.defaults(dialogOptions, options);
        }

        var callback = function (filePath) {
            if (!_.isUndefined(filePath)) {

                if (!_.isUndefined(defaultExtension)) {
                    filePath = (_.endsWith(filePath, defaultExtension)) ? filePath : filePath + '.' + defaultExtension;
                }

                fs.writeFile(filePath, content, 'utf8', function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(filePath);
                    }
                });
            }
        };

        dialog.showSaveDialog(dialogOptions, callback); 
    });
};

module.messageBox = function (options) {
	return new Promise((resolve, reject) => {
        var dialogOptions = {};

        if (!_.isUndefined(options)) {
            dialogOptions = _.defaults(dialogOptions, options);
        }

        var callback = function (buttonIndex) {
            resolve(buttonIndex);
        };

        dialog.showMessageBox(dialogOptions, callback); 
    });
};

module.error = function (title, content) {
	dialog.showErrorBox(title, content);
};