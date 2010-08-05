//= require "lib/raphael-min.js"
//= require "lib/jquery-ui-1.7.2.custom.min.js"

/* ------------------------------------------------- */
/* Vertex class */

var Vertex = function(x, y) {
	this.x = x;
	this.y = y;
};

Vertex.prototype.sum = function(v) {
	return new Vertex(this.x + v.x, this.y + v.y);
};

Vertex.prototype.diff = function(v) {
	return new Vertex(this.x - v.x, this.y - v.y);
};

Vertex.prototype.prod = function(scalar) {
	return new Vertex(this.x * scalar, this.y * scalar);
};

Vertex.prototype.quot = function(scalar) {
	return new Vertex(this.x / scalar, this.y / scalar);
};

Vertex.prototype.len = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vertex.prototype.scale = function(len) {
	return this.norm().prod(len);
};

Vertex.prototype.norm = function() {
	return this.quot(this.len());
};

Vertex.prototype.dot = function(v) {
	return (this.x * v.x + this.y * v.y);
};

Vertex.prototype.inverse = function() {
	return this.prod(-1.0);
};

/* ------------------------------------------------- */
/* Graph Node class */

var Node = function(number) {
	this.number   = number;
	this.position = new Vertex(Math.random() * 10, Math.random() * 10);
	this.disp     = new Vertex(1, 1);
	this.mass     = 500.0;
	//console.log('create node '+this.toSource());
};

Node.prototype.renderToCanvas = function(paper) {
	var circle = paper.circle(this.position.x, this.position.y, 10);
	circle.attr("fill", "red");
	circle.attr("stroke", "white");
	circle.attr("opacity", 0.5);
	return circle;
}

/* ------------------------------------------------- */
/* Graph Edge class */

var Edge = function(fromNode, toNode) {
	this.fromNode = fromNode;
	this.toNode = toNode;
};

Edge.prototype.renderToCanvas = function(paper) {
	var line = paper.path(
		 "M" + this.fromNode.position.x + "," + this.fromNode.position.y + 
		" L" + this.toNode.position.x   + "," + this.toNode.position.y);
	line.attr("fill", "blue");
	line.attr("stroke", "white");
	return line;	
}

/* ------------------------------------------------- */
/* Graph class */

var Graph = function(nodes, edges, w, h) {
	this.nodes = nodes;
	this.edges = edges;
	this.width  = w;
	this.height = h;
	this.temperature = w * 100.0;
	this.area = w * h;
	this.optimalSpringLength = Math.sqrt(this.area / this.nodes.length) * 1.5;
};

Graph.prototype.log = function() {
	var nodes = [];
	var edges = [];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		nodes.push([
			Math.round(node.position.x)+"/"+Math.round(node.position.y)
			//Math.round(node.force.x)+"/"+Math.round(node.force.y)
			//Math.round(node.velocity.x)+"/"+Math.round(node.velocity.y),
			//Math.round(node.acceleration.x)+"/"+Math.round(node.acceleration.y)
		]);
	}
	for (var i = 0; i < this.edges.length; i++) {
		var edge = this.edges[i];
		var e = edge.toNode.position.diff(edge.fromNode.position);
		edges.push(
			Math.round(e.len())
		);
	}
	console.log(nodes);
	console.log(edges);
}

Graph.prototype.cool = function() {
	this.temperature = this.temperature - 0.9; /* linear */
}

Graph.prototype.min = function(v) {
	return v.len() * this.temperature / 100000.0;
}

Graph.prototype.force_attract = function(x) {
	return (x * x) / this.optimalSpringLength;
}

Graph.prototype.force_repulse = function(x) {
	return (this.optimalSpringLength * this.optimalSpringLength) / x;
}

