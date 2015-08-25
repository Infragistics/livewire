module = module.exports;

var asciidoctor = require('asciidoctor.js')();
var opal = asciidoctor.Opal;

var path = require('path');
var processor = null;
var useExtensions = true;
var basePath = '';

var cheerio = require('cheerio');

var messenger = require(path.resolve(__dirname, '../messenger'));

messenger.subscribe.file('pathChanged', function (data, envelope) {
  basePath = data.basePath;
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
  var html, $;
  
  html = processor.$convert(content, options);
  $ = cheerio.load(html);
  
  $('table').addClass('table table-striped');
  $('.admonitionblock table').removeClass('table table-striped');
  $('img').each(function(){
    var $img, src;
    
    $img = $(this);
    src = $img.attr('src');
    $img.attr('src', basePath + '\\' + src);
  });
  
  return $.html();
};

module.get = function () {
  return renderer;
};