//= require "../utils/escape_html.js"
//= require "../utils/strip_tags.js"
//= require "../utils/parse_url.js"
//= require "../utils/template.js"

/**
 * Supported fields:
 *
 * {
 *   url:          "http://foo.de",
 *   title:        "foo bar",
 *   description:  "foo bar bla bla bla",
 *   
 *   // ------------------------------------ OPTIONAL ------------------------------------ \\
 *   image:                  "http://foo.de/bar.jpg",    // url to a preview image
 *   image:                  ["http://foo.de/bar.jpg"]   // array of image urls
 *   imageHref:              "http://foo.de/bar.html"    // link url of the image
 *   imageHref:              ["http://foo.de/bar.html"]  // array of link urls (pls provide same order as image array)
 *   imageTitle:             "nice pic"                  // title (hover text) of the image
 *   imageTitle:             ["nice pic"]                // array of titles (pls provide same order as image array)
 *   flash:                  "http://foo.de/bar.swf",    // url to the flash movie that should be rendered
 *   iframe:                 "http://foo.de/bar.html",   // url that should be rendered in an iframe
 *   iframeRefreshInterval:  60,                         // interval (seconds) how often iframe should be refreshed
 *   code:                   "var foo = 'bar';",         // plain code
 *   code:                   ["var foo = 'bar';"],       // array of plain codes
 *   codeTitle:              "awesome_script.js",        // file name or title
 *   codeTitle:              ["awesome_script.js"],      // array of file names or titles (pls provide same order as code array)
 *   codeClass:              "new_file",                 // css class for code
 *   codeClass:              ["new_file"],               // array of css classes for code (pls provide same order as code array)
 *   titleAppendix:          "(03:19)",                  // title suffix (important info displayed at the end of title)
 * }
 *
 */
protonet.text_extensions.render = (function() {
  var mediaTypeDetection = {
    flash:    function(data) { return data.flash && typeof(data.flash) == "string"; },
    image:    function(data) { return data.image && typeof(data.image) == "string"; },
    images:   function(data) { return $.isArray(data.image) && data.image.length; },
    iframe:   function(data) { return data.iframe && typeof(data.iframe) == "string"; },
    code:     function(data) { return data.code && typeof(data.code) == "string"; },
    codes:    function(data) { return $.isArray(data.code) && data.code.length; }
  };
  
  /**
   * Takes the text extension object and sniffes the media type
   * by checking for the existence of several keys (mediaTypes)
   */
  function _getMediaType(data) {
    for (var type in mediaTypeDetection) {
      if (mediaTypeDetection[type](data)) {
        return type;
      }
    }
    
    return null;
  }
  
  return function(container, data) {
    var results     = new protonet.utils.Template("text-extension-template").toElement(),
        description = protonet.utils.escapeHtml(protonet.utils.stripTags(data.description || "")),
        title       = protonet.utils.escapeHtml(protonet.utils.stripTags(data.title || "")),
        provider    = data.type,
        mediaType   = _getMediaType(data),
        renderMedia = protonet.text_extensions.render[mediaType],
        url         = data.url,
        domain      = protonet.utils.parseUrl(url).host;
    
    title           = title.truncate(protonet.text_extensions.config.MAX_TITLE_LENGTH);
    description     = description.truncate(protonet.text_extensions.config.MAX_DESCRIPTION_LENGTH);
    
    if (data.titleAppendix) {
      title += " (" + protonet.utils.escapeHtml(data.titleAppendix) + ")";
    }
    
    results.addClass(provider).addClass(mediaType);
    results.find(".description").html(description);
    results.find(".title").html(title);
    results.find(".domain").html(domain);
    results.find("a.link").attr("href", url);
    if (renderMedia) {
      results.find(".media").html(renderMedia(data));
    }
    results.appendTo(container);
    
    this.resultsElement = results;
  };
})();

//= require "renderer/codes.js"
//= require "renderer/code.js"
//= require "renderer/flash.js"
//= require "renderer/iframe.js"
//= require "renderer/image.js"
//= require "renderer/images.js"
