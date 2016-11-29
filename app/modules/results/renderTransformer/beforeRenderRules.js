/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const path = require('path');
const messenger = require(path.resolve(__dirname, '../../messenger'));
const config = require(path.resolve(__dirname, '../../../config.js'));

module.productConfiguration = null;

const rules = [
    {
        description: 'add build flags',
        apply: (source) => {
            var buildFlags = [], flags = '';

            if (module.productConfiguration &&
                module.productConfiguration.products &&
                module.productConfiguration.selectedProduct) {
                buildFlags = module.productConfiguration.products[module.productConfiguration.selectedProduct].buildFlags;
                messenger.publish.metadata('productBuildFlagsChanged', buildFlags);
            } else {
                messenger.publish.metadata('productBuildFlagsChanged', []);
            }

            if (buildFlags.length > 0) {
                flags = `:${buildFlags.join(':\n:')}:\n\n`;
            }

            return flags + source;
        }
    },
    {
        description: 'replace build variables',
        apply: (source) => {
            var matches;

            if (module.productConfiguration &&
                module.productConfiguration.variables &&
                module.productConfiguration.selectedProduct) {
                matches = source.match(/{(.*?)}/g);

                matches = Array.from(new Set(matches));

                if (matches) {
                    matches.forEach((match) => {
                        var key = match.replace(/\{|\}/g, '');
                        var value = module.productConfiguration.variables[module.productConfiguration.selectedProduct][key];
                        if (value) {
                            var regex = new RegExp(match, 'g');
                            source = source.replace(regex, value);
                        }
                    });
                }
            }

            return source;
        }
    },
    {
        description: 'Configure toc macro default text',
        apply: (source) => {
            let culture = config.cultures.detect(source);
            source = source.replace(/toc\:\:\[]/g, `toc::[title="${config.cultures[culture].defaultTOCLabel}"]`);
            return source;
        }
    }
];

module.apply = (source, productConfiguration) => {
    module.productConfiguration = productConfiguration;
    rules.forEach((rule) => {
        source = rule.apply(source);
    });

    return source;
};