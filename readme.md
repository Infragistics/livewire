# Livewire

A simple web content editor built with [Electron](electron.atom.io).

![Livewire](screenshot.png)

## Features
1. **Multiple Formats**: Supports both [AsciiDoc](http://www.methods.co.nz/asciidoc/) and [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)

2. **Easy to find files**: Double-click on the file name in the tab and an Explorer/Finder window will appear with the file selected.

3. **Global Shortcut**: For an easy way to return back to Livewire, just press `CTRL + F12` (or `CMD + F12` on a Mac) to bring the Livewire window to focus and on top of all windows. 

4. **Distraction-Free Writing**: You can toggle full screen mode by pressing `CTRL + SHIFT + F` and toggle auto-hide of the menu by pressing `CTRL + SHIFT + M`.

5. **Save As HTML**: From the `File` menu you can select to save your current document as HTML or you can use the `CTRL + SHIFT + H` shortcut.

For more information make sure to read the [wiki](https://github.com/craigshoemaker/livewire/wiki).

## Installing and Running the App

### Windows Installer

[You can download the v1.0 Windows 64-bit installer here](http://download.infragistics.com/users/livewire/Livewire-1.0-win-64.exe).

### Pre-requisites

Install [Nodejs](https://nodejs.org/en/download/package-manager/)

Install gulp:

    $ npm install --global gulp

Install bower:
    
    $ npm install -g bower

### Cloning

Clone this repository:

    $ git clone https://github.com/infragistics/livewire.git

Install the Livewire dependencies:

    $ npm install

Install app bower dependencies:

    $ (cd app/ && bower install)

Start the application
    
    $ npm start

Happy writing!
