(function(protonet){

  var hash = location.hash,
    pageChache = {};

  protonet.currentPage = null;
  protonet.pages = {}

  if(hash != ""){
    protonet.one("dashboard.updated", function(){
      $('a[href="/'+ hash +'"]').click();
    });
  }

  $('body').delegate("a.channel-link", "click",function(event){
    var href = $(this).attr("href"),
      page = pageChache[href];
      protonet.currentPage = page;
      setTimeout(function(){
        page.scroller.refresh();
        page.scrollToBottom();
      }, 0);
    
  });

  protonet.on("channel.created", function(channel){
    var page = new protonet.pages.Channel(channel)
    pageChache[page.href] = page;
    $('body').append(page.$content);
  });

})(protonet);