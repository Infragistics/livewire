module = module.exports;

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var dialogs = require(path.resolve(__dirname, '../dialogs'));
var messenger = require(path.resolve(__dirname, '../messenger'));

var editor;

var filePath = '';
var basePath = '';

var formats = require(path.resolve(__dirname, '../formats'));
var formatter = null;

var $result = $('#result');

var BOM = '\ufeff';


module.init = function (editorInstance) {
  editor = editorInstance;
};

messenger.subscribe.file('file.pathInfo', function (data, envelope) {
  if (data.isNewFile) {
    filePath = '';
    basePath = '';
  }
});

var menuHandlers = {

  newFile: function (data, envelope) {
    var formatName = envelope.data.format;
    formatter = formats.get(formatName);
    messenger.publish.format('selectedFormat', formatter);
    messenger.publish.file('file.pathInfo', { isNewFile: true });
    editor.setValue(formatter.defaultContent);
    editor.clearSelection();
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

      var data = { path: response.path, ext: path.extname(response.path).replace('.', '') };
      formatter = formats.getByFileExtension(data.ext);
      messenger.publish.format('selectedFormat', formatter);

      messenger.publish.file('file.pathInfo', data);

      var content = _.trimLeft(response.content, BOM);

      editor.setValue(content);
      editor.clearSelection();
    });

  },

  save: function (data, envelope) {

    var content = editor.getValue();
    if (!_.startsWith(content, BOM)) {
      content = BOM + content;
    }

    if (filePath.length > 0) {
      fs.writeFile(filePath, content, { encoding: 'utf8' }, function (err) {
        // todo: handle error
      });
    } else {
      menuHandlers.saveAs(data, envelope);
    }
  },

  saveAs: function (data, envelope) {
    var options = {
      title: 'Save File'
    };

    var content = editor.getValue();
    if (!_.startsWith(content, BOM)) {
      content = BOM + content;
    }

    var defaultExtension = '';

    if (formatter !== null) {
      defaultExtension = formatter.defaultExtension;
    }

    dialogs.saveFile(content, options, defaultExtension).then(function (newFilePath) {
      filePath = newFilePath;
      basePath = path.dirname(filePath);
      messenger.publish.file('file.pathInfo', { path: filePath });
      messenger.publish.text('rerender');
    });
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

messenger.subscribe.menu('file.new', menuHandlers.newFile);
messenger.subscribe.menu('file.open', menuHandlers.open);
messenger.subscribe.menu('file.save', menuHandlers.save);
messenger.subscribe.menu('file.saveAs', menuHandlers.saveAs);
messenger.subscribe.menu('file.saveAsHtml', menuHandlers.saveAsHtml);