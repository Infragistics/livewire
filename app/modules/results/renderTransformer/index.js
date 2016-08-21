module = module.exports;

const path = require('path');
const beforeRenderRules = require(path.resolve(__dirname, './beforeRenderRules.js'));
const afterRenderRules = require(path.resolve(__dirname, './afterRenderRules.js'));

module.beforeRender = (source, productConfiguration) => {
    return beforeRenderRules.apply(source, productConfiguration);
};

module.afterRender = (source, productConfiguration) => {
    return source;
};