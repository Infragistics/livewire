/*jslint node: true */
/*jshint esversion: 6 */

const { MenuItem } = require('electron');

module.exports.create = (values, menu, sender) => {
    menu.insert(0, new MenuItem({ type: 'separator' }));

    values.forEach((suggestion) => {
        menu.insert(0, new MenuItem({
            label: suggestion,
            click: () => {
                sender.send('editor-context-menu-replace-mispelling', { replacementWord: suggestion });
            }
        }));
    });

    return menu;
};