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
		hr:			{ left : "\n\n'''\n\n", right : "" },
		comment:	{ left : "////\n", right : "\n////\n\n" }
	},
    wrapTextInComment: (text) => {
        return `////\n${text}\n////\n\n`;  
    },
    metadataPatterns: {
        full: /\/{4,4}\s{0,}\|metadata\|(.|\s)+?\|metadata\|\s{0,}\/{4,4}/,
        left: /\/{4,4}\s{0,}\|metadata\|/g,
        right: /\|metadata\|\s{0,}\/{4,4}/g
    } 
};