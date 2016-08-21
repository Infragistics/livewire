module = module.exports;

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({
    explicitArray: false
});

const configFilePath = path.resolve('../../../DocsConfig.xml');

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

module.getConfiguration = (configFilePath, productVersion) => {
    return new Promise((success, fail) => {
        var xml = module.getXml(configFilePath);
        module.read(xml).then((obj, error) => {
            if(error) {
                fail(error);
            } else {
                var config = module.getConfigFromDefinition(obj, productVersion);
                success(config);
            }
        });
    });
};