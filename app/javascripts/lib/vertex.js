//* ------------------------------------------------- */
/* Vertex class */

var Vertex = function(x, y) {
  this.x = x;
  this.y = y;
};

Vertex.prototype = {
  sum: function(v) {
    return new Vertex(this.x + v.x, this.y + v.y);
  },
  diff: function(v) {
    return new Vertex(this.x - v.x, this.y - v.y);
  },
  prod: function(scalar) {
    return new Vertex(this.x * scalar, this.y * scalar);
  },
  quot: function(scalar) {
    return new Vertex(this.x / scalar, this.y / scalar);
  },
  len: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  scale: function(len) {
    return this.norm().prod(len);
  },
  norm: function() {
    return this.quot(this.len());
  },
  dot: function(v) {
    return (this.x * v.x + this.y * v.y);
  },
  inverse: function() {
    return this.prod(-1.0);
  }
};
