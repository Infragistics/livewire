/* global appSettings */

const packageJsonReader = require('./modules/config/packageJsonReader.js');
const config = require('./modules/config').get();
const messenger = require('./modules/messenger');

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
    },
    
    editingContainerOffset: function(){ return 113; },
    resultsButtonWidth: function() { return 22; } 
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
require.main.require('./modules/global');


var getNumberValue = (version) => {
    var reverseString = (s) => s.split('').reverse().join('');

    if((version.match(/\./g)||[]).length > 1){
        version = reverseString(version).replace(/\./, '');
        version = reverseString(version);
    }
    return Number(version);
}

$(function(){
    var publishedVersion, localVersion;

	$('body').fadeIn('50');

    $.get(config.urls.version).then((json) => { 
        publishedVersion = getNumberValue(json.version);
        packageJsonReader.get().then((packageJson) => {
            localVersion = getNumberValue(packageJson.version);
            if(publishedVersion > localVersion) {
                $('#new-version-number').text(json.version);
                $('#installer-link').attr('href', config.urls.installers);
                $('#new-version-container').fadeIn('fast');
            }
        });
    });

    $('#new-version-container .close').click((e) => {
        $(e.currentTarget.parentElement).fadeOut('fast');
    });
});