//= require "../utils/convert_to_absolute_url.js"
//= require "scrape.js"

/**
 * Facebook created a standard for data sharing
 * Webmasters just have to insert some meta information into their <head>
 * 
 * Supports:
 *  - meta tags
 *  - title
 *  - open graph protocol
 *
 * Video Example:
 *    <link rel="video_src" href="http://www.example.com/player.swf?video_id=123456789"/>
 *    <meta name="video_height" content="200" />
 *    <meta name="video_width" content="300" />
 *    <meta name="video_type" content="application/x-shockwave-flash" />
 *
 * More info:
 *    http://wiki.developers.facebook.com/index.php/Facebook_Share/Specifying_Meta_Tags
 *    http://opengraphprotocol.org/
 *
 */
protonet.data.MetaData = {
  
  LINK_REL: ["video_src", "image_src", "audio_src"],
  
  SELECTORS: "title,meta,link",
  
  get: function(url, onSuccess, onFailure) {
    new protonet.data.Scraper.getData(url, this.SELECTORS, this._success.bind(this, onSuccess, url), onFailure);
  },
  
  _success: function(onSuccess, url, response) {
    
    var data = {};
    
    data.title = response.title && response.title[0].content;
    
    var metaTags = response.meta || [];
    var linkTags = response.link || [];
    
    // handle meta elements
    $.each(metaTags, function(i, metaTag) {
      if (metaTag && typeof(metaTag.name) == "string" && typeof(metaTag.content) == "string") {
        var name    = $.trim(metaTag.name.toLowerCase()),
            content = $.trim(metaTag.content);
        data[name] = content;
      }
    }.bind(this));
    
    
    // handle opengraph meta tags
    $.each(metaTags, function(i, metaTag) {
      if (metaTag && String(metaTag.property).startsWith("og:") && typeof(metaTag.content) == "string") {
        var key = metaTag.property.substr(3).toLowerCase();
        if (key == "image") {
          key = "image_src";
        }
        if (key == "video") {
          key = "video_src";
        }
        data[key] = $.trim(metaTag.content);
      }
    });
    
    // handle link elements
    $.each(linkTags, function(i, linkTag) {
      if (linkTag && typeof(linkTag.href) == "string" && linkTag.href.length && $.inArray(linkTag.rel, this.LINK_REL) != -1) {
        var src = $.trim(linkTag.href),
          name = linkTag.rel.toLowerCase();
        if (data[name]) { return true};

        data[name] = protonet.utils.convertToAbsoluteUrl(src, url);
      }
    }.bind(this));

    
    onSuccess(data);
  }
};