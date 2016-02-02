const fs = require('fs');
const path = require('path');

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
    
    // keeping it simple ;)
    // includes are only supported 4 levels deep
    asciidoc = includeFile(asciidoc, sourceFolder);
    asciidoc = includeFile(asciidoc, sourceFolder);
    asciidoc = includeFile(asciidoc, sourceFolder);
    asciidoc = includeFile(asciidoc, sourceFolder);
    
    return asciidoc;    
}; 