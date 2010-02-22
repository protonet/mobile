//= require "yql.js"

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
  QUERY: "SELECT * FROM html WHERE url = '{url}' AND xpath='//head' LIMIT 1",
  REL_MATCH: (/video_src|image_src/i),
  
  get: function(url, onSuccess, onFailure) {
    var query = this.QUERY.replace("{url}", url);
    new protonet.data.YQL.Query(query).execute(this._success.bind(this, onSuccess, onFailure), onFailure);
  },
  
  _success: function(onSuccess, onFailure, response) {
    var head = response.head,
        data = {};
    if (!head) {
      onFailure();
    }
    
    data.title = $.trim(String(head.title || "").replace(/^,+/, "").replace(/,+$/, ""));
    
    $.each($.makeArray(head.meta), function(i, metaTag) {
      if (metaTag.name && metaTag.content) {
        data[metaTag.name] = $.trim(String(metaTag.content || ""));
      }
    });
    
    $.each($.makeArray(head.link), function(i, linkTag) {
      if (linkTag.rel && linkTag.href && this.REL_MATCH.test(linkTag.rel)) {
        data[linkTag.rel] = $.trim(String(linkTag.href || ""));
      }
    }.bind(this));
    
    onSuccess(data);
  }
};