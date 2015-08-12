module = module.exports;

var 
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  uuid = require('node-uuid'),
  
  dialogs = require(path.resolve(__dirname, '../dialogs')),
  messenger = require(path.resolve(__dirname, '../messenger')),
  formats = require(path.resolve(__dirname, '../formats')),
  
  editor,
  filePath = '',
  basePath = '',
  formatter = null,
  $result = $('#result'),
  BOM = '\ufeff';

module.init = function (editorInstance) {
  editor = editorInstance;
};

messenger.subscribe.file('file.pathInfo', function (data, envelope) {
  if (data.isNewFile) {
    filePath = '';
    basePath = '';
  }
});

var getFileInfo = function(filePath, formatter){
  var returnValue;
  
  if(filePath === null){
    returnValue = { 
      path: '', 
      ext: formatter.defaultExtension,
      fileName: 'untitled.' + formatter.defaultExtension,
      basePath: ''
    };
  } else {
    returnValue = { 
      path: filePath, 
      ext: path.extname(filePath).replace('.', ''),
      fileName: path.basename(filePath),
      basePath: path.dirname(filePath)
    };
  }
  
  returnValue.id = uuid.v1();
  
  return returnValue;
};

var menuHandlers = {

  newFile: function (data, envelope) {
    var formatName, fileInfo;
    
    filePath = '';
    basePath = '';
    
    formatName = envelope.data.format;
    formatter = formats.get(formatName);

    fileInfo = getFileInfo(null, formatter);
       
    messenger.publish.file('file.pathInfo', fileInfo);
    
    fileInfo.contents = formatter.defaultContent; 
    messenger.publish.file('fileOpened', fileInfo);
  },

  open: function (data, envelope) {
    var options = {
      title: 'Open',
      filters: []
    };

    var supportedFormats = formats.getAll();

    supportedFormats.forEach(function (format) {
      options.filters.push({ name: format.name, extensions: format.extensions });
    });

    dialogs.openFile(options).then(function (response) {
      filePath = response.path;
      basePath = path.dirname(filePath);

      var fileInfo = getFileInfo(response.path);
      
      formatter = formats.getByFileExtension(fileInfo.ext);
      
      messenger.publish.file('file.pathInfo', fileInfo);
      
      fileInfo.contents = _.trimLeft(response.content, BOM); 
      messenger.publish.file('fileOpened', fileInfo);
    });

  },

  save: function (data, envelope) {
    messenger.publish.file('getSource');      
  },

  saveAsHtml: function (data, envelope) {
    var options = {
      title: 'Save As HTML'
    };
      
    // special characters in regex are craaaaazy
    var exp = new RegExp('src="' + basePath.replace(/\\/g, '\\\\') + '\\\\', 'gi');

    var html = $result.html();
    html = html.replace(exp, 'src="');
    html = '<!doctype html>\n<body>\n' + html + '</body>\n</html>';

    dialogs.saveFile(html, options, 'html').catch(function () {
      // todo: handle error
    });
  }
};

var fileHandlers = {
    save: function(data, envelope){
    var fileContent, options, defaultExtension;
    
    fileContent = data.source;
    
    if(filePath.length > 0){
      if (!_.startsWith(fileContent, BOM)) {
        fileContent = BOM + fileContent;
      }

      fs.writeFile(filePath, fileContent, { encoding: 'utf8' }, function (err) {
        // todo: handle error
      }); 
    } else {
      
      options = {
        title: 'Save File'
      };
      
      if (!_.startsWith(fileContent, BOM)) {
        fileContent = BOM + fileContent;
      }
      
      defaultExtension = '';
      
      if (formatter !== null) {
        defaultExtension = formatter.defaultExtension;
      }
      
      dialogs.saveFile(fileContent, options, defaultExtension).then(function (newFilePath) {
        var fileInfo;
        
        filePath = newFilePath;
        basePath = path.dirname(filePath);
      
        fileInfo = getFileInfo(filePath);
        
        fileInfo.isSaveAs = true; 
        
        messenger.publish.file('file.pathInfo', fileInfo);
        messenger.publish.file('rerender');
      });
    }
  },
}

messenger.subscribe.menu('file.new', menuHandlers.newFile);
messenger.subscribe.menu('file.open', menuHandlers.open);
messenger.subscribe.menu('file.save', menuHandlers.save);
messenger.subscribe.menu('file.saveAs', menuHandlers.save);
messenger.subscribe.menu('file.saveAsHtml', menuHandlers.saveAsHtml);

messenger.subscribe.file('getSourceComplete', fileHandlers.save);