module = module.exports;

var PICK_EXPRESSION = /pick:\[(.*?)"]/g;

var getMacroMatches = (src) => {
    var matches = src.match(PICK_EXPRESSION);
    if(matches && matches.length > 0){
        return matches;
    } 
    return [];
};

var removeLeftoverPicks = (src) => {
    return src.replace(PICK_EXPRESSION, '');
};

var getMatch = (matches) => {
    var match = '';
    if(matches && matches.length > 0){
        match = matches[1];
    }
    return match;
};

var getParts = (match) => {
    if(match){
        return match.split(';');
    }
    return '';
};

var cleanMatch = (src) => {
    src = src.replace(/\"/g, '');
    src = src.replace('pick:[', '');
    if(src[src.length -1] === ']'){
        src = src.substr(0, src.length - 1);
    }
    return src;
};

var createMatchParts = (src) => {
    if(src){
        return src.split(';');
    }
    return [];
};

var getFlagList = (src) => {
    var matches = src.match(/(.+)=/);
    var list = [];
    if (matches && matches.length >= 2) {
        list = matches[1].split('.'); // todo: change back to ;
    }
    return list;
};

var getContent = (src) => {
    var matches = src.match(/=(.+)/);
    var content = '';
    if (matches && matches.length >= 2) {
        content = matches[1];
    }
    return content;
};

module.process = (asciidoc, buildFlags) => {
    if (typeof buildFlags !== 'undefined' && buildFlags !== null) {
        var matches, match, parts;

        matches = getMacroMatches(asciidoc);
        match = getMatch(matches);
        parts = getParts(match);

        matches.forEach((match) => {
            var text = cleanMatch(match);
            var parts = createMatchParts(text);
            parts.forEach((part) => {
                var replaceValue = '';
                var flagsList = getFlagList(part);
                var content = getContent(part);
                for (var i = 0; i < flagsList.length; i++) {
                    var flag = flagsList[i];
                    if (buildFlags.indexOf(flag) >= 0) {
                        replaceValue = content;
                        break;
                    }
                }
                
                if(replaceValue.length > 0){
                    asciidoc = asciidoc.replace(match, replaceValue);
                }
            });
        });
    }
    
    asciidoc = removeLeftoverPicks(asciidoc);
    
    return asciidoc;
};