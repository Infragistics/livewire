var shell = require('shell');
var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));
var _ = require('lodash');

var file = { path: '', name: '' };

var $fileNameButton = $('#file-name-button');

$fileNameButton.click(function () {
  if (file.path.length > 0) {
    shell.showItemInFolder(file.path);
  }
});

messenger.subscribe.file('file.pathInfo', function (data, envelope) {

  if (_.isUndefined(data.path) || data.isNewFile) {
    file.name = '';
    file.path = '';
  } else {
    file.path = data.path;
    file.name = data.fileName;
  }

  $fileNameButton.text(file.name);
  $fileNameButton.attr('title', file.path);
});