/**
 * Just some easter egg stuff :-)
 *
 * Let the monster jump via event notification monster.jump
 */
protonet.ui.Logo = {
  monsters:       ["default", "business", "female", "surfer", "nerd"],
  monstersIndex:  protonet.storage.get("monster") || 0,
  heartTrigger:   ".heart, .emoji-heart",
  
  initialize: function() {
    this.monster = $("header > .monster");
    this.monster.click(this.nextMonster.bind(this)).queue();
    if (this.monstersIndex != 0) {
      this.setMonster(this.monsters[this.monstersIndex]);
    }
    this._observe();
  },
  
  _observe: function() {
    protonet
      .on("monster.jump", this.jumpMonster.bind(this))
      .on("monster.in_love", this.hearts.bind(this))
      .on("channel.meep_receive", function(meepData, instance, channel) {
        if (!channel.isSelected) {
          return;
        }
        
        if (instance.article.find(this.heartTrigger).length) {
          setTimeout(this.hearts.bind(this), 200);
        }
      }.bind(this));
    
    $(document).delegate(this.heartTrigger, "click", this.hearts.bind(this));
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
    
    protonet.storage.set("monster", this.monstersIndex);
    
    this.setMonster(this.monsters[this.monstersIndex]);
  },
  
  setMonster: function(type) {
    var oldMarginBottom = this.monster.cssUnit("margin-bottom")[0];
    
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
      if (type === "female") {
        this.hearts();
      }
    }.bind(this));
  },
  
  jumpMonster: function() {
    this.setMonster(this.monsters[this.monstersIndex]);
  },
  
  hearts: function() {
    var $hearts = $("<span>", {
      "class": "hearts",
      html:    "&hearts; &hearts; &hearts;<br>&hearts; &hearts;"
    }).insertBefore(this.monster);
    
    $hearts.animate({
      opacity:  0,
      top:      "-50px"
    }, 2000, function() {
      $hearts.remove();
    });
  }
};
