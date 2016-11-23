/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const 
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	metadataCleanUpRules = require('./metadata-cleanup-rules.js'),
	uuid = require('node-uuid'),
	files = {};

let _selectedID = '';

var addFileIfNotInList = (fileInfo) => {
	if(!files[fileInfo.id]) {
		files[fileInfo.id] = fileInfo;
	}
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
		files[_selectedID].isDirty = true;
		messenger.publish.file('isDirty', _selectedID);
    },

	dirty: (id) => {
		if(!files[id].isDirty) {
			files[id].isDirty = true;
			messenger.publish.file('isDirty', id);
		}
	},

	cleanByFilePath: (filePath) => {
		Object.keys(files).forEach((key) => {
			if(files[key].path.toLowerCase() === filePath.toLowerCase()) {
				files[key].isDirty = false;
				messenger.publish.file('isCleanById', files[key].id);
			}
		});
	},

	newId: (args) => {
		let isPathEmpty = !args.path || args.path.length === 0;
		if(!files[args.id] && isPathEmpty) {
			files[args.id] = module.getFileInfo(null, args.formatter);
		}
	},

	saveAsComplete: (args) => {
		Object.keys(files).forEach((key) => {
			if(files[key].id === args.id) {
				files[key].path = args.path;
				files[key].ext = path.extname(args.path).replace('.', '');
				files[key].fileName = path.basename(args.path);
				files[key].basePath = path.dirname(args.path);
			}
		});
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

module.getFileInfo = (filePath, formatter) => {
    var returnValue;

    if (!filePath) {
        returnValue = {
            path: '',
            ext: formatter.defaultExtension,
            fileName: 'untitled.' + formatter.defaultExtension,
            basePath: '',
            isFileAlreadyOpen: false
        };
    } else {
        returnValue = {
            path: filePath,
            ext: path.extname(filePath).replace('.', ''),
            fileName: path.basename(filePath),
            basePath: path.dirname(filePath),
            isFileAlreadyOpen: module.isFileOpen(filePath)
        };
    }

    returnValue.id = uuid.v1();

    return returnValue;
};

module.hasUnsavedChanges = () => {
	let hasDirtyFiles = false;
	Object.keys(files).forEach((key) => {
		if(files[key].isDirty) {
			hasDirtyFiles = true;
		}
	});
	return hasDirtyFiles;
};

module.isFileDirty = (id) => files[id] && files[id].isDirty;

module.getDirtyFileList = () => {
	let list = [];
	Object.keys(files).forEach((key) => {
		if(files[key].isDirty) {
			list.push(files[key].fileName);
		}
	});
	return list;
};

module.getCurrentFileInfo = () => files[_selectedID];

module.getCurrentID = () => _selectedID;

module.getCurrentMetadataString = (formatter) => {
    let metadata = '';
	
    if(files[_selectedID].metadata){
		metadata = JSON.stringify(files[_selectedID].metadata, null, 4);
		metadata = metadataCleanUpRules.apply(metadata);
		metadata = formatter.wrapTextInComment(`|metadata|\n${metadata}\n|metadata|`);
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
messenger.subscribe.file('isCleanByFilePath', handlers.cleanByFilePath);
messenger.subscribe.file('newId', handlers.newId);
messenger.subscribe.file('saveAsComplete', handlers.saveAsComplete);
messenger.subscribe.metadata('metadataChanged', handlers.metadataChanged);