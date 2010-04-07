//= require "yql.js"
//= require "../utils/convert_to_absolute_url.js"

/**
 * Facebook created a standard for data sharing
 * Webmasters just have to insert some meta information into their <head>
 * 
 * Video Example:
 *    <link rel="video_src" href="http://www.example.com/player.swf?video_id=123456789"/>
 *    <meta name="video_height" content="200" />
 *    <meta name="video_width" content="300" />
 *    <meta name="video_type" content="application/x-shockwave-flash" />
 *
 * More info:
 *    http://wiki.developers.facebook.com/index.php/Facebook_Share/Specifying_Meta_Tags
 *
 */
protonet.data.MetaData = {
  QUERY: "SELECT * FROM html WHERE url = '{url}' AND xpath='descendant-or-self::title | descendant-or-self::meta | descendant-or-self::link'",
  LINK_REL: ["video_src", "image_src", "audio_src"],
  
  get: function(url, onSuccess, onFailure) {
    var query = this.QUERY.replace("{url}", url);
    new protonet.data.YQL.Query(query).execute(this._success.bind(this, onSuccess, onFailure), onFailure);
  },
  
  _success: function(onSuccess, onFailure, response) {
    var data = {};
    
    var title = (response.title && response.title.content) || response.title;
    data.title = $.makeArray(title)[0];
    
    $.each($.makeArray(response.meta), function(i, metaTag) {
      if (metaTag.name && metaTag.content) {
        data[metaTag.name] = $.trim(String(metaTag.content || ""));
      }
    });
    
    $.each($.makeArray(response.link), function(i, linkTag) {
      if (typeof(linkTag.href) == "string" && linkTag.href.length && $.inArray(linkTag.rel, this.LINK_REL) != -1) {
        var src = $.trim(linkTag.href);
        data[linkTag.rel] = protonet.utils.convertToAbsoluteUrl(src);
      }
    }.bind(this));
    
    onSuccess(data);
  }
};