module.exports = {
	name: "AsciiDoc",
	defaultContent: "= AsciiDoc\n\n",
	extensions: ["adoc", "asciidoc"],
	defaultExtension: "adoc",
	shortcuts: {
		bold: 		{ left : "*", right : "*" },
		italic:		{ left : "_", right : "_" },
		image:		{ left : "image:{0}[alt=\"", right : "\"]", cursorOffset: { value: 6, fromLeft: true } },
		link:		{ left : "link:{0}[", right : "]" },
		code:		{ left : "`", right : "`" },	
		h1:			{ left : "= ", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		h2:			{ left : "== ", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		h3:			{ left : "=== ", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		quote:		{ left : "[quote]\n", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		ordered:	{ left : ". ", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		unordered:	{ left : "*  ", right : "", cursorOffset: { wrapAtBeginningOfLine: true } },
		hr:			{ left : "\n\n'''\n\n", right : "" }
	},
    wrapTextInComment: (text) => {
        return `////\n${text}\n////\n\n`;  
    },
    metadataPatterns: {
        full: /\/\/\/\/\n?\|metadata\|((.|\n)*)\|metadata\|\n?\/\/\/\//,
        left: /\/\/\/\/\n?\|metadata\|/g,
        right: /\|metadata\|\n?\/\/\/\//g
    } 
};