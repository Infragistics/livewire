/* global ace */
/* global Typo */

// You also need to load in typo.js and jquery.js

var path = require('path');

// You should configure these classes.
var editor = "editor"; // This should be the id of your editor element.
var lang = "en_US";
var dicPath = path.resolve(__dirname, "../typo/dictionaries/en_US/en_US.dic");
var affPath = path.resolve(__dirname, "../typo/dictionaries/en_US/en_US.aff");

// Make red underline for gutter and words.
$("<style type='text/css'>.ace_marker-layer .misspelled { position: absolute; z-index: -2; border-bottom: 1px solid red; margin-bottom: -1px; }</style>").appendTo("head");
$("<style type='text/css'>.misspelled { border-bottom: 1px solid red; margin-bottom: -1px; }</style>").appendTo("head");

// Load the dictionary.
// Sequential to ensure the 
var dictionary = null, dicData, affData;

$.get(dicPath, function(data) {
	dicData = data;
}).done(function() {
  $.get(affPath, function(data) {
	  affData = data;
  }).done(function() {
  	console.log("Dictionary loaded");
    dictionary = new Typo(lang, affData, dicData);
    enable_spellcheck();
    spell_check();
  });
});

// TODO: worker
// Check the spelling of a line, and return [start, end]-pairs for misspelled words.
function misspelled(line) {
	var words = line.split(' ');
	var i = 0;
	var bads = [];
  var word; // index of word in words array
	for (word in words) {
	  var x = words[word] + ""; // ensure string
	  var checkWord = x.replace(/[^a-zA-Z']/g, ''); // strip all non alpha characters
	  if (!dictionary.check(checkWord)) { // check dictionary for word
	    bads.push([i, i + words[word].length]); // create word index pair
	  }
	  i += (words[word].length + 1); // move index to position after word
  }
  return bads;
}

var contents_modified = true;
var currently_spellchecking = false;
var markers_present = [];

// Spell check the Ace editor contents.
function spell_check() {
  // Wait for the dictionary to be loaded.
  if (dictionary == null) {
    return;
  }

  if (currently_spellchecking) {
  	return;
  }

  if (!contents_modified) {
  	return;
  }
  
  currently_spellchecking = true;
  var session = ace.edit(editor).getSession();

  // Clear the markers.
  //for (var i in markers_present) {
  //  session.removeMarker(markers_present[i]);
  //}
  //markers_present = [];

  try {
	  var Range = ace.require('ace/range').Range
	  var lines = session.getDocument().getAllLines();
	  for (var i in lines) {
	  	// Clear the gutter.
	    //session.removeGutterDecoration(i, "misspelled");
	    
      // Check spelling of this line.
      if(lines[i].split){
        var misspellings = misspelled(lines[i]);
        
        // Add markers and gutter markings.
        //if (misspellings.length > 0) {
        //  session.addGutterDecoration(i, "misspelled");
        //}
        for (var j in misspellings) {
          var range = new Range(i, misspellings[j][0], i, misspellings[j][1]);
          //markers_present[markers_present.length] = session.addMarker(range, "misspelled", "typo", true);
          session.addMarker(range, "misspelled", "typo", true);
        }
      }
	  }
	} finally {
    console.log('done');
		currently_spellchecking = false;
		contents_modified = false;
	}
}

function enable_spellcheck() {
  ace.edit(editor).getSession().on('change', function(e) {
  	contents_modified = true;
	});
  
  spell_check();
	setInterval(spell_check, 500);
}