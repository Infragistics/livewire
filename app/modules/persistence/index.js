/* global ace */
module = module.exports;

var 
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  uuid = require('node-uuid'),
  
  dialogs = require(path.resolve(__dirname, '../dialogs')),
  messenger = require(path.resolve(__dirname, '../messenger')),
  formats = require(path.resolve(__dirname, '../formats')),
  files = require(path.resolve(__dirname, '../files')),
  
  editor,
  filePath = '',
  basePath = '',
  formatter = null,
  $result = $('#result'),
  BOM = '\ufeff';

messenger.subscribe.file('pathChanged', function (data, envelope) {
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
      basePath: '',
      isFileAlreadyOpen: false
    };
  } else {
    returnValue = { 
      path: filePath, 
      ext: path.extname(filePath).replace('.', ''),
      fileName: path.basename(filePath),
      basePath: path.dirname(filePath),
      isFileAlreadyOpen: files.isFileOpen(filePath)
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
       
    messenger.publish.file('pathChanged', fileInfo);
    
    fileInfo.contents = formatter.defaultContent; 
    messenger.publish.file('new', fileInfo);
    messenger.publish.file('opened', fileInfo);
  },

  open: function (data, envelope) {
    var options, supportedFormats, allFormats;
    
    options = {
      title: 'Open',
      filters: []
    };

    supportedFormats = formats.getAll();
    
    allFormats = {
      name: 'All',
      extensions: []
    };

    supportedFormats.forEach(function (format) {
      options.filters.push({ name: format.name, extensions: format.extensions });
      allFormats.extensions = allFormats.extensions.concat(format.extensions);
    });
    
    options.filters.unshift(allFormats);

    dialogs.openFile(options).then(function (response) {
      var fileInfo;
      
      filePath = response.path;
      basePath = path.dirname(filePath);

      fileInfo = getFileInfo(response.path);
      fileInfo.size = response.size;
      
      formatter = formats.getByFileExtension(fileInfo.ext);
      
      messenger.publish.file('pathChanged', fileInfo);
      
      if(!fileInfo.isFileAlreadyOpen){
        fileInfo.contents = _.trimLeft(response.content, BOM); 
        messenger.publish.file('opened', fileInfo);
      }
    });
  },

  save: function (data, envelope) {
    var fileContent, editor;

    editor = ace.edit('editor');
    fileContent = editor.getValue();
    
    if(fileContent.length > 0){
      if (filePath.length > 0) {
        if (!_.startsWith(fileContent, BOM)) {
          fileContent = BOM + fileContent;
        }
  
        fs.writeFile(filePath, fileContent, { encoding: 'utf8' }, function (err) {
          // todo: handle error
        });
      } else {
        menuHandlers.saveAs(data, envelope);
      }
    }
  },
  
  saveAs: function(data, envelope){
    var fileContent, options, defaultExtension, editor;

    editor = ace.edit('editor');
    fileContent = editor.getValue();

    options = {
      title: 'Save File',
      filters: []
    };

    if (!_.startsWith(fileContent, BOM)) {
      fileContent = BOM + fileContent;
    }

    defaultExtension = '';

    if (formatter !== null) {
      defaultExtension = formatter.defaultExtension;
    }
    
    options.filters.push({ name: formatter.name, extensions: [formatter.defaultExtension] });

    dialogs.saveFile(fileContent, options, defaultExtension).then(function (newFilePath) {
      var fileInfo;

      filePath = newFilePath;
      basePath = path.dirname(filePath);

      fileInfo = getFileInfo(filePath);

      fileInfo.isSaveAs = true;

      messenger.publish.file('pathChanged', fileInfo);
      messenger.publish.file('rerender');
    });

  },

  saveAsHtml: function (data, envelope) {
    var options, exp, html;
    
    options = {
      title: 'Save As HTML',
      filters: [
        { name: 'HTML', extensions: ['html'] }
      ]
    };
      
    // special characters in regex are craaaaazy
    exp = new RegExp('src="' + basePath.replace(/\\/g, '\\\\') + '\\\\', 'gi');

    html = $result.html();
    html = html.replace(exp, 'src="');
    html = '<!doctype html>\n<body>\n' + html + '</body>\n</html>';

    dialogs.saveFile(html, options, 'html').catch(function () {
      // todo: handle error
    });
  }
};

var fileHandlers = {
  fileSelected: function(fileInfo, envelope){
    filePath = fileInfo.path;
    basePath = fileInfo.basePath;
    formatter = formats.getByFileExtension(fileInfo.ext);
  }
};

messenger.subscribe.menu('new', menuHandlers.newFile);
messenger.subscribe.menu('open', menuHandlers.open);
messenger.subscribe.menu('save', menuHandlers.save);
messenger.subscribe.menu('saveAs', menuHandlers.save);
messenger.subscribe.menu('saveAsHtml', menuHandlers.saveAsHtml);

messenger.subscribe.file('selected', fileHandlers.fileSelected);