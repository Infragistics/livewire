/*jslint node: true */
/*jshint esversion: 6 */
/* global appSettings */

const packageJsonReader = require('./modules/config/packageJsonReader.js');
const config = require('./modules/config').get();

window.appSettings = {
    _editorWidth: '49%',
    
    editorWidth: (value) => {
        if(value){
            appSettings._editorWidth = value;
        } else {
            return appSettings._editorWidth;
        }
    },
    
    split: () => {
        return (parseInt(appSettings._editorWidth) + 1) + '%';
    },
    
    resultsWidth: (value) => {
        if(parseInt(appSettings.editorWidth()) > 90){
            return '0px';
        } else {
            return (100 - parseInt(appSettings.split()) - 1) + '%';
        }
    },
    
    editingContainerOffset: function(){ return 113; },
    resultsButtonWidth: function() { return 22; } 
};

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
require.main.require('./modules/global/drag-drop-open.js');
require.main.require('./modules/config/productConfigurationReader.js');


var getNumberValue = (version) => {
    var reverseString = (s) => s.split('').reverse().join('');

    if((version.match(/\./g)||[]).length > 1){
        version = reverseString(version).replace(/\./, '');
        version = reverseString(version);
    }
    return Number(version);
};

$(function(){
    var publishedVersion, localVersion;

	$('body').fadeIn('50');

    setTimeout(() => {
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
    }, 1000);

    $('#new-version-container .close').click((e) => {
        $(e.currentTarget.parentElement).fadeOut('fast');
    });
});