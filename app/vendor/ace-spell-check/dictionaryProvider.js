/*jslint node: true */
/*jshint esversion: 6 */
/* global Typo */

const  path = require('path')
     , fs = require('fs');

module.exports.get = (lang) => {
    return new Promise((resolve, reject) => {
        
        const filePaths = {
            dictionary: path.resolve(__dirname, `../typo/dictionaries/en_US/${lang}.dic`),
            aff: path.resolve(__dirname, `../typo/dictionaries/en_US/${lang}.aff`)
        };

        fs.readFile(filePaths.dictionary, 'utf8', (dictionaryError, dictionaryData) => {
            if(dictionaryError) reject(dictionaryError);

            fs.readFile(filePaths.aff, 'utf8', (affError, affData) => {
                if(affError) reject(affError);

                const typo = new Typo(lang, affData, dictionaryData);
                resolve(typo);
            });
        });
    });
};