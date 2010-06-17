//= require "../../data/facebook.js"

protonet.text_extensions.provider.FacebookProfile = {
  REG_EXP: /facebook\.com.*((\/#\!\/)|(\/))(.+)/i,
  
  PROFILE_REG_EXP: /profile\.php\?id\=(\d+)/i,
  PAGE_REG_EXP: /pages\/.+?\/(\d+)/i,
  GROUP_REG_EXP: /group\.php\?gid\=(\d+)/i,
  FALLBACK_REG_EXP: /\/?([a-z0-9\.\-\_]+)($|#|\?)/i,
  
  loadData: function(url, onSuccess, onFailure) {
    var match         = url.match(this.REG_EXP),
        path          = match[4] || "",
        profileMatch  = path.match(this.PROFILE_REG_EXP),
        pageMatch     = path.match(this.PAGE_REG_EXP),
        groupMatch    = path.match(this.GROUP_REG_EXP),
        fallbackMatch = path.match(this.FALLBACK_REG_EXP);
    
    if (profileMatch) {
      id = profileMatch[1];
    } else if (pageMatch) {
      id = pageMatch[1];
    } else if (groupMatch) {
      id = groupMatch[1];
    } else if (fallbackMatch) {
      id = fallbackMatch[1];
    } else {
      return onFailure();
    }
    
    protonet.data.Facebook.getOpenGraphData(id, function(data, apiUrl) {
      onSuccess({
        title: data.name,
        titleAppendix: data.category || data.location,
        description: data.description || data.products,
        image: data.image || data.picture
      });
    }, onFailure);
  }
};