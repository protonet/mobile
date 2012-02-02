(function(protonet) {
  var dataCache = {};
  
  protonet.on("channels.data_available", function(data) {
    $.each(data, function(i, channel) {
      $.each(channel.meeps, function(i, meep) {
        dataCache[meep.id] = meep;
      });
    });
  });
  
  protonet.on("meep.receive meep.sent", function(meep) {
    dataCache[meep.id] = meep;
  });
  
  protonet.data.Meep = {
    get: function(id, callback) {
      if (dataCache[id]) {
        return callback(dataCache[id]);
      } else {
        $.ajax({
          dataType: "json",
          url:      "/meeps/" + id,
          success:  function(data) {
            dataCache[id] = data;
            callback(data);
          },
          error:    function() {
            protonet.trigger("flash_message.error", protonet.t("LOADING_MEEP_ERROR"));
          }
        });
      }
    },

    getUrl: function(id) {
      return protonet.config.base_url + "/meep/" + id;
    }
  };
  
})(protonet);