module = module.exports;

var path = require('path');
var basePath = '';
var cheerio = require('cheerio');
var messenger = require(path.resolve(__dirname, '../messenger'));
var renderCallback = function(){};

var path = require('path');
var include = require(path.resolve(__dirname, '../formats/grammar/asciidoc/include'));
var pickInlineMacro = require('./pick-inline-macro');

var _buildFlags = [];

var handlers = {
  message: function(e){
    if(e.data && e.data.html && e.data.html.length > 0){
      var $ = cheerio.load(e.data.html);
      

      // format tables with Bootstrap classes
      // fix image paths
      $('table').addClass('table table-striped');
      $('.admonitionblock table').removeClass('table table-striped');
      $('img').each(function(){
        var $img, src;
        
        $img = $(this);
        src = $img.attr('src');
        $img.attr('src', (basePath + '\\' + src).replace(/\//g, '\\'));
      });
      //  Show links as tooltips
      $('a').each(function() {
        var $link = $(this),
          href = $link.attr('href');
        $link.attr('title', href.replace(/<\/?sub>/g, '~'));
      });

      // make toc title H2 element
      var $tocTitle = $('#toctitle'); 
      $('#toctitle').html(`<h2>${$tocTitle.text()}</h2>`);

      renderCallback({ html: $.html()});
    }
  },
  buildFlags: function(e){
    _buildFlags = e;
  },
  changeBasePath: (data) => {
    basePath = data.basePath;
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

messenger.subscribe.file('basePathChanged', handlers.changeBasePath);
messenger.subscribe.file('pathChanged', handlers.changeBasePath);
messenger.subscribe.metadata('productBuildFlagsChanged', handlers.buildFlags);

var renderer = function(content, callback){
  if(content.length > 0){
    renderCallback = callback;
    worker.terminate();
    worker = getWorker();
    
    if(basePath && basePath.length > 0){
        content = include.apply(content, basePath);
    }
    
    content = pickInlineMacro.process(content, _buildFlags);

    if(/toc::\[/.test(content)){
      content = ':toc: macro\n' + content;
    }
    
    worker.postMessage({source: content, basePath: basePath, buildFlags: _buildFlags.join(',') });
  }
};

module.get = function () {
  return renderer;
};