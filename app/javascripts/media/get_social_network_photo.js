//= require "../lib/webtoolkit.md5.js"
//= require "../data/yql.js"

protonet.media.getSocialNetworkPhoto = (function() {
  var services = {
      "*":                  "//img[contains(@class,'photo')]", // facebook, xing, google profile
      "twitter.com":        "//*[@id='profile-image']",
      "mister-wong.de":     "//img[contains(@class,'avatar')]",
      "hi5.com":            "//*[@id='Profile-TopLeft-Photo']/descendant::img",
      "myspace.com":        "//*[@rel='myspace:photo']/descendant::img",
      "crunchbase.com":     "//*[@id='company_logo']/descendant::img"
    },
    YQL_QUERY = "SELECT src FROM html WHERE xpath = \"{xpath}\" and url = \"{url}\" LIMIT 1",
    GRAVATAR_URL_TEMPLATE = "http://www.gravatar.com/avatar/{hash}?s=200",
    callbacks,
    email,
    url;
  
  function getSocialMediaPhoto(emailOrUrl, onSuccess, onFailure) {
    callbacks = {
      onSuccess: onSuccess || $.noop,
      onFailure: onFailure || $.noop
    };
    
    emailOrUrl = $.trim(emailOrUrl);
    
    if (emailOrUrl.isUrl()) {
      url = emailOrUrl;
      return handleUrl(emailOrUrl);
    }

    if (emailOrUrl.isEmail()) {
      email = emailOrUrl;
      return handleEmail();
    }

    return callbacks.onFailure();
  };
  
  function handleUrl() {
    var xpath = getXpath(),
        yqlQuery = YQL_QUERY.replace("{xpath}", xpath).replace("{url}", url);
    new protonet.data.YQL.Query(yqlQuery).execute(handleYqlResponse, callbacks.onFailure);
  }
  
  function handleEmail() {
    var image = new Image(),
        photoUrl = GRAVATAR_URL_TEMPLATE.replace("{hash}", MD5(email));
        
    image.onerror = function() {
      callbacks.onFailure();
    };
    image.onload = function() {
      callbacks.onSuccess(photoUrl);
    };
    image.src = photoUrl;
  }
  
  function getXpath() {
    var returnValue;
    $.each(services, function(key, value) {
      if (url.indexOf(key) != -1) {
        returnValue = value;
        return false;
      }
    });
    return returnValue || services["*"];
  }
  
  function handleYqlResponse(response) {
    var results = response && response.query && response.query.results || {},
        photoUrl = results.img && results.img.src;
    
    if (photoUrl) {
      if (!photoUrl.startsWith("http")) {
        photoUrl = url.replace(/(https?:\/\/.+?)\/.+/i, "$1" + photoUrl);
      }
      
      callbacks.onSuccess(photoUrl);
    } else {
      callbacks.onFailure();
    }
    
  }
  
  return getSocialMediaPhoto;
})();