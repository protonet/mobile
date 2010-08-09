/**
 * Just some easter egg stuff :-)
 */
protonet.ui.Logo = {
  monsters:       ["default", "business", "female"],
  monstersIndex:  0,
  
  initialize: function() {
    this.monster = $("header > .monster");
    this.monster.click(this.changeMonster.bind(this)).queue();
    $(".heart").live("click", this.hearts.bind(this));
  },
  
  changeMonster: function(event) {
    event && event.preventDefault();
    
    if (this.monster.queue().length) {
      return;
    }
    
    this.monstersIndex++;
    if (this.monstersIndex >= this.monsters.length) {
      this.monstersIndex = 0;
    }
    
    var oldMarginBottom = parseInt(this.monster.css("marginBottom"), 10);
    
    this.monster.animate({
      marginBottom: (oldMarginBottom + 50).px()
    }, 250, function() {
      $.each(this.monsters, function(i, className) {
        this.monster.removeClass(className);
      }.bind(this));
      this.monster.addClass(this.monsters[this.monstersIndex]);
    }.bind(this)).animate({
      marginBottom: oldMarginBottom.px()
    }, 250, function() {
      if (this.monsters[this.monstersIndex] == "female") {
        this.hearts();
      }
    }.bind(this));
  },
  
  hearts: function(event, secondTime) {
    var hearts = $("<span />", {
      className: "hearts",
      html: "&hearts; &hearts; &hearts;<br>&hearts; &hearts;"
    }).insertBefore(this.monster);
    
    hearts.animate({
      opacity: 0,
      top: "-50px"
    }, 2000, function() {
      hearts.remove();
    });
    
    if (!secondTime) {
      setTimeout(function() {
        this.hearts(null, true);
      }.bind(this), 500);
    }
  }
};
