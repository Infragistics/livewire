require.main.require('./vendor/ace-spell-check/spellcheck_ace.js');
require.main.require('./modules/menu');
require.main.require('./modules/toolbars/formatting');
require.main.require('./modules/toolbars/tabs');
require.main.require('./modules/persistence');
require.main.require('./modules/files');
require.main.require('./modules/results');
require.main.require('./modules/editor');
require.main.require('./modules/help');

$(function(){
	$('body').fadeIn('50');
});