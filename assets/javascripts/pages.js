(function(protonet){

  var hash = location.hash,
    pageCache = {};

  protonet.currentPage = null;
  protonet.pages = {}

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

  protonet.changePage = function(href){
    var page = pageCache[href];
    if (protonet.currentPage) {
      $(protonet.currentPage.$content).bind("pagehide", function(event){
        var $this = $(this);
        $this.detach();
        $this.unbind(event);
      });
    };
    protonet.currentPage = page;
    protonet.currentPage.$content.appendTo($('body')).page();
    $.mobile.changePage(protonet.currentPage.$content,{
      dataUrl: page.href
    });
    protonet.currentPage.$content.bind("pageshow", function(event){
      protonet.currentPage.scrollToBottom();
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

  protonet.on("channel.created", function(channel){
    var page = new protonet.pages.Channel(channel);
    pageCache[page.href] = page;
  });

  protonet.on("channel.deleted", function(channel){
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