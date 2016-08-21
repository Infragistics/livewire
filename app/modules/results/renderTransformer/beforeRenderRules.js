module = module.exports;

module.productConfiguration = null;

const rules = [
    {
        description: 'replace build variables',
        apply: (source) => {
            var matches = source.match(/{(.*?)}/g);

            matches = Array.from(new Set(matches));

            if(matches) {
                matches.forEach((match) => {
                    var key = match.replace(/\{|\}/g, '');
                    var value = module.productConfiguration.variables[module.productConfiguration.selectedProduct][key]; 
                    if(value) {
                        var regex = new RegExp(match, 'g');
                        source = source.replace(regex, value);
                    }
                });
            }
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