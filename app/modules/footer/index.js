/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));

var $configContainer;
var $versionsSelect;
var $productsSelect;
var $flagsContainer;
var $loadDefaultConfigButton;
var $noConfgFilesFound;

var _selectedVersion;
var _selectedProduct;
var _hasTriedToLoadVersionNumbers = false;

var handlers = {

  noDocsConfigFound: () => {
    $configContainer.hide();
    $loadDefaultConfigButton.click(() => {
      messenger.publish.metadata('loadDefaultConfigFiles');
      $noConfgFilesFound.hide();
    });
    $noConfgFilesFound.show();
  },

  allConfigFilesLoaded: () => {
    messenger.publish.metadata('getProductVersionNumbers', { readFromFileSystem: true });
    $configContainer.show();
  },

  cleanUp: () => {
    $noConfgFilesFound.hide();
    $productsSelect[0].selectedIndex = 0;
    $productsSelect.hide();
    $flagsContainer.html('');
    $flagsContainer.hide();
    $configContainer.show();
  },
  
  productVersionNumbersChanged: (versionNumbers) => {
    var html = [];
    html.push('<option>[ Version ]</option>');
    versionNumbers = versionNumbers.sort().reverse();
    versionNumbers.forEach((version) => {
      html.push(`<option value="${version}">${version}</option>`);
    });
    $versionsSelect.html(html.join('\n'));
    handlers.cleanUp();

    messenger.publish.metadata('productVersionSelectionChanged', { hasValue: false });
  },

  productListChanged: (productsObj) => {
    var html = [], products;

    products = Object.keys(productsObj);

    if(products.length > 0){
      html.push('<option>[ Product ]</option>');

      products.forEach((product) => {
        html.push(`<option value="${product}">${product}</option>`);
      });
      $productsSelect.html(html.join('\n'));

      if(_selectedProduct) {
        $productsSelect.val(_selectedProduct);
      }
    } else {
      $productsSelect.fadeOut('fast');
    }

  },

  allFilesClosed: () => {
    $productsSelect.fadeOut('fast');
    $versionsSelect.fadeOut('fast');
    $flagsContainer.html('');
  },

  isInfragisticsDocumentationFile: () => {

    if(!_hasTriedToLoadVersionNumbers) {
      messenger.publish.metadata('getProductVersionNumbers', { readFromFileSystem: true });
      _hasTriedToLoadVersionNumbers = true;
    }

    if(!$versionsSelect.is(':visible')){
      $versionsSelect.fadeIn('fast');
    }

    if($versionsSelect[0].selectedIndex > 0 && $productsSelect[0].selectedIndex > 0 && !$productsSelect.is(':visible')){
      $productsSelect.fadeIn('fast');
      $flagsContainer.fadeIn('fast');
    }
  },

  isNotInfragisticsDocumentationFile: () => {
    if($versionsSelect.is(':visible')) {
      $versionsSelect.fadeOut('fast');
    }

    if($productsSelect.is(':visible')) {
      $productsSelect.fadeOut('fast');
    }

    if($flagsContainer.is(':visible')) {
      $flagsContainer.fadeOut('fast');
    }
  },

  productBuildFlagsChanged: (buildFlags) => {
    if(buildFlags.length > 0) {
      $flagsContainer.html(`<span class="flag">${buildFlags.join('</span><span class="flag">')}</span>`);

      if($versionsSelect[0].selectedIndex > 0 && !$flagsContainer.is(':visible')){
        $flagsContainer.fadeIn('fast');
      }
    } else {
      $flagsContainer.html('');
      $flagsContainer.hide();
    }
  }
};

messenger.subscribe.metadata('productVersionNumbersChanged', handlers.productVersionNumbersChanged);
messenger.subscribe.metadata('productListChanged', handlers.productListChanged);
messenger.subscribe.metadata('noDocsConfigFound', handlers.noDocsConfigFound);
messenger.subscribe.metadata('allConfigFilesLoaded', handlers.allConfigFilesLoaded);
messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed);
messenger.subscribe.metadata('productBuildFlagsChanged', handlers.productBuildFlagsChanged);
messenger.subscribe.metadata('isInfragisticsDocumentationFile', handlers.isInfragisticsDocumentationFile);
messenger.subscribe.metadata('isNotInfragisticsDocumentationFile', handlers.isNotInfragisticsDocumentationFile);

$(function() {

  $configContainer = $('#config-container');
  $versionsSelect = $('#versions-select');
  $productsSelect = $('#products-select');
  $flagsContainer = $('#flags-container');
  $loadDefaultConfigButton = $('#load-default-config-button');
  $noConfgFilesFound = $('#no-confg-files-found');

  $versionsSelect.change(() => {
    _selectedVersion = $versionsSelect.val();
    
    var args = {
      hasValue: $versionsSelect[0].selectedIndex > 0,
      value: _selectedVersion
    };
    messenger.publish.metadata('productVersionSelectionChanged', args);

    if(args.hasValue) {
      $productsSelect[0].selectedIndex = 0;
      $flagsContainer.html('');
      $productsSelect.fadeIn('fast');
    }
  });

  $productsSelect.change(() => {
    _selectedProduct = $productsSelect.val();
    messenger.publish.metadata('selectedProductChanged', _selectedProduct);
  });
});