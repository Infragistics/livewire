/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const formats = require(path.resolve(__dirname, '../formats'));
const messenger = require(path.resolve(__dirname, '../messenger'));

window.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'link';
  return false;
};

window.ondrop = function(e) {
  e.preventDefault();

  let filePaths = [];

  [].forEach.call(e.dataTransfer.files, (file) => {
      let extension = path.extname(file.name).replace('.', '');
      let supportedFileExtensions = formats.getSupportedFileExtensions();
      if(supportedFileExtensions.includes(extension)) {
          filePaths.push(file.path);
      } else {
        let message = supportedFileExtensions;
        message[message.length -1] = `or ${message[message.length -1]}`;
        message = message.join(', ');
        alert(`Can not open file: '${file.name}'.

The file type '${extension}' is unsupported. Please try to open files with the following extensions: ${message}.`);
      }
  });
  
  if(filePaths.length > 0) {
    messenger.publish.menu('open', filePaths);
  }
  
  return false;
};