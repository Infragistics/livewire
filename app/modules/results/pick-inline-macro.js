/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const patterns = {
    pickMacros: /pick:\[(.*?)"]/g,
    buildFlags: /\[(.*?)=/,
    innerAsciiDoc: /="(.+)"]/
};

var getPickMacros = (src) => {
    var matches = src.match(patterns.pickMacros);
    if (matches && matches.length > 0) {
        return matches;
    }
    return [];
};

var getMacroFlags = (src) => {
    var result = patterns.buildFlags.exec(src);
    if (result && result.length >= 2) {
        return result[1].split(',');
    }
    return [];
};

var getInnerAsciiDoc = (src) => {
    var result = patterns.innerAsciiDoc.exec(src);
    if (result && result.length >= 2) {
        return result[1];
    }
    return '';
};

var macroUsesGivenBuildFlags = (src, buildFlags) => {
    var flags = getMacroFlags(src), returnValue = false;
    for (var i = 0; i < flags.length; i++) {
        if (buildFlags.indexOf(flags[i]) > -1) {
            returnValue = true;
            break;
        }
    }
    return returnValue;
};

var removeNonMatchingMacros = (src) => {
    return src.replace(patterns.pickMacros, '');
};

module.process = (asciidoc, buildFlags) => {

    if (typeof buildFlags !== 'undefined' &&
               buildFlags !== null &&
               buildFlags.length > 0) {

        var pickMacros = getPickMacros(asciidoc);

        pickMacros.forEach((macro) => {
            if (macroUsesGivenBuildFlags(macro, buildFlags)) {
                var innerAsciiDoc = getInnerAsciiDoc(macro);
                asciidoc = asciidoc.replace(macro, innerAsciiDoc);
            }
        });
    }

    asciidoc = removeNonMatchingMacros(asciidoc);

    return asciidoc;
};