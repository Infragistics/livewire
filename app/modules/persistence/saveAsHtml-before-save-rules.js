/*jslint node: true */
/*jshint esversion: 6 */

var $;
const BOM = '\ufeff';

var rules = [
    {
        description: 'fix image paths',
        apply: (html, args) => {
            var exp = new RegExp('src="' + args.basePath.replace(/\\/g, '\\\\') + '\\\\', 'gi');
            return html.replace(exp, 'src="');
        }
    },
    {
        description: 'clean up special characters',
        apply: (html) => {
            html = html.replace(/…​/g, '...');
            return html.replace(/’/g, "'");
        }
    },
    {
        description: 'add "inline" class to CODE elements not in a PRE',
        apply: (html) => {
            var $html = $(`<div>${html}</div>`);
            $html.find('code').addClass('inline');
            $html.find('pre code').removeClass('inline');
            return $html.html();
        }
    },
    {
        description: 'apply HTML structure and add BOM',
        apply: (html) => {
            return `${BOM}<!DOCTYPE html>
<html>
    <body>
    ${html}
    </body>
</html>`;
        }
    }
];

module.exports.apply = (html, args, _$) => {
    $ = _$;
    rules.forEach((rule) => {
        html = rule.apply(html, args);
    });
    return html;
};