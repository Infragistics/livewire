module = module.exports;

var asciidoctor = require('asciidoctor.js')();
var opal = asciidoctor.Opal;

var path = require('path');
var processor = null;
var useExtensions = true;
var basePath = '';

var messenger = require(path.resolve(__dirname, '../messenger'));

messenger.subscribe.file('file.pathInfo', function (data, envelope) {
  basePath = path.dirname(data.path);
});


if (useExtensions) {
  processor = asciidoctor.Asciidoctor(true);
}
else {
  processor = asciidoctor.Asciidoctor();
}

var options = opal.hash2(
  ['doctype', 'attributes'],
  {
    doctype: 'article', // inline
    attributes: ['showtitle']
  });

var renderer = function (content) {
  var html = processor.$convert(content, options);
  html = html.replace(/src="/g, 'src="' + basePath + '\\');
  return html;
};

module.get = function () {
  return renderer;
};