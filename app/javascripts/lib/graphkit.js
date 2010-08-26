// the future:
/*Vertex.prototype = {
  "sum": function(v) {
    return new Vertex(this.x + v.x, this.y + v.y);
  },
  // ...
}*/

//* ------------------------------------------------- */
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

var Node = function(number, info) {
  this.number   = number;
  this.info     = info;
  this.position = new Vertex(Math.random() * 10, Math.random() * 10);
  this.disp     = new Vertex(0, 0);
  this.mass     = 500.0;
  //console.log('create node '+this.toSource());
};

Node.prototype.render = function(paper) {
  var visual = paper.set();
  
  var title = paper.text(this.position.x, this.position.y, this.info.name);
  title.attr({fill: 'white', "font-size":11});
  if (this.info.type == 'client') {
    title.attr({'font-size':9});
  }
  //var bb = title.getBBox();
  //title.translate(-bb.x + this.position.x + 15, -bb.y + this.position.y - (bb.height / 2));
  visual.push(title);

  var bb = title.getBBox();
  var w = bb.width + 16;
  var h = bb.height + 10;
  var box;
  if (this.info.type == 'client') {
    //box = paper.circle(this.position.x, this.position.y, w / 2);
    box = paper.rect(this.position.x - (w / 2), this.position.y - (h / 2), w, h, h / 2);
  } else {
    box = paper.rect(this.position.x - (w / 2), this.position.y - (h / 2), w, h, 5);
  }
  
  var colors = {
    node:      {normal:"#ff7400", hover:"#ff9640"},
    supernode: {normal:"#f00", hover:"#ff4040"},
    client:    {normal:"#cd0074", hover:"#e6399b"}
  };

  box.attr({
    fill: $(colors).attr(this.info.type).normal,
    stroke: "white",
    opacity: 1,
    "stroke-width": 3
  });
  box.n = this;
  visual.push(box);
  
  // on mouse drauf Farbe aendern
  box.mouseover(function() {
    this.attr({fill: $(colors).attr(this.n.info.type).hover});
  });
  box.mouseout(function() {
    this.attr({fill: $(colors).attr(this.n.info.type).normal});
  });

  title.n = this;
  title.b = box;
  title.mouseover(function() {
    this.b.attr({fill: $(colors).attr(this.b.n.info.type).hover});
  });
  title.mouseout(function() {
    this.b.attr({fill: $(colors).attr(this.b.n.info.type).normal});
  });
  
  title.toFront(); 
  
  // rotate if client
  if (this.info.type == 'client') {
    visual.rotate(this.info.angle, false);
  }
  
  return visual;
}

/* ------------------------------------------------- */
/* Graph Edge class */

var Edge = function(fromNode, toNode) {
  this.fromNode = fromNode;
  this.toNode = toNode;
};

Edge.prototype.render = function(paper) {
  var line = paper.path(
     "M" + this.fromNode.position.x + "," + this.fromNode.position.y + 
    " L" + this.toNode.position.x   + "," + this.toNode.position.y);
  line.attr("fill", "blue");
  line.attr("stroke", "#666");
  if (this.fromNode.info.type != 'client' && this.toNode.info.type != 'client')
    line.attr("stroke-width", 2);
  return line;  
}

/* ------------------------------------------------- */
/* Graph class */

var Graph = function(target_id, maxIterations) {
  this.nodes = new Array();
  this.edges = new Array();

  this.iters         = 0;
  this.maxIterations = maxIterations;
  
  this.w = $($('#'+target_id)[0]).width();
  this.h = $($('#'+target_id)[0]).height();
  this.paper = Raphael(target_id, this.w, this.h);

  this.temperature = this.w * 100.0;
  this.area = this.w * this.h;
  this.optimalSpringLength = Math.sqrt(this.area / this.nodes.length) * 5;
  
  this.highestNodeNumber = 0;
};

Graph.prototype.nodeNumberIsUsed = function(number) {
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].number == number)
      return true;
  }
  return false;
};

Graph.prototype.getUniqueNodeNumber = function(online_users) {
  this.highestNodeNumber++;
  return this.highestNodeNumber;
};

