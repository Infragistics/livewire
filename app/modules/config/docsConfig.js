/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));
const dialogs = require(path.resolve(__dirname, '../dialogs'));
const fs = require('fs');

var _config = {};

const _module = {

    init: (config) => {
        _config = config;
    },

    getDefaultFilesPath: () => {
        return path.resolve(__dirname, '../../data/docsConfig');
    },

    save: (content, versionNumber, callback) => {
        fs.writeFile(path.join(_config.userDataPath, _module.getFileName(versionNumber)), content, { encoding: 'utf8' }, (err) => {
            if(err) console.log(err);
            if(callback) callback();
        });
    },
    
    getFileName: (versionNumber) => {
        return `livewire-docsConfig-${versionNumber.replace('.', '-')}.xml`;
    },

    getVersionFromFileName: (fileName) => {
        return fileName.replace('livewire-docsConfig-', '').replace('.xml', '').replace('-', '.');
    },


    isDocsConfigFileName: (fileName) => {
        return /livewire-docsConfig-(.*)\.xml/i.test(fileName);
    },

    isValidDocsConfigFile: (content) => {
        return /<\?xml/i.test(content) && /<configuration/i.test(content);
    }
};

module.exports = _module;

var handlers = {

    load: () => {
        dialogs.openFile({
            filters: [
                { name: 'xml', extensions: ['xml'] }
            ]
        }).then((docsConfigFile) => {

            var content = docsConfigFile.content;

            if(!_module.isValidDocsConfigFile(content)) {
                alert('You have not selected a valid DocsConfig file.');
                return;
            }

            var matches = /<Variable(\s*)Name="ProductVersion"(\s*)Products="all"(\s*)Value="(.*)"/i.exec(content);
            var versionNumber = null;
            if(matches && matches.length >= 5) {
                versionNumber = matches[4].replace('.', '-');
            }

            if(versionNumber) {
                _module.save(content, versionNumber, () => {
                    messenger.publish.metadata('getProductVersionNumbers', { readFromFileSystem: true });
                });
            } else {
                alert('The ProductVersion is not correctly defined in the configuration file you selected.');
            }
        });
    },

    copyDefaultFilesToUserDataPath: () => {
        var filesPath = _module.getDefaultFilesPath();
        fs.readdir(filesPath, (err, defaultFiles) => {
            var counter = 0;
            defaultFiles.forEach((fileName) => {
                fs.readFile(path.join(filesPath, fileName), 'utf8', (err, fileContents) => {
                    if(err) console.log(err);
                    _module.save(fileContents, fileName.replace('.xml', ''), () => {
                        counter++;
                        if(counter === defaultFiles.length) {
                            messenger.publish.metadata('allConfigFilesLoaded');
                        }
                    });
                });
            });
        });
    }
};

messenger.subscribe.menu('loadDocsConfig', handlers.load);
messenger.subscribe.menu('loadDefaultDocsConfig', handlers.copyDefaultFilesToUserDataPath);
messenger.subscribe.metadata('loadDefaultConfigFiles', handlers.copyDefaultFilesToUserDataPath);