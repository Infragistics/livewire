/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const path = require('path');
const messenger = require(path.resolve(__dirname, '../messenger'));
const dialogs = require(path.resolve(__dirname, '../dialogs'));
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({
    explicitArray: false
});
const config = require('./index.js').get();
const docsConfig = require('./docsConfig.js');

const configFilePath = config.userDataPath;

var _configuration = null;

module.getXml = (path) => {
    if(!path) {
        path = configFilePath;
    }

    if(!fs.existsSync(path)) {
        var message = `The documentation configuration file does not exist at: ${path}`;
        console.log(`
        
    ** CANNOT FIND CONFIGURATION FILE **

    ${message}`);

        throw new Error(message);
    }

    return fs.readFileSync(path, 'utf8');
};

module.read = (xml) => {
    return new Promise((success, fail) => {
        parser.parseString(xml, (error, obj) => {  
            if(error) fail(error);
            else success(obj);
        });
    });
};

module.getConfigFromDefinition = (definition, productVersion) => {

    var returnValue, config;
    var productKeys = [], variableKeys = [], variableValue = '', sanitizedVariableKey = '', matches = [], item = '';
    var memberDoesNotExist, matchedVariableIsInCurrentValue;

    var isAll = (value) => /all/i.test(value);

    var isSupportedProduct = (value) => !/(sl|win-phone|win-rt)/i.test(value);

    var isObsolete = (value) => /true/i.test(value);

    var getRandomIdentifier = () => Math.floor(Math.random() * 100);

    returnValue = {
        products: {},
        buildFlags: [],
        variables: {}
    };

    config = definition.Configuration;

    config.Products.Product.forEach((product) => {
        var name = product.$.Name; 
        if(!isAll(name) && isSupportedProduct(name) && !isObsolete(product.$.IsObsolete)){
            returnValue.products[name] = {
                buildFlags: product.$.BuildFlags.split(',')
            };
            returnValue.variables[name] = {};
        }
    });

    config.BuildFlags.BuildFlag.forEach((flag) => {
        returnValue.buildFlags.push({
            color: flag.$.Color,
            id: flag.$.Id,
            isObsolete: flag.$.IsObsolete,
            purpose: flag.$.Purpose
        });
    });

    var variablesForAllProducts = {};

    config.Variables.Variable.forEach((variable) => {
        var val = variable.$;
        var variableProducts = val.Products.split(',');

        variableProducts.forEach((product) => {
            if(isAll(product) || isSupportedProduct(product)){
                if(isAll(product)){

                    if(/ProductVersion/i.test(val.Name)){
                        val.Value = productVersion;
                    }

                    variablesForAllProducts[val.Name] = val.Value;

                    var productKeys = Object.keys(returnValue.products);
                    productKeys.forEach((productKey) => {
                        var productItem = returnValue.products[productKey];
                        returnValue.variables[productKey][val.Name] = val.Value;
                    });
                    
                } else {
                    var productName = product.replace('.', '-');
                    returnValue.variables[productName][val.Name] = val.Value;
                }
            }
        });
    });


    productKeys = Object.keys(returnValue.variables);

    productKeys.forEach((productKey) => {

        variableKeys = Object.keys(returnValue.variables[productKey]);

        variableKeys.forEach((variableKey) => {
            variableValue = returnValue.variables[productKey][variableKey];

            matches = variableValue.match(/\{(.+?)\}/g);

            if(matches){
                matches.forEach((match) => {

                    variableValue = returnValue.variables[productKey][variableKey];
                    matchedVariableIsInCurrentValue = variableValue.indexOf(match) !== -1;
                    sanitizedVariableKey = match.replace(/[\{|\}]/g, '');
                    memberDoesNotExist = !returnValue.variables[productKey][sanitizedVariableKey];
                    var memberDoesNotExistForAll = !variablesForAllProducts[sanitizedVariableKey];

                    if(memberDoesNotExist){
                        if(memberDoesNotExistForAll){
                            returnValue.variables[productKey][variableKey] = variableValue.replace(match, '');
                        } else {
                            returnValue.variables[productKey][variableKey] = variableValue.replace(match, variablesForAllProducts[sanitizedVariableKey]);
                        }
                    } else if(matchedVariableIsInCurrentValue){                            
                        returnValue.variables[productKey][variableKey] = 
                            variableValue.replace(match, returnValue.variables[productKey][sanitizedVariableKey]);
                    }
                });
            }
        });
    });

    // uncomment only for testing purposes
    //fs.writeFileSync(require('path').join(__dirname, '../spec/data/DocsConfig.json'), JSON.stringify(returnValue, null, 2));

    return returnValue;
};

var readFromFileSystem = true;

var handlers = {
    getVersionNumbers: (options) => {
        if(readFromFileSystem || options.readFromFileSystem) {
            var directoryPath = config.userDataPath;
            fs.readdir(directoryPath, (error, files) => {
                if(error){
                    dialogs.messageBox({
                        message: `Error trying to read version numbers from: ${directoryPath}`,
                        detial: JSON.stringify(error)
                    });
                } else {
                    var versionNumbers = [];

                    var configFiles = files.filter((configFileName) => {
                        return docsConfig.isDocsConfigFileName(configFileName);
                    });

                    if(configFiles.length > 0) {

                        configFiles.forEach((fileName) => {
                            versionNumbers.push(docsConfig.getVersionFromFileName(fileName));
                        });

                        messenger.publish.metadata('productVersionNumbersChanged', versionNumbers);
                    } else {
                        messenger.publish.metadata('noDocsConfigFound');
                        readFromFileSystem = false;
                    }
                }
            });
        }
    },
    getConfiguration: (args) => {

        if(args.hasValue){
            if(_configuration){
                messenger.publish.metadata('productConfigurationChanged', _configuration);
                messenger.publish.metadata('productListChanged', _configuration.products);
            } else {
                var configurationFilePath = path.join(configFilePath, 'livewire-docsConfig-' + args.value.replace('.', '-') + '.xml');
                var xml = module.getXml(configurationFilePath);
                module.read(xml).then((obj, error) => {
                    if(error) {
                        dialogs.messageBox({
                            message: `Error trying to read configuration information from: ${configurationFilePath}`,
                            detial: JSON.stringify(error)
                        });
                    } else {
                        _configuration = module.getConfigFromDefinition(obj, args.value);
                        messenger.publish.metadata('productConfigurationChanged', _configuration);
                        messenger.publish.metadata('productListChanged', _configuration.products);
                    }
                });
            }
        } else {
            _configuration = null;
            messenger.publish.metadata('productConfigurationChanged', {});
            messenger.publish.metadata('productListChanged', []);
        }

    }
};

messenger.subscribe.metadata('getProductVersionNumbers', handlers.getVersionNumbers);
messenger.subscribe.metadata('productVersionSelectionChanged', handlers.getConfiguration);