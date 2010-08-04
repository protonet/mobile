/*
 set up initial node velocities to (0,0)
 set up initial node positions randomly // make sure no 2 nodes are in exactly the same position
 loop
     total_kinetic_energy := 0 // running sum of total kinetic energy over all particles
     for each node
         net-force := (0, 0) // running sum of total force on this particular node
         
         for each other node
             net-force := net-force + Coulomb_repulsion( this_node, other_node )
         next node
         
         for each spring connected to this node
             net-force := net-force + Hooke_attraction( this_node, spring )
         next spring
         
         // without damping, it moves forever
         this_node.velocity := (this_node.velocity + timestep * net-force) * damping
         this_node.position := this_node.position + timestep * this_node.velocity
         total_kinetic_energy := total_kinetic_energy + this_node.mass * (this_node.velocity)^2
     next node
 until total_kinetic_energy is less than some small number  // the simulation has stopped moving
*/
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
	this.number       = number;
	this.position     = new Vertex(Math.random() * 10, Math.random() * 10);
	//this.velocity     = new Vertex(0.0, 0.0);
	//this.acceleration = new Vertex(1.0, 1.0);	
	this.force = new Vertex(1, 1);
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

var Graph = function(nodes, edges) {
	this.nodes = nodes;
	this.edges = edges;
	this.temperature = 1.0;
};

