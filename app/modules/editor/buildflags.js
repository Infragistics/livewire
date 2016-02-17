module = module.exports;

const _ = require('lodash');

var _buildFlags = [];

var buildFlagsExpressions = [
    /ifdef::(.*?)\[\]/g,
    /pick:\[(.*?)\]/gi
];

module.clear = () => {
    _buildFlags = [];
};

module.detect = (content, callback) => {
    var flags = [], buildFlags;
    
    _buildFlags = [];

    buildFlagsExpressions.forEach((expression) => {
        var flagMatch = content.match(expression);
        if(flagMatch){
            flags = flags.concat(flagMatch);
        }
    });

    buildFlags = [];

    if (flags) {
        flags.forEach(function (flag) {
            
            buildFlagsExpressions.forEach((expression, index, values) => {
                
                if(flag.indexOf('ifdef:') > -1){
                    flag = flag.replace(expression, function (match) {
                        return match.replace('ifdef::', '').replace('[]', '');
                    });
                }else if(flag.indexOf('pick:') > -1){
                    flag = flag.replace(expression, function (pickString) {
                        var returnValue = '', flagMatches;
                        
                        flagMatches = pickString.match(/pick:\[(.*?)=.*?\]/);
                        if(flagMatches && flagMatches.length > 1){
                            returnValue = flagMatches[1];
                        }
                        return returnValue;
                    });
                }
                
            });

            buildFlags = buildFlags.concat(flag.split(','));
        });

        buildFlags = _.unique(buildFlags).sort();

        if (_.difference(buildFlags, _buildFlags).length > 0) {
            _buildFlags = buildFlags;
            
            if(callback){
                callback(buildFlags);
            }
        }
    }
};