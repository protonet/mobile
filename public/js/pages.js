(function(protonet){

  var hash = location.hash,
    pageCache = {};

  protonet.currentPage = null;
  protonet.pages = {}

  protonet.one("navigation.updated", function(){
    if(hash != ""){
      pageCache['/'+hash].$content.appendTo($('body'));
    }else{
      protonet.navigation.$content.appendTo($('body'));
      $.mobile.changePage("#navigation");
    }
  });

  $('body').delegate("a.channel-link", "click",function(event){
    var $this = $(this);

    if (protonet.currentPage) {
      protonet.currentPage.$content.detach();
    };
    protonet.currentPage = pageCache[$this.attr("href")];
    protonet.currentPage.$content.appendTo($('body'));

    $.mobile.changePage(protonet.currentPage.$content);
  });

  protonet.on("channel.created", function(channel){
    var page = new protonet.pages.Channel(channel)
    pageCache[page.href] = page;
  });

})(protonet);