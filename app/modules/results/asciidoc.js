(function (module) {

  'use strict';

  var asciidoctor = require('asciidoctor.js')();
  var opal = asciidoctor.Opal;

  var processor = null;
  var useExtensions = true;

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
  
  var renderer = function(content){
    return processor.$convert(content, options);
  };
  
  module.get = function(){
    return renderer;
  };


} (module.exports));