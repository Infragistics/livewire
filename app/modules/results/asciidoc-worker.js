/* global Opal */

/*
  The AsciiDoctor.js conversion must be in this web worker because 
  the ways that AsciiDoctor.js (likely the Opal objects) change
  global prototypes adversely affect the Ace editor's performance.
  
  By splitting the conversion process into this worker, the
  execution is in a separate context (with separate globals) 
  and does not degrade the performance of the editor. 
*/

importScripts('../../bower_components/asciidoctor.js/dist/asciidoctor-all.js');
importScripts('../../vendor/asciidoctor.js/asciidoctor-pick-inline-macro.js');

var options = Opal.hash2(
  ['doctype', 'attributes'],
  {
    doctype: 'article', // inline
    attributes: ['showtitle']
  });

var handlers = {
  message: function(e){
    if(e.data && e.data.source && e.data.source.length > 0){
      var html = Opal.Asciidoctor.$convert(e.data.source, options);
      postMessage({html: html });
    }    
  }
};

addEventListener('message', handlers.message, true);