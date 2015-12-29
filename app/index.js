/* global appSettings */

window.appSettings = {
    _editorWidth: '49%',
    
    editorWidth: function(value){
        if(value){
            appSettings._editorWidth = value;
        } else {
            return appSettings._editorWidth;
        }
    },
    
    split: function(){
        return (parseInt(appSettings._editorWidth) + 1) + '%';
    },
    
    resultsWidth: function(value){
        if(parseInt(appSettings.editorWidth()) > 90){
            return '0px';
        } else {
            return (100 - parseInt(appSettings.split()) - 1) + '%';
        }
    }
};

require.main.require('./vendor/ace-spell-check/spellcheck_ace.js');
require.main.require('./modules/menu');
require.main.require('./modules/toolbars/formatting');
require.main.require('./modules/toolbars/tabs');
require.main.require('./modules/persistence');
require.main.require('./modules/files');
require.main.require('./modules/results');
require.main.require('./modules/editor');
require.main.require('./modules/footer');
require.main.require('./modules/help');

$(function(){
	$('body').fadeIn('50');
});