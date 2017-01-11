module = module.exports;

const 
    _ = require('lodash'),
    path = require('path'),
    messenger = require(path.resolve(__dirname, '../messenger'));

const buildFlagsExpressions = [
    /ifdef::(.*?)\[\]/g,
    /pick:\[(.*?)\]/gi
];

module.detect = (content) => {
    if(content) {
        var flags = [], buildFlags = [];

        buildFlagsExpressions.forEach((expression) => {
            var flagMatch = content.match(expression);
            if(flagMatch){
                flags = flags.concat(flagMatch);
            }
        });

        flags.forEach((flag) => {
            
            buildFlagsExpressions.forEach((expression) => {
                
                if(flag.indexOf('ifdef:') > -1){
                    flag = flag.replace(expression, (ifdefString) => {
                        return ifdefString.replace('ifdef::', '').replace('[]', '');
                    });
                } else if(flag.indexOf('pick:') > -1){
                    flag = flag.replace(expression, (pickString) => {
                        var returnValue = '', flagMatches;
                        
                        flagMatches = pickString.match(/pick:\[(.*?)=.*?\]/);
                        if(flagMatches && flagMatches.length > 1){
                            returnValue = flagMatches[1];
                        }
                        return returnValue;
                    });
                }
            });
            
            var splitChar = ',';
            
            if(flag.indexOf('.') > -1){
                splitChar = '.';
            }

            buildFlags = buildFlags.concat(flag.split(splitChar));            
        });

        buildFlags = _.uniq(buildFlags).sort();
        messenger.publish.metadata('buildFlags', buildFlags);
    }
};