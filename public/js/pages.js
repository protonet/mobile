(function(protonet){

  var currentPage = location.hash,
    pageChache = {};

  if(currentPage != ""){
    protonet.one("page.created", function(page){
      if (page.href == "/" + currentPage) {
        setTimeout(function(){
          $('a[href="'+ page.href +'"]').click();
        }, 0);
      };
    });
  }

  protonet.pages = {}

  // observe links
  $document.delegate("a", "click", function(event){
    var href = $(this).attr("href"),
        page = pageChache[href];
  });

  protonet.on("channel.created", function(channel){
    var page = new protonet.pages.Channel(channel)
    pageChache[page.href] = page;
    $('body').append(page.$content);
  });

})(protonet);