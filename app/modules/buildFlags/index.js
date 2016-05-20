module = module.exports;

const _ = require('lodash');
const path = require('path');
const config = require(path.resolve(__dirname, '../config')).get();

module.replaceIndividualFlagsWithProductFlags = (buildFlags) => {
    var productNames = [];
    var productFlags = [];
    
    buildFlags.forEach((flag) => {
      if(config.buildFlagsToProductsMap[flag]) {
        productNames = productNames.concat(config.buildFlagsToProductsMap[flag]);
        if(productFlags.indexOf(flag) === -1){
          productFlags.push(flag);
        }
      }
    });
    
    productNames = _.unique(productNames).sort();
    
    _.remove(buildFlags, (flag) => {
      return productFlags.indexOf(flag) > -1;
    });
    
    buildFlags = buildFlags.concat(productNames);
    
    buildFlags = _.unique(buildFlags).sort();
    
    return buildFlags;
};

module.getAllFromProductFlags = (buildFlags) => {
    var allFlags = [];
    var flagsList = config.buildFlagsToProductsMap;
    var keys = _.keys(flagsList);

    buildFlags.forEach((flag) => {
      keys.forEach((key) => {
        if(flagsList[key].indexOf(flag) > -1){
          allFlags.push(key);
        }
      })
    }); 
    
    _.remove(buildFlags, (flag) => {
      return allFlags.indexOf(flag) > -1;
    });
    
    return allFlags.concat(buildFlags);
};