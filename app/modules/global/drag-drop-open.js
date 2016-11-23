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

      if(formats.getSupportedFileExtensions().indexOf(extension) > -1) {
          filePaths.push(file.path);
      } else {
          alert(`Unsupported file type: ${file.name}`);
      }
  });
  
  if(filePaths.length > 0) {
    messenger.publish.menu('open', filePaths);
  }
  
  return false;
};