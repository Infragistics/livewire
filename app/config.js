/*jslint node: true */
/*jshint esversion: 6 */

let config = {
	urls: {
		repository : 'https://github.com/infragistics/livewire',
		installers : 'https://github.com/infragistics/livewire/wiki/installers',
		version : 'http://download.infragistics.com/users/livewire/version.json'
	},
	defaultFormat: 'asciidoc',
	cultures: {
		ja: {
			defaultTOCLabel: 'このトピックの内容',
			test: (source) => /[ぁ-ゔゞァ-・ヽヾ゛゜ー]/g.test(source)
		},
		en: {
			defaultTOCLabel: 'In This Topic',
			test: (source) => !config.cultures.ja.test(source)
		},
		detect: (source) => config.cultures.ja.test(source) ? 'ja' : 'en'
	}
};

module.exports = config;