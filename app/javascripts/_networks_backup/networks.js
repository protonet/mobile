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
			Math.round(node.position.x)+"/"+Math.round(node.position.y),
			Math.round(node.force.x)+"/"+Math.round(node.force.y)
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

Graph.prototype.renderToCanvas = function(paper, w, h) {

	var area = w * h;
	var k = Math.sqrt(area / this.nodes.length) * 1.5;

	var c1 = 2;
	var c2 = 1;
	var c3 = 0.1;
	var c4 = 1.0; // 0.1

	console.log("-----");

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
				//node.force = d.scale(-(k * k) / d.len());
			}
		}
	}
		
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
		var force = d.scale(c3 / Math.sqrt(d.len()));
		//var force = d.scale(d.len() * d.len() / k);
		edge.toNode.force = force;
		edge.fromNode.force = force.inverse();
	}

	// let the forces influence the position of each node
	for (var n = 0; n < this.nodes.length; n++) {
		var node = this.nodes[n];
		node.position = node.position.sum(node.force.scale(c4));
		// prevent nodes from escaping the frame
		node.position.x = min(w / 2, max(-w / 2, node.position.x));
		node.position.y = min(h / 2, max(-h / 2, node.position.y));
	}

	// reduce the temperature as the layout approaches a better configuration
	//this.temperature = this.temperature - 0.1;

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
	var e11 = new Edge(n3, n8);

var NetworkGraph = new Graph(
	[n1, n2, n3, n4],
	[e1, e2, e3, e4]
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

double f_a (double x)
{
	return pow(x,2) / gOptimalSpringLength;
}

double f_r (double x)
{
	return (pow(gOptimalSpringLength,2)) / x;
}

double cool (double t)
{
	return t - 1.0; /* linear */
}

double min (TVertex v, double t)
{
	return vLength(v) * t / 100000.0;
}

void updateNodes (double t, double delta_t)
{
	if (gTemperature > 0.0)
	{
		TNode *tmp;
		int i;
	
		tmp = malloc( sizeof(TNode) * CNumberOfNodes );
		
		/* Berechnen der abstossenden Kraefte */
		for (i = 0; i < gNodeCounter; i ++)
		{
			int j;
			TNodeList otherNodes;
			TNode v = *(gNodes + i);
			
			v.disp = makeV(0,0,0);
			
			otherNodes = getOtherNodes( v.content );
			for (j = 0; j < otherNodes.length; j ++)
			{
				TVertex delta;
				TNode u = *(otherNodes.nodes + j);
				
				delta = subV( v.position, u.position );
				
				v.disp = addV( v.disp,
							mulV( divV(delta, vLength(delta)), f_r(vLength(delta) * v.mass) ));
			}
			
			*(tmp + i) = v;
		}
		
		/* Berechnen der anziehenden Kraefte */
		for (i = 0; i < gEdgeCounter; i ++)
		{
			TEdge e = *(gEdges + i);
			TNode v, u;
			TVertex delta;
			
			v = *(tmp + e.source);
			u = *(tmp + e.destination);

			delta = subV( v.position, u.position );
			
			v.disp = subV( v.disp,
						mulV( divV(delta, vLength(delta)),
							  f_a(vLength(delta)) ));
	
			u.disp = addV( u.disp,
						mulV( divV(delta, vLength(delta)),
							  f_a(vLength(delta)) ));
							  
			*(tmp + e.source)      = v;
			*(tmp + e.destination) = u;
		}
		
		/* Berechnen der neuen Positionen & Umspeichern */
		for (i = 0; i < gNodeCounter; i ++)
		{
			TNode v = *(tmp + i);
			
			/*p = v.position;*/ /* alte Position */
			
			v.position = addV( v.position,
							mulV( divV(v.disp, vLength(v.disp)),
								  min(v.disp, gTemperature) ));
								  
			/*if (v.position.x < -(gViewSizeX/2.0)) v.position.x = -(gViewSizeX/2.0);
			if (v.position.x >  (gViewSizeX/2.0)) v.position.x =  (gViewSizeX/2.0);
							
			if (v.position.y < -(gViewSizeY/2.0)) v.position.y = -(gViewSizeY/2.0);
			if (v.position.y >  (gViewSizeY/2.0)) v.position.y =  (gViewSizeY/2.0);
							
			if (v.position.z < -(gViewSizeZ/2.0)) v.position.z = -(gViewSizeZ/2.0);
			if (v.position.z >  (gViewSizeZ/2.0)) v.position.z =  (gViewSizeZ/2.0);*/
							
			/*v.velocity = divV( subV(p, v.position), delta_t );*/
							
			*(gNodes + i) = v;
		}
	
		gTemperature = cool(gTemperature);

		tmp = realloc( tmp, 0 );

		gIterations ++;
	}
	else
		printf("too cold\n");

	/*------------------------------*/
	{
		TResult r;
	
		r.nodes 		= gNodes;
		r.nodeCounter 	= gNodeCounter;
		r.edges 		= gEdges;
		r.edgeCounter 	= gEdgeCounter;
	
		/*printGraph(r);*/
	}
}

double averageVelocity (void)
{
	TVertex avg;
	int i;
	
	avg = makeV(0,0,0);
	
	for (i = 0; i < gNodeCounter; i ++)
		avg = addV( avg, (*(gNodes + i)).velocity );
	
	return vLength(avg) / CNumberOfNodes;
}

/*
var paper = Raphael("network-monitor", 520, 570);
// var circle = paper.circle(50, 40, 10);
// circle.attr({"fill": "#FDAB54", "stroke": "#ddd"});

$("#network li").click(function(event){
  // debugger;
  network_id = this.id.match(/network-(.*)/)[1];
  $.getJSON("/networks/"+network_id+"/map", 
    function(data){
      drawNetwork(data);
    }
  );
});

$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});


function drawNetwork(data) {
  // {:nodes => [
  //   {:name => "protonet-7.local", :type => 'edge', :clients => [{:name => 'foo'}, {:name => 'bar'}]},
  //   {:name => "protonet-4.local", :type => 'edge'},
  //   {:name => "protonet-main",    :type => 'supernode'}
  // ], :name => network.name, :type => 'cloud'}
  x = 58.5;
  y = 40;
  rectangle = paper.rect(x, y, 400, 200, 10);
  rectangle.attr({"stroke": "#FDAB54", "stroke-width": 2});
  txt = {"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#FDAB54"};
  paper.text(50+x, 10+y, data.name).attr(txt);
  var angle = (2 * Math.PI / data.nodes.length);
  var radar_length = 40;
  var circles = [];
  for(var i in data.nodes) {
    var x_offset = radar_length * Math.cos(angle * (i+1));
    var y_offset = radar_length * Math.sin(angle * (i+1));
    var circle_x = x+200+x_offset;
    var circle_y = y+100+y_offset;
    var circle = paper.circle(circle_x, circle_y, 10);
    circle.attr({"fill": "#FDAB54", "stroke": "#ddd"});
    paper.text(circle_x + 50, circle_y, data.nodes[i].name).attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#eee"});
    circles.push(circle);
  }
  for(i in circles) {
    (parseInt(i, 10) + 1 == circles.length) ? n = 0 : n = parseInt(i, 10) + 1;
    var path = paper.path("M " + circles[i].attrs.cx + " " + circles[i].attrs.cy + " L " + circles[n].attrs.cx + " " + circles[n].attrs.cy);
    path.attr({"stroke": "#eee", "stroke-width": 2, "opacity": 0.7});
    path.toBack();
  }
}

$(function() {
  $("#network li:first").click()
});
*/
