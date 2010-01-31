//= require "yql.js"
//= require "../utils/strip_tags.js"

protonet.data.Flickr = {};
protonet.data.Flickr.getPhotoDetails = (function() {
  var YQL_GET_PHOTO_INFO = "SELECT title, description FROM flickr.photos.info WHERE photo_id = '{id}'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id = '{id}'",
      successCallback,
      failureCallback,
      photoId,
      data = {};
  
  function photoSizesLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return failureCallback();
    }
    
    data.thumbnail = {
      width: results.size[1].width,
      height: results.size[1].height,
      src: results.size[1].source
    };
    
    successCallback(data);
  }
  
  function photoInfoLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return failureCallback();
    }
    
    data = {
      description: protonet.utils.stripTags(results.photo.description),
      title: results.photo.title
    };
    
    new protonet.data.YQL.Query(YQL_GET_PHOTO_SIZES.replace("{id}", photoId)).execute(
      photoSizesLoaded,
      failureCallback
    );
  }
  
  function getPhotoDetails(id, onSuccessCallback, onFailureCallback) {
    successCallback = onSuccessCallback;
    failureCallback = onFailureCallback;
    photoId = id;

    new protonet.data.YQL.Query(YQL_GET_PHOTO_INFO.replace("{id}", photoId)).execute(
      photoInfoLoaded,
      failureCallback
    );
  }
  
  return getPhotoDetails;
})();