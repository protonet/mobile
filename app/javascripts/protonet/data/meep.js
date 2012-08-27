(function(protonet) {
  var dataCache = {};
  
  function cache(data) {
    dataCache[data.id] = data;
    protonet.trigger("meep.data_available", data);
  }
  
  protonet.on("channel.data_available", function(channel) {
    $.each(channel.meeps || [], function(i, meep) {
      cache(meep);
    });
  });
  
  protonet.on("meep.receive meep.sent", function(meep) {
    dataCache[meep.id] = meep;
  });
  
  protonet.data.Meep = {
    get: function(id, options) {
      options = $.extend({ includeMeeps: false, bypassCache: false, success: $.noop, error: $.noop }, options);
      
      if (dataCache[id]) {
        options.success(dataCache[id]);
      } else {
        $.ajax({
          dataType: "json",
          url:      "/meeps/" + id,
          data:     { ajax: 1 },
          success:  function(data) {
            dataCache[id] = data;
            options.success(data);
          },
          error:    function(xhr) {
            options.error(xhr);
          }
        });
      }
    },

    getUrl: function(id) {
      return protonet.config.base_url + "/meeps/" + id;
    }
  };
  
})(protonet);