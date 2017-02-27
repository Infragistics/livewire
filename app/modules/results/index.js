/* global appSettings */
/*jslint node: true */
/*jshint esversion: 6 */

const { shell } = require('electron');

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
    cancelRender = false,

    messenger = require(path.resolve(__dirname, '../messenger')),
    renderer = require(path.resolve(__dirname, './asciidoc.js')).get(),
    formats = require(path.resolve(__dirname, '../formats')),
    dialogs = require(path.resolve(__dirname, '../dialogs')),
    renderTransformer = require(path.resolve(__dirname, './renderTransformer')),
    contentInspector = require(path.resolve(__dirname, './contentInspector')),

    source = '',
    formatter = null,
    basePath = '',
    subscriptions = [],
    html = '',

    _fileInfo,
    _selectedProduct = null;

var _productConfiguration = null;

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
        if (isEnabled && $result && !cancelRender) {
            _fileInfo = fileInfo;

            if (!_.isUndefined(_fileInfo)) {
                if (_fileInfo.isBlank) {
                    $result.html('');
                } else {
                    if(_fileInfo.contents.length > 0){            

                        detectRenderer(_fileInfo);
                        source = _fileInfo.contents;

                        contentInspector.inspect(source, _fileInfo);
                        
                        if(!$renderingLabel.is(':visible')){
                            $renderingLabel.fadeIn('fast');
                        }
                        
                        source = renderTransformer.beforeRender(source, _productConfiguration);
                        
                        renderer(source, function (e) {

                            html = e.html;

                            html = renderTransformer.afterRender(html, _productConfiguration);

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
    },
    allFilesClosed: function () {
        $result.html('');
        $renderingLabel.fadeOut('fast');
    },
    productConfigurationChanged: (config) => {
        _productConfiguration = config;
        if(_selectedProduct){
            _productConfiguration.selectedProduct = _selectedProduct;
            handlers.contentChanged(_fileInfo);
        }
    },
    selectedProductChanged: (productName) => {
        _selectedProduct = productName;
        _productConfiguration.selectedProduct = productName;
        handlers.contentChanged(_fileInfo);
    }
};

var subscribe = function () {
    isEnabled = true;
    subscriptions.push(messenger.subscribe.file('new', handlers.fileNew));
    subscriptions.push(messenger.subscribe.file('opened', handlers.opened));
    subscriptions.push(messenger.subscribe.file('contentChanged', handlers.contentChanged));
    subscriptions.push(messenger.subscribe.file('sourceChange', handlers.sourceChanged));
    subscriptions.push(messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed));
    subscriptions.push(messenger.subscribe.metadata('productConfigurationChanged', handlers.productConfigurationChanged));
    subscriptions.push(messenger.subscribe.metadata('selectedProductChanged', handlers.selectedProductChanged));
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
messenger.subscribe.file('rerender', () => {
    renderer(source, function (e) {
        $result.html(e.html);
    });
});

messenger.subscribe.file('beforeBulkOpen', () => { cancelRender = true; });
messenger.subscribe.file('afterBulkOpen', () => {
    cancelRender = false;
});

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

    $result.on('click', 'a', (e) => {
        var href = $(e.currentTarget).attr('href');
        if(/^http/.test(href)) {
            shell.openExternal(href);
        } else {
            dialogs.messageBox({
                message: `Navigating to document links is not supported in the HTML preview.`
            });
        }

        e.preventDefault();
        return false;
    });

    setHeight(appSettings.editingContainerOffset());
});