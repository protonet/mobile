/**
 * Just some easter egg stuff :-)
 *
 * Let the monster jump via event notification monster.jump
 */
protonet.ui.Logo = {
  monsters:       ["default", "business", "female", "surfer", "nerd"],
  monstersIndex:  (window.localStorage && window.localStorage.getItem("monster")) || 0,
  
  initialize: function() {
    this.monster = $("header > .monster");
    this.monster.click(this.nextMonster.bind(this)).queue();
    if (this.monstersIndex != 0) {
      this.setMonster(this.monsters[this.monstersIndex]);
    }
    this._observe();
  },
  
  _observe: function() {
    protonet.Notifications.bind("monster.jump", this.jumpMonster.bind(this));
    $(".heart").live("click", this.hearts.bind(this));
  },
  
  nextMonster: function(event) {
    event && event.preventDefault();
    
    if (this.monster.queue().length) {
      return;
    }
    
    this.monstersIndex++;
    if (this.monstersIndex >= this.monsters.length) {
      this.monstersIndex = 0;
    }
    
    if (window.localStorage) {
      window.localStorage.setItem("monster", this.monstersIndex);
    }
    
    this.setMonster(this.monsters[this.monstersIndex]);
  },
  
  setMonster: function(type) {
    var oldMarginBottom = parseInt(this.monster.css("marginBottom"), 10);
    
    this.monster.animate({
      marginBottom: (oldMarginBottom + 50).px()
    }, 250, function() {
      $.each(this.monsters, function(i, className) {
        this.monster.removeClass(className);
      }.bind(this));
      this.monster.addClass(type);
    }.bind(this)).animate({
      marginBottom: oldMarginBottom.px()
    }, 250, function() {
      if (type == "female") {
        this.hearts();
      }
    }.bind(this));
  },
  
  jumpMonster: function() {
    this.setMonster(this.monsters[this.monstersIndex]);
  },
  
  hearts: function(event) {
    var hearts = $("<span>", {
      "class": "hearts",
      html: "&hearts; &hearts; &hearts;<br>&hearts; &hearts;"
    }).insertBefore(this.monster);
    
    hearts.animate({
      opacity: 0,
      top: "-50px"
    }, 2000, function() {
      hearts.remove();
    });
  }
};
