const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));

var $versionsSelect = $('#versions-select');
var $productsSelect = $('#products-select');
var $flagsContainer = $('#flags-container');

var _selectedVersion;
var _selectedProduct;

var handlers = {
  
  productVersionNumbersChanged: (versionNumbers) => {
    var html = [];
    html.push('<option>[ Version ]</option>');
    versionNumbers = versionNumbers.reverse();
    versionNumbers.forEach((version) => {
      html.push(`<option value="${version}">${version}</option>`);
    });
    $versionsSelect.html(html.join('\n'));
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
  }
};

messenger.subscribe.metadata('productVersionNumbersChanged', handlers.productVersionNumbersChanged);
messenger.subscribe.metadata('productListChanged', handlers.productListChanged);
messenger.subscribe.file('allFilesClosed', handlers.allFilesClosed);

messenger.subscribe.metadata('productBuildFlagsChanged', (buildFlags) => {
  $flagsContainer.html(`<span class="flag">${buildFlags.join('</span><span class="flag">')}</span>`);
});

messenger.subscribe.metadata('isInfragisticsDocumentationFile', () => {

  if(!$versionsSelect.is(':visible')){
    $versionsSelect.fadeIn('fast');
  }

  if($productsSelect[0].selectedIndex > 0 && !$productsSelect.is(':visible')){
    $productsSelect.fadeIn('fast');
    $flagsContainer.fadeIn('fast');
  }
});

messenger.subscribe.metadata('isNotInfragisticsDocumentationFile', () => {
  if($versionsSelect.is(':visible')) {
    $versionsSelect.fadeOut('fast');
  }

  if($productsSelect.is(':visible')) {
    $productsSelect.fadeOut('fast');
  }

  if($flagsContainer.is(':visible')) {
    $flagsContainer.fadeOut('fast');
  }
});

$versionsSelect.change((e) => {
  _selectedVersion = $versionsSelect.val();
  
  var args = {
    hasValue: $versionsSelect[0].selectedIndex > 0,
    value: _selectedVersion
  };
  messenger.publish.metadata('productVersionSelectionChanged', args);

  if(args.hasValue) {
    $productsSelect.fadeIn('fast');
  }
});

$productsSelect.change((e) => {
  _selectedProduct = $productsSelect.val();
  messenger.publish.metadata('selectedProductChanged', _selectedProduct);
});