Graph.prototype.updateFromAsyncInfo = function(online_users) {
  //console.log(online_users);
  // find local node (the one the clients are connected to)
  var localnode;
  for (var i = 0; i < this.nodes.length; i++) {
    // WIE KANN ICH DEN LOKALEN KNOTEN ERKENNEN?
    if (this.nodes[i].info.name == 'local')
      localnode = this.nodes[i];
  }
  if (localnode) {
    // add clients to node
    for (var key in online_users) {
        online_users[key].id = key;
        online_users[key].type = 'client';
        var node = new Node(this.getUniqueNodeNumber(), online_users[key]);
        this.addNode(node);
        this.addEdge(new Edge(node, localnode), false);
    }
    //this.log();
    this.restart();
  }
};

Graph.prototype.calcOptimalSpringLength = function() {
  return (Math.sqrt(this.area / this.nodes.length) * 5.0);
};

Graph.prototype.restart = function() {
  this.temperature = this.w * 100.0;
  this.iters = 0;
};

Graph.prototype.addNode = function(node) {
  // check if node has not been added before
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].number == node.number)
      return false;
  }
  this.nodes.push(node);
  
  if (node.number > this.highestNodeNumber)
    this.highestNodeNumber = node.number;
    
  this.optimalSpringLength = this.calcOptimalSpringLength();
  return true;
};

Graph.prototype.addEdge = function(edge, dublicateOk) {
  if (dublicateOk || (!dublicateOk && !this.edgeExists(edge.fromNode, edge.toNode)))
    this.edges.push(edge);
};

Graph.prototype.edgeExists = function(fromNode, toNode) {
  if (fromNode.number == toNode.number)
    return true;
  for (var i = 0; i < this.edges.length; i++) {
    var from = this.edges[i].fromNode;
    var to   = this.edges[i].toNode;
    if ((from.number == fromNode.number && to.number == toNode.number) ||
        (from.number == toNode.number   && to.number == fromNode.number))
          return true;
  }
  return false;
};

Graph.prototype.initFromNetworksInfo = function(networks) {

  // test with one node
  //this.addNode(new Node(1, {name:"one"}));
  //return true;

  // test with two nodes
  /*
  var n1 = new Node(1, {name:"one"});
  var n2 = new Node(2, {name:"two"});
  this.addNode(n1);
  this.addNode(n2);
  this.addEdge(new Edge(n1, n2));
  return true;
  */
  
  var nodes = new Array();
  for (var i = 0; i < networks.length; i++) {
    if (networks[i].supernode)
      networks[i].type = 'supernode';
    else
      networks[i].type = 'node';
    var node = new Node(i, networks[i]);
    this.addNode(node);
    nodes.push(node);
  }
  var edges = new Array();
  for (var i = 0; i < nodes.length; i++) {
    for (var j = 0; j < nodes.length; j++) {
      this.addEdge(new Edge(nodes[i], nodes[j]), false);
    }
  }
};

