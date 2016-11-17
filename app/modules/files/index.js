/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const 
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	dialogs = require(path.resolve(__dirname, '../dialogs')),
	files = {};

let _selectedID = '';

var addFileIfNotInList = (fileInfo) => {
	if(!files[fileInfo.id]) {
		files[fileInfo.id] = fileInfo;
	}
};

const hasUnsavedChanges = () => {
	let returnValue = false;

	Object.keys(files).forEach((key) => {
		if(files[key].isDirty) {
			returnValue = true;
		}
	});

	return returnValue;
};

var handlers = {
	opened: function(data) {
		addFileIfNotInList(data);
		_selectedID = data.id;
		messenger.publish.file('contentChanged', data);
	},
	
	closed: function(info){
		delete files[info.id];
		
		let fileInfo = {};
		let keys = Object.keys(files);
		
		if(keys.length > 0) {
			fileInfo = files[keys[keys.length - 1]]; // gets last opened file	
		} else {
			fileInfo.isBlank = true;
		}
		
		messenger.publish.file('contentChanged', fileInfo);
	},
	
	beforeFileSelected: function(cursorInfo){
		Object.keys(files).forEach((key) => {
			if(files[key].path === cursorInfo.path) {
				files[key].cursorPosition = cursorInfo.position;
			}
		});
	},

	pathChanged: (fileInfo) => { 
		files[fileInfo.id] = fileInfo;
	},
	
	fileSelected: function(fileInfo){
		var selectedFileInfo;

		addFileIfNotInList(fileInfo);

		_selectedID = fileInfo.id;
		
		selectedFileInfo = files[fileInfo.id];
		
		messenger.publish.file('contentChanged', selectedFileInfo);
	},
    
    metadataChanged: (metadata) => {
        files[_selectedID].metadata = metadata;
    },

	dirty: (id) => {
		if(!files[id].isDirty) {
			files[id].isDirty = true;
			messenger.publish.file('isDirty', id);
		}
	},

	clean: (args) => {
		if(args.type === 'path') {
			Object.keys(files).forEach((key) => {
				if(files[key].path.toLowerCase() === args.value.toLowerCase()) {
					files[key].isDirty = false;
					messenger.publish.file('isClean', { type: 'id', value: files[key].id });
				}
			});
		}
	}
};

module.isFileOpen = function(filePath){
	var result = false;

	Object.keys(files).forEach((key) => {
		if(files[key].path.toLowerCase() === filePath) {
			result = true;
		}
	});
	
	return result;
};

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

module.getCurrentFileInfo = () => {
	return files[_selectedID];
};

module.getCurrentMetadataString = (formatter) => {
    var metadata = '';
    
    if(files[_selectedID].metadata){

		metadata = JSON.stringify(files[_selectedID].metadata, null, 4);

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

		metadata = formatter.wrapTextInComment(`|metadata|\n${metadata}\n|metadata|`)
    }
    
    return metadata;
};
	
messenger.subscribe.file('opened', handlers.opened);
messenger.subscribe.file('closed', handlers.closed);
messenger.subscribe.file('selected', handlers.fileSelected);
messenger.subscribe.file('new', handlers.fileSelected);
messenger.subscribe.file('pathChanged', handlers.pathChanged);
messenger.subscribe.file('beforeSelected', handlers.beforeFileSelected);
messenger.subscribe.file('sourceDirty', handlers.dirty);
messenger.subscribe.file('isClean', handlers.clean);
messenger.subscribe.metadata('metadataChanged', handlers.metadataChanged);

window.onbeforeunload = (e) => {
	if(hasUnsavedChanges()) {
		dialogs.messageBox({
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm',
			message: 'You have unsaved work. Are you sure you want to quit?'
		}).then((shouldRemainOpen) => {
			if(!shouldRemainOpen) {
				window.onbeforeunload = () => {};
				window.close();
			}
		});
		e.returnValue = false;
	}
};

