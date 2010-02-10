//= require "yql.js"
//= require "../utils/strip_tags.js"

protonet.data.Flickr = {};
protonet.data.Flickr.getPhoto = (function() {
  var YQL_GET_PHOTO_INFO = "SELECT title, description FROM flickr.photos.info WHERE photo_id = '{id}'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id = '{id}' and label IN ('Thumbnail', 'Small')",
      callbacks,
      photoId,
      data;
  
  function photoSizesLoaded(response) {
    var results = response && response.query && response.query.results;
    if (!results) {
      return callback.failure();
    }

    data = $.extend({
      thumbnail: results.size[0],
      preview: results.size[1]
    }, data);
    
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
  var MULTI_QUERY = "USE \"http://www.datatables.org/data/query.multi.xml\" AS multiquery;" +
                    "SELECT * FROM multiquery WHERE queries=\"{queries}\"",
      YQL_GET_PHOTOSET_INFO = "SELECT id FROM flickr.photosets.photos WHERE photoset_id = '{id}' LIMIT 10",
      YQL_GET_PHOTO_INFO = "SELECT urls, title, description, url FROM flickr.photos.info WHERE photo_id IN ({sub_select})",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id IN ({sub_select}) AND label IN ('Square', 'Small')",
      callbacks,
      photoSetId,
      data = [];
  
  function photoSizesLoaded(results) {
    data = $.map(data, function(photo, i) {
      i *= 2;
      return $.extend({
        thumbnail: results.size[i],
        preview: results.size[i + 1]
      }, photo);
    });
  }
  
  function photoInfosLoaded(results) {
    data = $.map(results.photo, function(photo) {
      return {
        title: photo.title,
        url: photo.urls.url.content
      };
    });
  }
  
  function getPhotoSet(id, onSuccess, onFailure) {
    photoSetId = id;
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };
    
    var subSelect = YQL_GET_PHOTOSET_INFO.replace("{id}", photoSetId),
        yqlQuery1 = YQL_GET_PHOTO_INFO.replace("{sub_select}", subSelect),
        yqlQuery2 = YQL_GET_PHOTO_SIZES.replace("{sub_select}", subSelect);
    
    new protonet.data.YQL.Query(MULTI_QUERY.replace("{queries}", [yqlQuery1, yqlQuery2].join(";"))).execute(
      function(response) {
        var results = response && response.query && response.query.results;
        if (!results) {
          return callback.failure();
        }
        
        photoInfosLoaded(results.results[0]);
        photoSizesLoaded(results.results[1]);
        
        callbacks.success(data);
      },
      callbacks.failure
    );
  }
  
  return getPhotoSet;
})();




protonet.data.Flickr.getPhotoSearch = (function() {
  var MULTI_QUERY = "USE \"http://www.datatables.org/data/query.multi.xml\" AS multiquery;" +
                    "SELECT * FROM multiquery WHERE queries=\"{queries}\"",
      YQL_GET_PHOTOSET_INFO = "SELECT id FROM flickr.photos.search WHERE text = '{query}' AND sort = 'relevance' LIMIT 10",
      YQL_GET_PHOTO_INFO = "SELECT urls, title, description, url FROM flickr.photos.info WHERE photo_id IN ({sub_select})",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id IN ({sub_select}) AND label IN ('Square', 'Small')",
      callbacks,
      photoSetId,
      data = [];
  
  function photoSizesLoaded(results) {
    data = $.map(data, function(photo, i) {
      i *= 2;
      return $.extend({
        thumbnail: results.size[i],
        preview: results.size[i + 1]
      }, photo);
    });
  }
  
  function photoInfosLoaded(results) {
    data = $.map(results.photo, function(photo) {
      return {
        title: photo.title,
        url: photo.urls.url.content
      };
    });
  }
  
  function getPhotoSearch(query, onSuccess, onFailure) {
    searchQuery = query;
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };
    
    var subSelect = YQL_GET_PHOTOSET_INFO.replace("{query}", searchQuery),
        yqlQuery1 = YQL_GET_PHOTO_INFO.replace("{sub_select}", subSelect),
        yqlQuery2 = YQL_GET_PHOTO_SIZES.replace("{sub_select}", subSelect);
        
    
    new protonet.data.YQL.Query(MULTI_QUERY.replace("{queries}", [yqlQuery1, yqlQuery2].join(";"))).execute(
      function(response) {
        var results = response && response.query && response.query.results;
        if (!results) {
          return callback.failure();
        }
        
        photoInfosLoaded(results.results[0]);
        photoSizesLoaded(results.results[1]);
        
        callbacks.success(data);
      }, callbacks.failure
    );
  }
  
  return getPhotoSearch;
})();