Graph.prototype.log = function() {
  var nodes = [];
  var edges = [];
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];
    nodes.push([
      Math.round(node.position.x)+"/"+Math.round(node.position.y)
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
  this.temperature = this.temperature - 0.8; /* linear */
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

function rad_to_deg(x) {
  return (180.0 / 3.1415 * x);
}
function deg_to_rad(x) {
  return (3.1415 * x / 180.0);
}

Graph.prototype.layout = function() {
  
  // special case: one node
  if (this.nodes.length == 1) {
    var node = this.nodes[0];
    node.position.x = this.w / 2;
    node.position.y = this.h / 2;
    return true;
  }
  
  // determine amount of nodes (not clients!)
  var num_normal_nodes = 0;
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    if (node.info.type != 'client')
      num_normal_nodes++;
  }
  // special case: less than 5 (non-client) nodes
  if (num_normal_nodes < 5) {
    // circular layout
    var radius = this.w / 6;
    var angle  = 360.0 / num_normal_nodes;
    var count  = 0;
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      if (node.info.type != 'client') {
        node.position.x = this.w / 2 + Math.sin(deg_to_rad(45 + angle * count)) * radius;
        node.position.y = this.h / 2 + Math.cos(deg_to_rad(45 + angle * count)) * radius;       
        count++;
      }
    }
    this.layout_clients();
    return true;
  }

  var delta_t = 1000.0 / 50.0; // starts 50 times within 1000 ms
  
  //console.log("-----");
  if (this.temperature > 0.0)
  {
    this.paper.clear();
    
    // calculate repulsive forces
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      node.disp = new Vertex(0, 0);
      for (var m = 0; m < this.nodes.length; m++) {
        var otherNode = this.nodes[m];
        if (node.number != otherNode.number) {

          var delta = node.position.diff( otherNode.position );
          if (delta.len() == 0) delta = new Vertex(0.1,0.1);
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
      if (delta.len() == 0) delta = new Vertex(0.1,0.1);
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
      if (node.info.type != 'client') {
        node.position = 
          node.position.sum(
            node.disp.quot(node.disp.len()).prod(
              this.min(node.disp)
            )
          );
        
        // don't let them escape the canvas
        if (node.position.x < 0)      node.position.x = this.w / 2;
        if (node.position.x > this.w) node.position.x = this.w / 2;
        if (node.position.y < 0)      node.position.y = this.h / 2;
        if (node.position.y > this.h) node.position.y = this.h / 2;
      
        /*
        if (isNaN(node.position.x) || Math.abs(node.position.x) == Infinity) 
          node.position.x = w / 2;
        if (isNaN(node.position.y) || Math.abs(node.position.y) == Infinity) 
          node.position.y = h / 2;
        */
      }
    }
    
    this.layout_clients();
    this.cool();
  }

  // check: no nodes should be placed at the same position!
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    for (var m = 0; m < this.nodes.length; m++) {
      var otherNode = this.nodes[m];
      if (node.number != otherNode.number) {  
        if (Math.floor(node.position.x) == Math.floor(otherNode.position.x) &&
          Math.floor(node.position.y) == Math.floor(otherNode.position.y)) {
        
          otherNode.position.x += Math.random(10);
        }
      }
    }
  }; 
  return true; 
};

Graph.prototype.layout_clients = function() {
  // layout client nodes circular around each node
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    if (node.info.type != 'client') {
      // find client node connected to this one
      var clients = new Array();
      for (var e = 0; e < this.edges.length; e++) {
        var edge = this.edges[e];
        var u = edge.fromNode;
        var v = edge.toNode;
        if ((u.number == node.number && v.info.type == 'client') ||
            (v.number == node.number && u.info.type == 'client')) {
          
          if (u.number == node.number)
            clients.push(v);
          else
            clients.push(u);
        }
      }
      
      // position clients circular around node
      if (clients.length > 0) {
        var radius = 30.0 + (clients.length * 5.0);
        var angle  = 360.0 / clients.length;
        //console.log(angle);
        for (var c = 0; c < clients.length; c++) {
          var client = clients[c];
          client.info.angle = (c > Math.floor(clients.length / 2) ? 270 : 90) - angle * c;
          client.position.x = node.position.x + Math.sin(deg_to_rad(angle * c)) * radius;
          client.position.y = node.position.y + Math.cos(deg_to_rad(angle * c)) * radius;
        }
      }
    }
  }  
};

Graph.prototype.render = function() {
  if (this.iters > this.maxIterations)
    return false;
  this.iters++;
  
  if (this.layout()) {
    this.paper.clear();
    var group = this.paper.set();
    // draw edges
    for (var i = 0; i < this.edges.length; i++) {
      group.push(this.edges[i].render(this.paper));
    }
    // draw nodes
    for (var i = 0; i < this.nodes.length; i++) {
      group.push(this.nodes[i].render(this.paper));
    }
    // center graph to canvas
    var bbox = group.getBBox();  
    group.translate(-bbox.x, -bbox.y);
    group.translate(
      (this.w - bbox.width) / 2.0,
      (this.h - bbox.height) / 2.0);
  }
};

