//= require "yql.js"
//= require "../utils/strip_tags.js"

protonet.data.Flickr = {};
protonet.data.Flickr.getPhoto = (function() {
  var YQL_GET_PHOTO_INFO = "SELECT title, description FROM flickr.photos.info WHERE photo_id = '{id}'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id = '{id}'",
      callbacks,
      photoId,
      data;
  
  function photoSizesLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return callback.failure();
    }
    
    data.thumbnail = {
      width: results.size[1].width,
      height: results.size[1].height,
      src: results.size[1].source
    };
    
    callbacks.success(data);
  }
  
  function photoInfoLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return callbacks.failure();
    }
    
    data = {
      description: protonet.utils.stripTags(results.photo.description),
      title: results.photo.title
    };
    
    new protonet.data.YQL.Query(YQL_GET_PHOTO_SIZES.replace("{id}", photoId)).execute(
      photoSizesLoaded,
      callbacks.failure
    );
  }
  
  function getPhoto(id, onSuccess, onFailure) {
    photoId = id;
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };

    new protonet.data.YQL.Query(YQL_GET_PHOTO_INFO.replace("{id}", photoId)).execute(
      photoInfoLoaded,
      callbacks.failure
    );
  }
  
  return getPhoto;
})();




protonet.data.Flickr.getPhotoSet = (function() {
  var YQL_GET_PHOTOSET_INFO = "SELECT id FROM flickr.photosets.photos WHERE photoset_id = '{id}' LIMIT 10",
      YQL_GET_PHOTO_INFO = "SELECT title, description FROM flickr.photos.info WHERE photo_id IN ({sub_select})",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE label='Square' and photo_id IN ({sub_select})",
      callbacks,
      photoSetId,
      data = [];
  
  function photoSizesLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return callback.failure();
    }
    
    data = $.map(data, function(photo, i) {
      return $.extend({
        thumbnail: {
          width: results.size[i].width,
          height: results.size[i].height,
          src: results.size[i].source
        }
      }, photo);
    });
    
    callbacks.success(data);
  }
  
  function photoInfosLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return callbacks.failure();
    }
    
    data = $.map(results.photo, function(photo) {
      return {
        title: photo.title
      };
    });
    
    var yqlQuery = YQL_GET_PHOTO_SIZES.replace("{sub_select}", YQL_GET_PHOTOSET_INFO.replace("{id}", photoSetId));
    
    new protonet.data.YQL.Query(yqlQuery).execute(
      photoSizesLoaded,
      callbacks.failure
    );
  }
  
  function getPhotoSet(id, onSuccess, onFailure) {
    photoSetId = id;
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };
    
    var yqlQuery = YQL_GET_PHOTO_INFO.replace("{sub_select}", YQL_GET_PHOTOSET_INFO.replace("{id}", photoSetId));
    
    new protonet.data.YQL.Query(yqlQuery).execute(
      photoInfosLoaded,
      callbacks.failure
    );
  }
  
  return getPhotoSet;
})();