Graph.prototype.renderToCanvas = function(paper, w, h) {

	var delta_t = 1000.0 / 50.0; // starts 50 times within 1000 ms
	
	//console.log("-----");
	if (this.temperature > 0.0)
	{
		// calculate repulsive forces
		for (var n = 0; n < this.nodes.length; n++) {
			var node = this.nodes[n];
			node.disp = new Vertex(0, 0);
			for (var m = 0; m < this.nodes.length; m++) {
				var otherNode = this.nodes[m];
				if (node.number != otherNode.number) {

					var delta = node.position.diff( otherNode.position );
					var d = delta.len();
					
					node.disp = 
						node.disp.sum(
							delta.quot(d).prod( 
								this.force_repulse(d * node.mass)
							)
						);
				}
			}
		}
		
		// calculate attractive forces
		for (var e = 0; e < this.edges.length; e++) {
			var edge = this.edges[e];
			var u = edge.fromNode;
			var v = edge.toNode;

			var delta = v.position.diff(u.position);
			var d = delta.len();
			
			v.disp =
				v.disp.diff(
					delta.quot(d).prod(
						this.force_attract(d)
					)
				);
	
			u.disp = 
				u.disp.sum(
					delta.quot(d).prod(
						this.force_attract(d)
					)
				);							  
		}

		for (var n = 0; n < this.nodes.length; n++) {
			var node = this.nodes[n];
			
			node.position = 
				node.position.sum(
					node.disp.quot(node.disp.len()).prod(
						this.min(node.disp)
					)
				);
		}
	
		this.cool();
	}

	var group = paper.set();
	// draw edges
	for (var i = 0; i < this.edges.length; i++) {
		group.push(this.edges[i].renderToCanvas(paper));
	}
	// draw nodes
	for (var i = 0; i < this.nodes.length; i++) {
		group.push(this.nodes[i].renderToCanvas(paper));
	}
	// center graph to canvas
	var bbox = group.getBBox();	
	group.translate(-bbox.x, -bbox.y);
	group.translate(
		(w - bbox.width) / 2.0,
		(h - bbox.height) / 2.0);
};

// make graph and render it
var n1 = new Node(1);
var n2 = new Node(2);
var n3 = new Node(3);
var n4 = new Node(4);
var n5 = new Node(5);
var n6 = new Node(6);
var n7 = new Node(7);
var n8 = new Node(8);

var e1 = new Edge(n1, n2);
var e2 = new Edge(n2, n3);
var e3 = new Edge(n3, n4);
var e4 = new Edge(n4, n1);
var e5 = new Edge(n2, n5);
var e6 = new Edge(n3, n4);
var e7 = new Edge(n4, n1);
var e8 = new Edge(n4, n6);
var e9 = new Edge(n6, n7);
var e10 = new Edge(n6, n2);
var e11 = new Edge(n1, n8);

var w = 520;
var h = 570;
var NetworkGraph = new Graph(
	[n1, n2, n3, n4, n5, n6, n7, n8],
	[e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11],
	w, h
);
var paper = Raphael("network-monitor", w, h);

var redrawn = 0;
var ourInterval = setInterval("redraw()", 50);

function redraw() {
	if (redrawn < 100) {
		paper.clear();
		//NetworkGraph.log();
		NetworkGraph.renderToCanvas(paper, w, h);
	} else {
		clearInterval(ourInterval);		
	}
	redrawn++;
}


$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#network li").click(function(event){
    networkId = this.id.match(/network-(.*)/)[1];
    $.getJSON("/networks/"+networkId+"/map", 
      function(data){
        drawNetwork(data);
      }
    );
    $("#network-details").load("/networks/" + networkId);
    $("#network li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  if(location.hash) {
    $("#network-" + location.hash.substring(1)).click();
  } else {
    $("#network li:first").click();
  }
  $("#network .control a").click(function(){
    $.ajax({
      url: this.href,
      data: {},
      success: function(data) {
        
      },
      error: function() {
        console.log('error')
      }
    });
    return false;
  });
});

$(function() {
  $("#network li:first").click()
});
*/
