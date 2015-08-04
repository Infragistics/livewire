# ElectricText

A [AsciiDoc](http://www.methods.co.nz/asciidoc/) and [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) editor built with [Electron](electron.atom.io).

![](screenshot.png)

## Features
1. **Easy to find files**: Once you save your file, the name appears in the bar at the bottom of the window. If you click on the bar an Explorer/Finder window will open with the file selected.

2. **Global Shortcut**: For an easy way to return back to ElectricText, just press `CTRL + F12` (or `CMD + F12` on a Mac) to bring the ElectricText window to focus and on top of all windows. 

3. **Distraction-Free Writing**: You can toggle full screen mode by pressing `CTRL + SHIFT + F` and toggle auto-hide of the menu by pressing `CTRL + SHIFT + H`.

## Formatting Shortcuts
Description | Shortcut
---| ---|
**Bold** | CTRL + B
*Italic* | CTRL + I
[Link]() | CTRL + K
`Code` | CTRL + D
Heading 1 | CTRL + 1
Heading 2 | CTRL + 2
Heading 3 | CTRL + 3
Quote | CTRL + '
Unordered list item | CTRL + .
Ordered list item | CTRL + ,
Horizontal Rule | CTRL + H

**Note:** Replace `CTRL` for `CMD` on a Mac.

## Running the App
There are no installers available at the moment, so for now you can get the code directly from GitHub and run from there. 

Clone this repository:

    $ git clone https://github.com/craigshoemaker/electrictext.git
    
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
