module = module.exports;

var path = require('path');
var basePath = '';
var cheerio = require('cheerio');
var messenger = require(path.resolve(__dirname, '../messenger'));
var renderCallback = function(){};

var path = require('path');
var include = require(path.resolve(__dirname, '../formats/grammar/asciidoc/include'));

var handlers = {
  message: function(e){
    if(e.data && e.data.html && e.data.html.length > 0){
      var $ = cheerio.load(e.data.html);
      
      $('table').addClass('table table-striped');
      $('.admonitionblock table').removeClass('table table-striped');
      $('img').each(function(){
        var $img, src;
        
        $img = $(this);
        src = $img.attr('src');
        $img.attr('src', basePath + '\\' + src);
      });
      renderCallback({ html: $.html()});
    }
  }
};

var getWorker = function(){
    var worker = new Worker(path.resolve(__dirname, 'asciidoc-worker.js'));
    worker.onmessage = handlers.message;
    worker.onerror = function(e){
        console.log(e);
    };  
    return worker;  
};

var worker = getWorker();

messenger.subscribe.file('pathChanged', function (data, envelope) {
  basePath = data.basePath;
});

var renderer = function(content, callback){
  if(content.length > 0){
    renderCallback = callback;
    worker.terminate();
    worker = getWorker();
    
    if(basePath && basePath.length > 0){
        content = include.apply(content, basePath);
    }
    
    worker.postMessage({source: content, basePath: basePath });
  }
};

module.get = function () {
  return renderer;
};