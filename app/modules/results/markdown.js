module = module.exports;

var marked = require('marked');
var renderer = new marked.Renderer();
var basePath = '';
var path = require('path');
var messenger = require(path.resolve(__dirname, '../messenger'));

messenger.subscribe.file('pathChanged', function (data, envelope) {
  basePath = data.basePath;
});

renderer.table = function (header, body) {
  return '<table class="table table-striped">\n' + header + '\n' + body + '\n</table>';
};

renderer.image = function (href, title, text) {
  var value = '<span>[image: ' + href + ']</span>';

  if (basePath.length > 0) {
    value = '<img ' +
    'src="' + path.join(basePath, href) + '" ' +
    ((title) ? 'title="' + title + '" ' : '') +
    'data-href="' + href + '" ' +
    ((text) ? 'alt="' + text + '"' : '') +
    ' />';
  }

  return value;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true
});

var _renderer = function(content, callback){
  var html = marked(content);
  callback({ html: html });
};

module.get = function () {
  return _renderer;
};