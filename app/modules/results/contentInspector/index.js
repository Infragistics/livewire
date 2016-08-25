module = module.exports

const path =  require('path');
const messenger = require(path.resolve(__dirname, '../../messenger'));

var _source = '';
var _fileInfo = {};

var inspectionRules = [
    {
        description: 'detect Infragistics help documentation topic',
        apply: () => { 
            var hasBuildFlags = false, hasMetadata = false, hasBuildVariables = false;

            hasMetadata = _fileInfo.metadata;
            hasBuildVariables = /{.*?}/.test(_source);
            hasBuildFlags = /ifdef::.*\[/.test(_source);
            
            if(hasMetadata || hasBuildVariables || hasBuildFlags) {
                messenger.publish.metadata('isInfragisticsDocumentationFile');
            } else {
                messenger.publish.metadata('isNotInfragisticsDocumentationFile');
            }
        }
    }
];

module.inspect = (source, fileInfo) => {
    _source = source;
    _fileInfo = fileInfo;

    inspectionRules.forEach((rule) => {
        rule.apply()
    });
};