Graph.prototype.log = function() {
	var nodes = [];
	var edges = [];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		nodes.push([
			Math.round(node.position.x)+"/"+Math.round(node.position.y)
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

function min(x, y) {
	if (x < y) { 
		return x;
	} else {
		return y;
	}
}

function max(x, y) {
	if (x > y) { 
		return x;
	} else {
		return y;
	}
}

/*
function nodef(norm) {
	return norm * 100;
}

function edgef(norm) {
	return norm;
}
*/

Graph.prototype.renderToCanvas = function(paper, w, h) {

/*
	for (var n = 0; n < this.nodes.length; n++) {
		var node = this.nodes[n];
		// reset acceleration
		node.disp = new Vertex(0, 0);
		for (var m = 0; m < this.nodes.length; m++) {
			var otherNode = this.nodes[m];
			if (node.number != otherNode.number) {
				var dpos = node.position.diff(otherNode.position);
			  	var norm = dpos.norm() || 1;
			  	otherNode.disp.sum(dpos.scale(nodef(norm) / norm));
			}
		}
		node.visited = false;  
	}

	for (var e = 0; e < this.edges.length; e++) {
		var edge = this.edges[e];
		if (!edge.toNode.visited) {
			var dpos = edge.fromNode.position.diff(edge.toNode.position);
	  		var norm = dpos.norm() || 1;
	  		edge.fromNode.disp.sum(dpos.scale(-edgef(norm) / norm));  
	  		edge.toNode.disp.sum(dpos.scale(-1));  
 		}
		edge.toNode.visited = true;  
	}

	//for (var n = 0; n < this.nodes.length; n++) {
	//	var node = this.nodes[n];
	//	node.position = node.disp.prod(delta_t * delta_t).quot(2.0).sum(node.velocity.prod(delta_t));
	//}

    var dpos = $C(0, 0);
   	// calculate repulsive forces  
   6.   GUtil.eachNode(graph, function(v) {  
   7.     //initialize disp  
   8.     $each(property, function(p) {  
   9.       v.disp[p].x = 0; v.disp[p].y = 0;  
  10.     });  
  11.     GUtil.eachNode(graph, function(u) {  
  12.       if(u.id != v.id) {  
  13.         $each(property, function(p) {  
  14.           var vp = v.getPos(p), up = u.getPos(p);  
  15.           dpos.x = vp.x - up.x;  
  16.           dpos.y = vp.y - up.y;  
  17.           var norm = dpos.norm() || 1;  
  18.           v.disp[p].$add(dpos  
  19.               .$scale(opt.nodef(norm) / norm));  
  20.         });  
  21.       }  
  22.     });  
  23.   });  
  24.   //calculate attractive forces  
  25.   var T = !!graph.getNode(this.root).visited;  
  26.   GUtil.eachNode(graph, function(node) {  
  27.     GUtil.eachAdjacency(node, function(adj) {  
  28.       var nodeTo = adj.nodeTo;  
  29.       if(!!nodeTo.visited === T) {  
  30.         $each(property, function(p) {  
  31.           var vp = node.getPos(p), up = nodeTo.getPos(p);  
  32.           dpos.x = vp.x - up.x;  
  33.           dpos.y = vp.y - up.y;  
  34.           var norm = dpos.norm() || 1;  
  35.           node.disp[p].$add(dpos.$scale(-opt.edgef(norm) / norm));  
  36.           nodeTo.disp[p].$add(dpos.$scale(-1));  
  37.         });  
  38.       }  
  39.     });  
  40.     node.visited = !T;  
  41.   });  
  42.   //arrange positions to fit the canvas  
  43.   var t = opt.t, w2 = opt.width / 2, h2 = opt.height / 2;  
  44.   GUtil.eachNode(graph, function(u) {  
  45.     $each(property, function(p) {  
  46.       var disp = u.disp[p];  
  47.       var norm = disp.norm() || 1;  
  48.       var p = u.getPos(p);  
  49.       p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm,  
  50.           disp.y * min(Math.abs(disp.y), t) / norm));  
  51.       p.x = min(w2, max(-w2, p.x));  
  52.       p.y = min(h2, max(-h2, p.y));  
  53.     });  
  54.   });  
  55. }
*/

	var area = w * h;
	var k = Math.sqrt(area / this.nodes.length) * 1.5;

	var c1 = 2;
	var c2 = 1;
	var c3 = 1;
	var c4 = 1.0;

	console.log("-----");
	//console.log("k = "+k);
	//this.log();
	// calculate repulsive forces
	for (var n = 0; n < this.nodes.length; n++) {
		var node = this.nodes[n];
		// reset acceleration
		node.force = new Vertex(0, 0);
		for (var m = 0; m < this.nodes.length; m++) {
			var otherNode = this.nodes[m];
			if (node.number != otherNode.number) {
				//	Kraftvektor 
				//	  	-> steigt proportional mit Entfernung zwischen 2 Knoten
				//		-> gerichtet in Richtung des anderen Knoten
				
				var d = otherNode.position.diff(node.position); // vector: node -> otherNode
				node.force = d.scale(c1 * Math.log(d.len() / c2));
			}
		}
	}
		
	//this.log();
	// calculate attractive forces
	for (var e = 0; e < this.edges.length; e++) {
		var edge = this.edges[e];
		//	Kraftvektor
		//		-> proportional zur Differenz zwischen momentaner Laenge einer
		//		   Kante und der Laenge im Ruhezustand (1)
		//	    -> gerichtet entlang der Kante
		//		-> Richtung abh. davon, ob die Differenz negativ oder positiv ist:
		//		   neg. (Kante ist kuerzer): Kraft in Richtung der beiden Knoten
		//		   pos. (Kante ist laenger): Kraft in Richtung des Kantenmittelpunkts
		//		-> Kraft wird auf beide Knoten angewandt
		
		// get vector between nodes
		var d = edge.toNode.position.diff(edge.fromNode.position); // vector: fromNode -> toNode
		edge.toNode.force = d.scale(c3 / Math.sqrt(d.len()));
	}

	// let the forces influence the position of each node
	for (var n = 0; n < this.nodes.length; n++) {
		var node = this.nodes[n];
		// s = ((a * t^2) / 2) + (v * t)
		//node.acceleration = node.acceleration.prod(this.temperature);
		//node.position = node.acceleration.prod(delta_t * delta_t).prod(c4).quot(2.0).sum(node.velocity.prod(delta_t));
		node.position = node.position.sum(node.force.scale(c4));
		// prevent nodes from escaping the frame
		node.position.x = min(w / 2, max(-w / 2, node.position.x));
		node.position.y = min(h / 2, max(-h / 2, node.position.y));
	}

	// reduce the temperature as the layout approaches a better configuration
	this.temperature = this.temperature - 0.1;

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
		(w / 2.0) - (bbox.width / 2.0),
		(h / 2.0) - (bbox.height / 2.0));
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
var e3 = new Edge(n2, n5);
var e4 = new Edge(n3, n1);
var e5 = new Edge(n2, n5);
var e6 = new Edge(n3, n4);
var e7 = new Edge(n4, n1);
var e8 = new Edge(n4, n6);
var e9 = new Edge(n6, n7);
var e10 = new Edge(n6, n2);
var e11 = new Edge(n3, n8);

var NetworkGraph = new Graph(
	[n1, n2, n3, n4, n5, n6, n7, n8],
	[e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11]
);

var w = 520;
var h = 570;
var paper = Raphael("network-monitor", w, h);

var redrawn = 0;
var ourInterval = setInterval("redraw()", 50);

function redraw() {
	if (redrawn < 100) {
		paper.clear();
		NetworkGraph.log();
		NetworkGraph.renderToCanvas(paper, w, h);
	} else {
		clearInterval(ourInterval);		
	}
	redrawn++;
}

/*
$("#network li").click(function(event){
  // debugger;
  network_id = this.id.match(/network-(.*)/)[1];
  $.getJSON("/networks/"+network_id+"/map", 
    function(data){
      drawNetwork(data);
    }
  );
});
*/

//function drawNetwork(data) {
  // {:nodes => [
  //   {:name => "protonet-7.local", :type => 'edge', :clients => [{:name => 'foo'}, {:name => 'bar'}]},
  //   {:name => "protonet-4.local", :type => 'edge'},
  //   {:name => "protonet-main",    :type => 'supernode'}
  // ], :name => network.name, :type => 'cloud'}
//}

/*
$(function() {
  $("#network li:first").click()
});
*/
