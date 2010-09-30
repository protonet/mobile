
//* ------------------------------------------------- */
/* Speechbubble class */

var Speechbubble = function(paper, w, h, text) {
  this.paper = paper;
  this.w = w;
  this.h = h;
  this.text = (text ? text : "Hello,\nworld!");
  this.targetpos = new Vertex(0,0);
  this.targetoffset = 0;
  this.padding = 10;
  this.active = true;

  // create speechbubble visuals
  this.visual = this.paper.rect(0,0,100,100, 10);
  this.visual.attr({fill: "white", stroke: "#ccc", "stroke-width": 1});
  
  this.visual_line = this.paper.path("M0,0 L10,10");
  this.visual_line.attr({
    stroke: "#ccc", 
    "stroke-width": 1, 
    fill: "#fff",
    "stroke-linecap": "butt"
  });
  
  this.visual_text = this.paper.text(0,0,"hello");
  this.visual_text.attr({fill: "#333"});
};

Speechbubble.prototype = {
  setText: function(text) {
    this.text = text;
  },

  setTargetPos: function(vertex) {
    this.targetpos = vertex;
  },

  setTargetOffset: function(offset) {
    this.targetoffset = offset;
  },

  show: function() {
    this.active = true;
    
    // update text
    this.visual_text.attr({text: this.text});
    var bb = this.visual_text.getBBox();
    var bubble_w = bb.width  + (2 * this.padding);
    var bubble_h = bb.height + (2 * this.padding);
    
    var pos = this.targetpos;    
    var arrowdiff = 0;
    var side = (pos.x > (this.w / 2) ? "left" : "right");
    if (side == "left") {
      // speechbubble is on the left side of targetpos
      pos.x -= bubble_w + this.targetoffset;
      arrowdiff = -(6.3 * 2);
    }
    else {
      // speechbubble is on the right side of targetpos
      pos.x += this.targetoffset;      
    }
    
    // resize bubble
    this.visual.attr({
      width:  bubble_w,
      height: bubble_h,
    });

    // redraw bubble arrow
    if (side == "left") {
      this.visual_line.attr({
        path: 
          "M"+(    arrowdiff)+","+(-7)+" "+
          "L"+(7 + arrowdiff)+","+(0)+" "+
          "L"+(    arrowdiff)+","+(7)      
      });
    }
    else { // right side
      this.visual_line.attr({
        path: 
          "M"+(7 + arrowdiff)+","+(-7)+" "+
          "L"+(    arrowdiff)+","+(0)+" "+
          "L"+(7 + arrowdiff)+","+(7)     
      });
    }

    // position everything
    var bbt = this.visual_text.getBBox();
    var bbl = this.visual_line.getBBox();
    var bbv = this.visual.getBBox();

    if (side == "left") {
      this.visual_text.translate(
        -bbt.x + pos.x + this.padding - 6.7, 
        -bbt.y + pos.y - (bubble_h / 2) + this.padding
      );
      this.visual.translate(
        -bbv.x + pos.x - 6, 
        -bbv.y + pos.y - (bubble_h / 2)
      );
      this.visual_line.translate(
        -bbl.x + pos.x + bubble_w - 6.7, 
        -bbl.y + pos.y - 7
      );      
    }
    else { // right side
      this.visual_text.translate(
        -bbt.x + pos.x + this.padding + 6.7, 
        -bbt.y + pos.y - (bubble_h / 2) + this.padding
      );
      this.visual.translate(
        -bbv.x + pos.x + 6, 
        -bbv.y + pos.y - (bubble_h / 2)
      );
      this.visual_line.translate(
        -bbl.x + pos.x, 
        -bbl.y + pos.y - 6.7
      );
    }    

    this.visual.toFront();
    this.visual_line.toFront();
    this.visual_text.toFront();
    
    this.visual_line.show();
    this.visual.show();
    this.visual_text.show();
  },

  hide: function() {
    this.active = false;
    
    this.visual_text.hide();
    this.visual.hide();
    this.visual_line.hide();
  },
  
  toggle: function() {
    if (this.active)
      this.hide();
    else
      this.show();
  }
};
