/*jslint node: true */
/*jshint esversion: 6 */

module.exports = (word, wordAlphaOnly, defaultDictionary, customDictionary) => {

  if(word.length <= 0) return false;

  var returnValue = true;
  
  if(
      
        /* ----------------------------
            Looks for words in the default dictionary
           ----------------------------- */
      defaultDictionary[wordAlphaOnly.toLowerCase()]

        /* ----------------------------
            Looks for words in the user's custom dictionary
           ----------------------------- */
      || customDictionary[wordAlphaOnly.toLowerCase()]

        /* ----------------------------
            AsciiDoc image macro:

            image::screeshot.png

                or

            image:screenshot.png
           ----------------------------- */
      || /^image::?/i.test(word)


        /* ----------------------------
            AsciiDoc pic macro:

            pick:[asp-net="ASP.NET"]
           ----------------------------- */
      || /^pick:/i.test(word)


        /* ----------------------------
            AsciiDoc ifdef macro:

            ifdef::xaml[]
           ----------------------------- */
      || /^ifdef::/i.test(word)


        /* ----------------------------
            AsciiDoc anchor:

            <<_requirements, Requirements>>
           ----------------------------- */
      || /^<</i.test(word)

      
        /* ----------------------------
            AsciiDoc endif macro:

            endif::xaml[]
           ----------------------------- */
      || /^endif::/i.test(word)


        /* ----------------------------
            AsciiDoc link macro:

            link:www.infragistics.com[Infragistics]
           ----------------------------- */
      || /^link:/i.test(word)


        /* ----------------------------
            code backtick:

            `valueMemberPath`
           ----------------------------- */
      || /^`/i.test(word)


        /* ----------------------------
            HTML fragment (id):

            id="header"
           ----------------------------- */
      || /^id="/i.test(word)


        /* ----------------------------
            Markdown link:

            [Infragistics](http://www.infragistics.com)

                or

            Infragistics](http://www.infragistics.com)            
           ----------------------------- */
      || /\[?.+\)/i.test(word)


        /* ----------------------------
            Ignite UI build flag:

            %%ProductName%%

                or
            
            [%%ProductName]
           ----------------------------- */
      || /^\[?%%/i.test(word)


        /* ----------------------------
            Standard build flag:

            {ProductName}
           ----------------------------- */
      || /^\{/i.test(word)


        /* ----------------------------
            Inite UI control name:

            igDataGrid

                or

            igDataChart, etc.
           ----------------------------- */
      || /^ig([A-Z])/.test(wordAlphaOnly)


        /* ----------------------------
            XAML control name:

            XamDataChart

                or

            XamDataGrid, etc.
           ----------------------------- */
      || /^xam/i.test(word)


        /* ----------------------------
            PascalCase words:

            IEnumerable

                or

            ValueMemberPath, etc.
           ----------------------------- */
      || /[A-Z]([A-Z0-9]*[a-z][a-z0-9]*[A-Z]|[a-z0-9]*[A-Z][A-Z0-9]*[a-z])[A-Za-z0-9]*/.test(word)

        /* ----------------------------
            Infragistics assembly names:

            infragistics.documents.dll, etc.
           ----------------------------- */
      || /^infragistics\./.test(word)
      ) {

    returnValue = false;

  }

  return returnValue;
};