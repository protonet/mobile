//= require "escape_for_reg_exp.js"

/**
 * Highlight words in the dom tree
 *
 * @example
 *    <div id="foo-container">foo bar <a href="/foo/bar">foo</a></div>
 *    <script>
 *      protonet.utils.highlightKeyword("foo", document.getElementById("foo-container"));
 *      document.getElementById("foo-container").innerHTML;
 *      // => '<mark>foo</mark> bar <a href="/foo/bar"><mark>foo</mark></a>'
 *      
 *      // Also you can pass in a regular expression:
 *      protonet.utils.highlightKeyword(/foo[1-9]/gi, document.getElementById("foo-container"));
 *    </script>
 */
protonet.utils.highlightKeyword = (function() {
  var EXCLUDES         = ["html", "head", "style", "title", "link", "meta", "script", "object", "iframe"],
      HTML_REPLACEMENT = "<mark>$&</mark>";
  
  return function(keyword, element) {
    var regExp = $.type(keyword) == "regexp" ? keyword : new RegExp(protonet.utils.escapeForRegExp(keyword), "gi"),
        childNodes = element.childNodes,
        childNodesLength = childNodes.length;
    
    while (childNodesLength--) {
      var currentNode = childNodes[childNodesLength];
      if (!currentNode) {
        continue;
      }
      // nodeType 1 == element node
      if (currentNode.nodeType === 1 &&
          $.inArray(currentNode.nodeName.toLowerCase(), EXCLUDES) == -1) {
        arguments.callee(regExp, currentNode);
      }
      
      // nodeType 3 == text node
      if (currentNode.nodeType !== 3 || !currentNode.data.match(regExp)) {
        continue;
      }
      
      var parent = currentNode.parentNode,
          frag = (function(){
              var html = currentNode.data.replace(regExp, HTML_REPLACEMENT),
                  wrap = document.createElement("div"),
                  frag = document.createDocumentFragment();
              wrap.innerHTML = html;
              while (wrap.firstChild) {
                frag.appendChild(wrap.firstChild);
              }
              return frag;
          })();
      parent.insertBefore(frag, currentNode);
      parent.removeChild(currentNode);
    }
  };
})();