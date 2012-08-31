(function(protonet){

  var hash = location.hash,
    pageCache = {};

  protonet.currentPage = null;
  protonet.pages = {}

  protonet.one("sync.succeeded", function(){
    var page = pageCache['/'+ hash];

    if (page) {
      protonet.currentPage = page;
      page.$content.appendTo($('body'));
      $.mobile.initializePage();
      page.scroller.refresh();
    }else{
      protonet.navigation.$content.show();
      $.mobile.initializePage();
    }
  });

  function changePage(page){
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
    protonet.currentPage.scroller.refresh();
  }

  $('body').delegate("a", "click",function(event){
    var href = $(this).attr("href"),
      page = pageCache[href];
    if (page) {
      event.preventDefault();
      changePage(page);
    };
  });

  protonet.on("channel.created", function(channel){
    var page = new protonet.pages.Channel(channel);
    pageCache[page.href] = page;
  });

})(protonet);