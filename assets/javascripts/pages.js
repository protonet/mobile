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
    protonet.currentPage.$content.appendTo($('body'));
    $.mobile.changePage(protonet.currentPage.$content,{
      dataUrl: page.href,
      transition: "slide"
    });
    protonet.currentPage.$content.bind("pageshow", function(event){
      protonet.currentPage.scrollToBottom();
    });

    if (page.id) {
      protonet.trigger("channel.change", page.id);
    };

  }

  $('body').delegate("a", "click", function(event){
    var href = $(this).attr("href"),
        page = pageCache[href];

    if (page) {
      event.preventDefault();
      protonet.changePage(href,{
        dataUrl: href,
        transition: "slide"
      });
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