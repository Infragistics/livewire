/*jslint node: true */
/*jshint esversion: 6 */
/* global Typo */

var ajax = {
    get: (path, callback) => {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                callback(null, xhttp.responseText);
            }
        };

        xhttp.onerror = (err) => {
            callback(err, null);
        };

        xhttp.open('GET', path, true);
        xhttp.send();
    }
};

const isNodeContext = typeof module !== 'undefined';

var dictionaryProvider = (lang, callback) => {

    if(!lang) {
        lang = 'en_US';
    }

    var filePaths = {};

    if(isNodeContext) {
        const path = require('path');
        filePaths = {
            dictionary: path.resolve(__dirname, `../typo/dictionaries/en_US/${lang}.dic`),
            aff: path.resolve(__dirname, `../typo/dictionaries/en_US/${lang}.aff`)
        };
    } else { // web worker context
        filePaths = {
            dictionary: `../typo/dictionaries/en_US/${lang}.dic`,
            aff: `../typo/dictionaries/en_US/${lang}.aff`
        };
    }

    ajax.get(filePaths.dictionary, (dictionaryError, dictionaryData) => {

        if(dictionaryError) {
            callback({ error: dictionaryError }, null);
            return;
        }

        ajax.get(filePaths.aff, (affError, affData) => {

            if(affError) {
                callback({ error: affError }, null);
                return;
            }
            
            const typo = new Typo(lang, affData, dictionaryData);
            callback(null, typo);
        });
    });
};

if(isNodeContext) {
    module.exports.get = dictionaryProvider;
}