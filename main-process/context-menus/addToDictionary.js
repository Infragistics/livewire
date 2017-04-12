/*jslint node: true */
/*jshint esversion: 6 */

const { MenuItem } = require('electron');

module.exports.create = (values, menu, sender) => {
    menu.insert(0, new MenuItem({ type: 'separator' }));

    values.forEach((item) => {
        menu.insert(0, new MenuItem({
            label: item,
            click: () => {
                sender.send('editor-context-menu-add-to-dictionary', { });
            }
        }));
    });

    return menu;
};