/* global appSettings */

var
    $result,
    $resultContainer,
    $resultsButton,
    $resultsPane,
    $renderingLabel,
    $window = $(window),
    path = require('path'),
    _ = require('lodash'),
    isEnabled = true,

    messenger = require(path.resolve(__dirname, '../messenger')),
    renderer = require(path.resolve(__dirname, './asciidoc.js')).get(),
    formats = require(path.resolve(__dirname, '../formats')),
    dialogs = require(path.resolve(__dirname, '../dialogs')),
    renderTransformer = require(path.resolve(__dirname, './renderTransformer')),

    source = '',
    shell = require('shell'),
    formatter = null,
    basePath = '',
    subscriptions = [],
    html = '',

    _fileInfo,
    _buildFlags = [];

const productConfigurationReader = require(path.resolve(__dirname, '../config/productConfigurationReader.js'));
var _productConfiguration = null;

// *** todo: lazy load when user opens variables UI ***
if(!_productConfiguration) {
    productConfigurationReader.getConfiguration(path.resolve(__dirname, '../../DocsConfig.xml'), '15.6').then((configuration) => {
        debugger;
        configuration.selectedProduct = 'wpf';
        _productConfiguration = configuration;
    });
}
// ****************************************************

messenger.subscribe.file('pathChanged', function (data, envelope) {
  basePath = data.basePath;
});

var detectRenderer = function (fileInfo) {
    var rendererPath, currentFormatter;

    currentFormatter = formats.getByFileExtension(fileInfo.ext);

    if (formatter === null || currentFormatter.name !== formatter.name) {
        formatter = currentFormatter;
        rendererPath = path.resolve(__dirname, './' + formatter.name.toLowerCase());
        renderer = require(rendererPath).get(basePath);

        messenger.publish.file('formatChanged', formatter);
    }
};

var handlers = {
    fileNew: (fileInfo) => {
        _buildFlags = [];
        handlers.opened(fileInfo);
    },
    opened: function(fileInfo){
        refreshSubscriptions();
        $result.animate({
            scrollTop: $result.offset().top
        }, 10);
    },

    sourceChanged: function(fileInfo){
        handlers.contentChanged(fileInfo);
    },
    contentChanged: function (fileInfo) {
        if (isEnabled && $result) {
            _fileInfo = fileInfo;

            if (!_.isUndefined(_fileInfo)) {
                if (_fileInfo.isBlank) {
                    $result.html('');
                } else {
                    if(_fileInfo.contents.length > 0){            
                        var flags = '';
                        detectRenderer(_fileInfo);
                        source = _fileInfo.contents;

                        _buildFlags.forEach(function (buildFlag) {
                            flags += ':' + buildFlag + ':\n'
                        });

                        source = flags + source;
                        
                        if(!$renderingLabel.is(':visible')){
                            $renderingLabel.fadeIn('fast');
                        }
                        source = renderTransformer.beforeRender(source, _productConfiguration);
                        
                        renderer(source, function (e) {

                            html = renderTransformer.afterRender(e.html);

                            $result.html(html);
                            
                            if($renderingLabel.is(':visible')){
                                $renderingLabel.fadeOut('fast');
                            }
                        });
                    }
                }
            }
        }
    },
    buildFlags: function (buildFlags) {
        _buildFlags = buildFlags;
        handlers.contentChanged(_fileInfo);
    },
    showResults: function() {
        subscribe();
        $resultsPane.css('visibility', 'visible');
        
        $resultsButton
            .removeClass('fa-chevron-left')
            .addClass('fa-chevron-right')
            .one('click', handlers.hideResults);
            
        messenger.publish.layout('showResults');
    },
    hideResults: function () {
        unsubscribe();

        $resultsPane.css('visibility', 'hidden');
        
        $resultsButton
            .removeClass('fa-chevron-right')
            .addClass('fa-chevron-left')
            .one('click', handlers.showResults);
            messenger.publish.layout('hideResults');       
    },
    fileSelected: function(){
        refreshSubscriptions();
        _buildFlags = [];
    },
    allFilesClosed: function () {
        $result.html('');
        $renderingLabel.fadeOut('fast');
    }
};

var subscribe = function () {
    isEnabled = true;
    subscriptions.push(messenger.subscribe.file('new', handlers.fileNew));
    subscriptions.push(messenger.subscribe.file('opened', handlers.opened));
    subscriptions.push(messenger.subscribe.file('contentChanged', handlers.contentChanged));
    subscriptions.push(messenger.subscribe.file('sourceChange', handlers.sourceChanged));
    subscriptions.push(messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed));
    subscriptions.push(messenger.subscribe.format('buildFlags', handlers.buildFlags));
};

var unsubscribe = function () {
    isEnabled = false;
    subscriptions.forEach(function (subscription) {
        messenger.unsubscribe(subscription);
    });
    subscriptions = [];
};

var refreshSubscriptions = function(){
    unsubscribe();
    subscribe();
};

subscribe();

messenger.subscribe.file('selected', handlers.fileSelected);
messenger.subscribe.file('rerender', function (data, envelope) {
    renderer(source, function (e) {
        $result.html(e.html);
    });
});

var handleAnchorClick = function (e) {
    var href;
    var element = e.target;

    if (element.nodeName === 'A') {
        href = element.getAttribute('href');

        if(/http/.test(href)) {
            shell.openExternal(href);
        } else {
            dialogs.messageBox({
                message: `Navigating to document links is not supported in the HTML preview.`
            });
        }

        e.preventDefault();
        return false;
    }
};

document.addEventListener('click', handleAnchorClick, false);

var setHeight = function (offSetValue) {
    $resultsPane.css('height', $window.height() - offSetValue + 'px');
    $window.on('resize', function (e) {
        $resultsPane.css('height', $window.height() - offSetValue + 'px');
    });
};

$(function () {
    $result = $('#result');
    $resultContainer = $('#result-container');
    $resultsPane = $('#result-pane');
    $resultsButton = $('#result-button');
    $renderingLabel = $('#rendering-label');

    $resultsPane
        .css('left', appSettings.split())
        .css('width', appSettings.resultsWidth());
        
    $resultsButton.one('click', handlers.hideResults);

    setHeight(appSettings.editingContainerOffset());
});