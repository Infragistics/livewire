module = module.exports;

const
    path = require('path'),
    fs = require('fs');
    
var
    _controls = null,
    _tags = null;

var getJSON = (filePath) => {
    return new Promise((resolve, reject) => {
         fs.readFile(filePath, 'utf8', (error, fileContents) => {
             if(error) {
                console.log(error);
                reject(error);  
             } else {
                var json = JSON.parse(fileContents);
                resolve(json);                 
             }
        });
    });
};

module.getControls = () => {
    return new Promise((resolve, reject) => {
        if(_controls){
            resolve(_controls);
        } else {
            getJSON(path.resolve(__dirname, './metadata/controls.json'))
                .then((controls) => {
                    _controls = controls;
                    resolve(_controls);
            });
        }
    });
};

module.getTags = () => {
    return new Promise((resolve, reject) => {
        if(_tags){
            resolve(_tags);
        } else {
            getJSON(path.resolve(__dirname, './metadata/tags.json'))
                .then((tags) => {
                    _tags = tags;
                    resolve(_tags);
            });
        }
    });
};