(function(protonet){

  var hash = location.hash,
      pageCache = {};

  protonet.currentPage = null;
  protonet.pages = {};
  protonet.pageCache = pageCache;

  protonet.one("sync.succeeded", function(){

    var page = pageCache[hash];

    if (page) {
      protonet.currentPage = page;
      page.$content.appendTo($('body'));
      protonet.trigger("channel.change", page.id);
      $.mobile.initializePage();
      page.scrollToBottom();
    }else{
      $.mobile.initializePage();
    }
    $('#captive-portal').popup().popup("open");
  });

  $document.bind("pagechange", function(event){
    if (protonet.currentPage && protonet.currentPage.$content.is(":visible")) {
      $.mobile.silentScroll(document.body.scrollHeight);
    };
  });

  protonet.changePage = function(href){
    var page = pageCache[href];
    protonet.currentPage = page;
    protonet.currentPage.$content.appendTo($('body'));
    $.mobile.changePage(protonet.currentPage.$content,{
      dataUrl: page.href
    });

    if (page.id) {
      protonet.trigger("channel.change", page.id);
    };
  }

  $('body')
    .delegate(".ui-content a.channel-link", "click", function(event){
      event.preventDefault();
    })
    .delegate(".ui-content a.channel-link", "vclick", function(event){
      var href = $(this).attr("link"),
          page = pageCache[href];

      if (page) {
        event.preventDefault();
        protonet.changePage(href);
      };
    });

  protonet
    .on("channel.new", function(channel){
      if (channel.isActive()) {   
        var page = new protonet.pages.Channel(channel);
        pageCache[page.href] = page;
      };
    })
    .on("channel.deleted", function(channel){
      var page = pageCache["#channel-" + channel.id];
      if (protonet.currentPage == page) {
        $(page.$content).bind("pagehide", function(event){
          page.$content.detach();
          delete pageCache[page.href];
        });
        protonet.changePage("");
      };
    });

})(protonet);