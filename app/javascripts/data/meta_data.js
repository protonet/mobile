//= require "yql.js"
//= require "../utils/convert_to_absolute_url.js"

/**
 * Facebook created a standard for data sharing
 * Webmasters just have to insert some meta information into their <head>
 * 
 * Supports:
 *  - meta tags
 *  - title
 *  - microformats (hcard)
 *  - facebook/digg share standard
 *
 * Video Example:
 *    <link rel="video_src" href="http://www.example.com/player.swf?video_id=123456789"/>
 *    <meta name="video_height" content="200" />
 *    <meta name="video_width" content="300" />
 *    <meta name="video_type" content="application/x-shockwave-flash" />
 *
 * More info:
 *    http://wiki.developers.facebook.com/index.php/Facebook_Share/Specifying_Meta_Tags
 *    http://microformats.org/wiki/hcard
 *
 */
protonet.data.MetaData = {
  QUERY: "SELECT * FROM html WHERE url = '{url}' AND xpath='descendant-or-self::title | descendant-or-self::meta | descendant-or-self::link | descendant-or-self::img[contains(concat(\" \", normalize-space(@class), \" \"), \" photo \")]'",
  
  LINK_REL: ["video_src", "image_src", "audio_src"],
  
  get: function(url, onSuccess, onFailure) {
    var query = this.QUERY.replace("{url}", url);
    new protonet.data.YQL.Query(query).execute(this._success.bind(this, onSuccess, url), onFailure);
  },
  
  _success: function(onSuccess, url, response) {
    var data = {};
    
    // handle (multiple) <title> elements(s)
    var title = (response.title && response.title.content) || response.title;
    data.title = $.map($.makeArray(title), function(title) {
      return title || null;
    }).join(", ");
    
    // handle hcard/vcard photo
    if (response.img && typeof(response.img.src) == "string" && response.img.src.length) {
      data.image_src = protonet.utils.convertToAbsoluteUrl(response.img.src, url);
    }
    
    // handle meta elements
    $.each($.makeArray(response.meta), function(i, metaTag) {
      if (typeof(metaTag.name) == "string" && typeof(metaTag.content) == "string") {
        data[metaTag.name.toLowerCase()] = $.trim(metaTag.content);
      }
    });
    
    // handle link elements
    $.each($.makeArray(response.link), function(i, linkTag) {
      if (typeof(linkTag.href) == "string" && linkTag.href.length && $.inArray(linkTag.rel, this.LINK_REL) != -1) {
        var src = $.trim(linkTag.href);
        data[linkTag.rel.toLowerCase()] = protonet.utils.convertToAbsoluteUrl(src, url);
      }
    }.bind(this));
    
    onSuccess(data);
  }
};