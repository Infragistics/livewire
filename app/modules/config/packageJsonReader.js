module = module.exports;

const path = require('path');
const fs = require('fs');

var config = null;

module.get = () => {
    return new Promise((success, reject) => {
        if(config) {
            success(config);
        } else {
            fs.readFile(path.resolve(__dirname, '../../../package.json'), 'utf8', (err, data) => {
                if(err) {
                    reject();
                } else {
                    config = JSON.parse(data);
                    success(config);
                }
            });
        }
    });
};