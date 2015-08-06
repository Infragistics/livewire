# Livewire

An simple web content editor built with [Electron](electron.atom.io).

![Livewire](screenshot.png)

## Features
1. **Muliple Formats**: Supports both [AsciiDoc](http://www.methods.co.nz/asciidoc/) and [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)

1. **Easy to find files**: Once you save your file, the name appears in the bar at the bottom of the window. If you click on the bar an Explorer/Finder window will open with the file selected.

2. **Global Shortcut**: For an easy way to return back to Livewire, just press `CTRL + F12` (or `CMD + F12` on a Mac) to bring the Livewire window to focus and on top of all windows. 

3. **Distraction-Free Writing**: You can toggle full screen mode by pressing `CTRL + SHIFT + F` and toggle auto-hide of the menu by pressing `CTRL + SHIFT + M`.

4. **Save As HTML**: From the `File` menu you can select to save your current document as HTML.

For more informaiton make sure to read the [wiki](https://github.com/craigshoemaker/livewire/wiki).

## Running the App
There are _no installers available at the moment_, so for now you can get the code directly and run from there. 

Clone this repository:

    $ git clone https://github.com/craigshoemaker/Livewire.git
    
Install the node dependencies:

    $ npm install
   
Install the app dependencies:

    $ cd app
    $ npm install
    $ bower install
    
Return back to the main folder:

    $ cd..
    
Start the application
    
    $ npm start
    
Now you can start writing Markdown!
