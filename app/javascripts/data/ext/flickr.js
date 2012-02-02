//= require "yql.js"
//= require "../../utils/strip_tags.js"

protonet.data.Flickr = {};
protonet.data.Flickr.getPhoto = (function() {
  var YQL_GET_PHOTO_INFO = "SELECT title, description FROM flickr.photos.info WHERE photo_id = '{id}' AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id = '{id}' and label IN ('Thumbnail', 'Small')  AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      callbacks,
      photoId,
      data;
  
  function photoSizesLoaded(response) {
    data = $.extend({
      thumbnail: response.size[0],
      preview: response.size[1]
    }, data);
    
    // Ensure that sizes are in proper format
    data.thumbnail.width = Number(data.thumbnail.width);
    data.thumbnail.height = Number(data.thumbnail.height);
    data.preview.width = Number(data.preview.width);
    data.preview.height = Number(data.preview.height);
    
    callbacks.success(data);
  }
  
  function photoInfoLoaded(response) {
    data = {
      description: protonet.utils.stripTags(response.photo.description),
      title: response.photo.title
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
      YQL_GET_PHOTOSET_INFO = "SELECT id FROM flickr.photosets.photos WHERE photoset_id = '{id}' AND api_key = '456b1b6c99204e79a34b5333e074d7f2' LIMIT 10",
      YQL_GET_PHOTO_INFO = "SELECT urls, title, description, url FROM flickr.photos.info WHERE photo_id IN ({sub_select}) AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id IN ({sub_select}) AND label IN ('Square', 'Small') AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      callbacks,
      data = [];
  
  function photoSizesLoaded(results) {
    data = $.map(data, function(photo, i) {
      i *= 2;
      var sizes = $.extend({
        thumbnail: results.size[i],
        preview: results.size[i + 1]
      }, photo);
      
      // Ensure that sizes are in proper format
      sizes.thumbnail.width = Number(sizes.thumbnail.width);
      sizes.thumbnail.height = Number(sizes.thumbnail.height);
      sizes.preview.width = Number(sizes.preview.width);
      sizes.preview.height = Number(sizes.preview.height);
      
      return sizes;
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
  
  function getPhotoSet(photoSetId, onSuccess, onFailure) {
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };
    
    var subSelect = YQL_GET_PHOTOSET_INFO.replace("{id}", photoSetId),
        yqlQuery1 = YQL_GET_PHOTO_INFO.replace("{sub_select}", subSelect),
        yqlQuery2 = YQL_GET_PHOTO_SIZES.replace("{sub_select}", subSelect);
    
    new protonet.data.YQL.Query(MULTI_QUERY.replace("{queries}", [yqlQuery1, yqlQuery2].join(";"))).execute(
      function(response) {
        photoInfosLoaded(response.results[0]);
        photoSizesLoaded(response.results[1]);
        
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
      YQL_GET_PHOTOS_INFO = "SELECT id FROM flickr.photos.search WHERE text = '{query}' AND sort = '{sort}' AND api_key = '456b1b6c99204e79a34b5333e074d7f2' LIMIT 10",
      YQL_GET_PHOTO_INFO = "SELECT urls, title, description, url FROM flickr.photos.info WHERE photo_id IN ({sub_select}) AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      YQL_GET_PHOTO_SIZES = "SELECT source, height, width FROM flickr.photos.sizes WHERE photo_id IN ({sub_select}) AND label IN ('Square', 'Small') AND api_key = '456b1b6c99204e79a34b5333e074d7f2'",
      callbacks,
      data = [];
  
  function photoSizesLoaded(results) {
    data = $.map(data, function(photo, i) {
      i *= 2;
      var sizes = $.extend({
        thumbnail: results.size[i],
        preview: results.size[i + 1]
      }, photo);
      
      // Ensure that sizes are in proper format
      sizes.thumbnail.width = Number(sizes.thumbnail.width);
      sizes.thumbnail.height = Number(sizes.thumbnail.height);
      sizes.preview.width = Number(sizes.preview.width);
      sizes.preview.height = Number(sizes.preview.height);
      
      return sizes;
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
  
  function getPhotoSearch(searchQuery, sort, onSuccess, onFailure) {
    callbacks = {
      success: onSuccess || $.noop,
      failure: onFailure || $.noop
    };
    
    var subSelect = YQL_GET_PHOTOS_INFO.replace("{query}", searchQuery).replace("{sort}", sort),
        yqlQuery1 = YQL_GET_PHOTO_INFO.replace("{sub_select}", subSelect),
        yqlQuery2 = YQL_GET_PHOTO_SIZES.replace("{sub_select}", subSelect);
        
    
    new protonet.data.YQL.Query(MULTI_QUERY.replace("{queries}", [yqlQuery1, yqlQuery2].join(";"))).execute(
      function(response) {
        photoInfosLoaded(response.results[0]);
        photoSizesLoaded(response.results[1]);
        
        callbacks.success(data);
      }, callbacks.failure
    );
  }
  
  return getPhotoSearch;
})();