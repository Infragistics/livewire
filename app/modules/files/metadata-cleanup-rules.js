/*jslint node: true */
/*jshint esversion: 6 */

var indentSpaces =  '    "';

const metadataCleanUpRules = {
	arrays: [
		{
			description: 'strips line breaks from array definitions',
			pattern: /\n/g,
			replacement: (match) => ''
		},
		{
			description: 'strips stray spaces after array brackets',
			pattern: /\[\s+/g,
			replacement: (match) => '['
		},
		{
			description: 'strips stray spaces before array brackets',
			pattern: /"\s+]/g,
			replacement: (match) => '"]'
		},
		{
			description: 'strips stray spaces after property members',
			pattern: /,\s+/g,
			replacement: (match) => ','
		},
		{
			description: 'ensures indentation is uniform',
			pattern: /\s\]/g,
			replacement: (match) => ']'
		},
		{
			description: 'strips stray line before line break',
			pattern: /\s+\n/g,
			replacement: (match) => '\n'
		}
	],
	all: [
		{
			description: 'adds missing line breaks to members',
			pattern: /\],\"/g,
			replacement: (match) => `],\n${indentSpaces}`
		},
		{
			description: 'removes extra spaces between array brackets',
			pattern: /" \],/g,
			replacement: (match) => '"],'
		},
		{
			description: 'makes spaces before members uniform',
			pattern: /\n {1,}"/g,
			replacement: (match) => `\n${indentSpaces}`
		}
	]
};

module.exports.apply = (metadata) => {
    
    const firstIndentPattern = /(\s+)\"/;
    var indentSpaceMatch = metadata.match(firstIndentPattern);

    if(indentSpaceMatch && indentSpaceMatch.length > 0){
        indentSpaces = indentSpaceMatch[0].replace('\n', '');
    }

    const arrayItemPattern = /\[((\s|.)+?)\]/g;
    metadata = metadata.replace(arrayItemPattern, (match, array) => {
        metadataCleanUpRules.arrays.forEach((rule) => {
            match = match.replace(rule.pattern, rule.replacement);    
        });
        return match;
    });

    metadataCleanUpRules.all.forEach((rule) => {
        metadata = metadata.replace(rule.pattern, rule.replacement);
    });

    return metadata;
};