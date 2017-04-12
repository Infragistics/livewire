/*jslint node: true */
/*jshint esversion: 6 */

const 
      fs = require('fs')
    , path = require('path');

const _module = {

    userDataPath: '',

    fileName: 'livewire-custom-dictionary.json',

    getFilePath: () => path.join(_module.userDataPath, _module.fileName),

    dictionary: null,

    init: (userDataPath) => {
        _module.userDataPath = userDataPath;
    },

    get: () => { 
        if(!_module.dictionary) {
            try {
                _module.dictionary = JSON.parse(fs.readFileSync(_module.getFilePath(), 'utf8'));
            } catch (err) {
                if(err.code === 'ENOENT') {
                    _module.dictionary = {};
                } else {
                    debugger;
                    throw new Error(err);
                }
            }
        }

        return _module.dictionary;
    },

    add: (newWord) => {
        _module.dictionary[newWord] = true;
        _module.save();
    },

    save: () => {
        fs.writeFile(_module.getFilePath(), JSON.stringify(_module.dictionary), 'utf8', (err) => {
            if(err) throw new Error(err);
        });
    }
};

module.exports.get = _module.get;
module.exports.add = _module.add;
module.exports.init = _module.init;