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

		  
## Windows Installer		
 
 [You can download the v1.1.002 Windows 64-bit installer here](http://download.infragistics.com/users/livewire/Livewire-1.1.002-win-64.msi).

## Running the App from Source

First, make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/downloads) installed on your machine.

Then run a command prompt as administrator and install Bower (if you don't already have it installed) by executing this command:

    $ npm install -g bower
    
Next, in that administrative prompt, install Gulp:

    $ npm install --g gulp

After Bower and Gulp are installed, in Windows Explorer, open the directory in which you want to download Livewire.  Right-click and choose `Git Bash Here`.  Clone the repository by using this command:

    $ git clone https://github.com/infragistics/livewire.git
	
This will automatically create a `livewire` subdirectory.  Change directories into `livewire`:

    $ cd livewire 
    
Then, install the Livewire dependencies:

    $ npm install
    
Finally, you can start the application:
    
    $ npm start
    
Happy writing!
