const fs = require('fs');
const path = require('path');

const INCLUDE_SUPPORT_DEPTH = 4;

var includeFile = (asciidoc, sourceFolder) => {
    var filePath;
    
    asciidoc = asciidoc.replace(/include::(.*?)\[\]/gi, (match, g) => {
        filePath = path.resolve(sourceFolder, g);
        if(fs.existsSync(filePath)){
            match = fs.readFileSync(filePath, 'utf8').trim();
        }
        return match;
    });
    
    return asciidoc;
};

module.exports.apply = (asciidoc, sourceFolder) => {
    
    for (var i = 0; i < INCLUDE_SUPPORT_DEPTH; i++) {
        asciidoc = includeFile(asciidoc, sourceFolder);
    }
    
    return asciidoc;    
}; 