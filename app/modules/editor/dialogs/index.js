module = module.exports;

const
    path = require('path'),
    fs = require('fs');

var 
    formatterModule,
    $dialogsContainer;
    
var dialogs = {
    links: require(path.resolve(__dirname, './links/index.js')),
    images: require(path.resolve(__dirname, './images/index.js')),
    metadata: require(path.resolve(__dirname, './metadata/index.js'))
};

var registerDialog = (name, filePath) => {
    
    if(filePath){
        fs.readFile(path.resolve(__dirname, filePath), 'utf8', (error, templateHtml) => {
            if(error) {
                console.log(error);
            } else {
                $dialogsContainer.append(templateHtml);
                dialogs[name].init(formatterModule, module);
            };
        });
    } else {
        dialogs[name].init(formatterModule, module);
    }
};

module.buildDialogCommand = (name, shortcut, callback) => {
	return {
		name: name,
		bindKey: { 
			win: shortcut.replace(/Command/, 'Ctrl'), 
			mac: shortcut.replace(/Ctrl/, 'Command') 
        },
		exec: callback
	};
};

module.init = (formatterModuleInstance) => {
    formatterModule = formatterModuleInstance;
    
    $(() => {
        $dialogsContainer = $('#dialogs-container');
        
        registerDialog('links', './links/template.html');
        registerDialog('images');
        registerDialog('metadata', './metadata/template.html');
    });
};
