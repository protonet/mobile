//= require "../../data/twitpic.js"
//= require "../../data/yql.js"

/**
 * Twitpic Provider
 */
protonet.text_extensions.provider.Twitpic = {
  /**
   * Matches
   * http://twitpic.com/d1x47
   * http://twitpic.com/d1x47#
   * http://twitpic.com/d1x47/full
   */
  REG_EXP: /twitpic\.com\/(\w{5,7}?)(#$|\/full)*$/i,
  
  YQL_QUERY: "SELECT content,p FROM html WHERE url='{url}' AND xpath IN ('//title', '//div[@id=\"view-photo-caption\"]')",
  
  loadData: function(url, onSuccess, onFailure) {
    var yqlQuery = this.YQL_QUERY.replace("{url}", url),
        id = url.match(this.REG_EXP)[1];
    
    new protonet.data.YQL.Query(yqlQuery).execute(function(response) {
      onSuccess({
        description: response.div && response.div.p,
        title: response.title,
        thumbnail: protonet.data.TwitPic.getPhotoUrl(id)
      });
    }, onFailure);
  }
};