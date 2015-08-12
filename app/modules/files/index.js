module = module.exports;

var 
	files = [],
	 
	path = require('path'),
	messenger = require(path.resolve(__dirname, '../messenger')),
	_ = require('lodash');
	
var getIndex = function(info){
	return _.findIndex(files, function(file){
		return file.path.toLowerCase() === info.filePath.toLowerCase();
	});
};

var handlers = {
	fileOpened: function(data){
		files.push(data);
		messenger.publish.file('contentChanged', data);
	},
	
	fileClosed: function(info){
		
		var indexOfFileToRemove = getIndex(info);
		
		files.splice(indexOfFileToRemove, 1);
		
		var fileInfo = {};
		
		if(files.length > 0){
			fileInfo = files[files.length -1];	
		} else {
			fileInfo.isBlank = true;
		}
		
		messenger.publish.file('contentChanged', fileInfo);
	},
	
	fileSelected: function(info){
		
		var selectedIndex = getIndex(info);
		
		messenger.publish.file('contentChanged', files[selectedIndex]);
	}
};
	
messenger.subscribe.file('fileOpened', handlers.fileOpened);
messenger.subscribe.file('fileClosed', handlers.fileClosed);
messenger.subscribe.file('fileSelected', handlers.fileSelected);