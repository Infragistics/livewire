/*jslint node: true */
/*jshint esversion: 6 */
/* global ace, Typo */

// You also need to load in typo.js and jquery.js

var path = require('path');

// You should configure these classes.
var editor = "editor"; // This should be the id of your editor element.
var messenger = require(path.resolve(__dirname, '../../modules/messenger'));
var dictionaryProvider = require(path.resolve(__dirname, './dictionaryProvider.js'));
var dictionary;

dictionaryProvider.get('en_US', (err, dictionaryInstance) => {
  if(err) console.log(err);
  dictionary = dictionaryInstance;
  enable_spellcheck();
  spell_check();
});

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

var clearMarkers = function(session){
  session = session || ace.edit(editor).getSession();
  for (var i in markers_present) {
    session.removeMarker(markers_present[i]);
  }
  markers_present = [];
};

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
  
  clearMarkers(session);

  try {
	  var Range = ace.require('ace/range').Range
	  var lines = session.getDocument().getAllLines();
	  for (var i in lines) {    
      // Check spelling of this line.
      if(lines[i].split){
        var misspellings = misspelled(lines[i]);
        
        // Add markers and gutter markings.
        for (var j in misspellings) {
          var range = new Range(i, misspellings[j][0], i, misspellings[j][1]);
          markers_present.push(session.addMarker(range, "misspelled", "typo", true));
        }
      }
	  }
	} finally {
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


var handlers = {

  contextMenuInfoResponse: (info) => {
    const suggestions = dictionary.suggest(info.mispelledWord);
    messenger.publish.file('context-menu-info-response', { spellingSuggestions: suggestions });
  }
};

messenger.subscribe.file('mispellings-request', handlers.contextMenuInfoResponse);