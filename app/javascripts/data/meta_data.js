//= require "yql.js"
//= require "../utils/convert_to_absolute_url.js"

/**
 * Facebook created a standard for data sharing
 * Webmasters just have to insert some meta information into their <head>
 * 
 * Supports:
 *  - meta tags
 *  - dublin core meta tags
 *  - title
 *  - microformats (hcard)
 *  - facebook/digg share standard
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
 *    http://microformats.org/wiki/hcard
 *    http://opengraphprotocol.org/
 *
 */
protonet.data.MetaData = {
  QUERY: "SELECT * FROM html WHERE url = '{url}' AND compat='html5' AND xpath='descendant-or-self::title | descendant-or-self::meta | descendant-or-self::link | descendant-or-self::img[contains(concat(\" \", normalize-space(@class), \" \"), \" photo \")]'",
  
  LINK_REL: ["video_src", "image_src", "audio_src"],
  
  regExps: {
    DUBLIN_CORE: /^dc\./
  },
  
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
    
    var metaTags = $.makeArray(response.meta);
    
    // handle meta elements
    $.each(metaTags, function(i, metaTag) {
      if (metaTag && typeof(metaTag.name) == "string" && typeof(metaTag.content) == "string") {
        // Handling Dublin Core Meta Tags http://www.seoconsultants.com/meta-tags/dublin/
        var name    = $.trim(metaTag.name.toLowerCase()).replace(this.regExps.DUBLIN_CORE, ""),
            content = $.trim(metaTag.content);
        data[name] = content;
      }
    }.bind(this));
    
    // handle link elements
    $.each($.makeArray(response.link), function(i, linkTag) {
      if (linkTag && typeof(linkTag.href) == "string" && linkTag.href.length && $.inArray(linkTag.rel, this.LINK_REL) != -1) {
        var src = $.trim(linkTag.href);
        data[linkTag.rel.toLowerCase()] = protonet.utils.convertToAbsoluteUrl(src, url);
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
    
    onSuccess(data);
  }
};