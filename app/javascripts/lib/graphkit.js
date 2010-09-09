//* ------------------------------------------------- */
/* Vertex class */

/*
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
*/

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
/* ID Generator class */

var IDGenerator = {
  last: 0,
  genId: function() {
    this.last++;
    return this.last;
  }
}

/* ------------------------------------------------- */
/* Graph Node class */

var Node = function(info) {
  this.number = IDGenerator.genId();
  this.info = info;
  
  if (!this.info.type)
    this.info.type = 'node';

  this.position = new Vertex(Math.random() * 10, Math.random() * 10);
  this.disp     = new Vertex(0, 0);
  this.mass     = 500.0;
  this.added = false;
  
  this.active = true;
};

Node.prototype.render = function(paper, small) {
  if (!this.visual) {
    // create the initial visual
    this.paper  = paper;
    this.visual = paper.set();

    var is_small = small && (this.info.type == 'client' || this.info.type == 'node');
    
    var name = this.info.name;
    var is_stranger = this.info.name.match(/^stranger/);

    if (!is_small) {
      if (name.length > 10)
        name = name.substr(0,5)+'...'+name.substr(name.length-7,5);

      if (is_stranger)
        name = '?';

      var title = this.paper.text(this.position.x, this.position.y, name);
      title.attr({fill: 'white', "font-size":11});
      if (this.info.type == 'client')
        title.attr({'font-size':10});
      if (is_stranger)
        title.attr({fill: "#333"});
      this.visual.push(title);
    }

    var bb = (!is_small ? title.getBBox() : {x:0, y:0, width:6, height:4});
    var w = bb.width + 16;
    var h = bb.height + 12;
    var box;
    var borderradius = (this.info.type == 'client' ? h/2 : 5);
    if (is_small && this.info.type == 'client') {
      box = this.paper.circle(this.position.x, this.position.y, 5);
    } else {
      box = this.paper.rect(this.position.x - (w / 2), this.position.y - (h / 2), w, h, borderradius);
    }

    var colors = {
      node:      {normal:"#ff7400", hover:"#ff9640"},
      supernode: {normal:"#f00", hover:"#ff4040"},
      client:    {normal:"#cd0074", hover:"#e6399b"}
    };

    box.attr({
      fill: $(colors).attr(this.info.type).normal,
      //stroke: "white",
      opacity: 1,
      "stroke-width": 0 //(is_small ? 1 : 3)
    });
    if (is_stranger)
      box.attr({fill: "white", stroke: "grey", "stroke-width": 1});

    box.n = this;
    this.visual.push(box);

    // on mouse drauf Farbe aendern
    box.mouseover(function() {
      this.attr({fill: (is_stranger ? "#ccc" : $(colors).attr(this.n.info.type).hover)});
    });
    box.mouseout(function() {
      this.attr({fill: (is_stranger ? "#fff" : $(colors).attr(this.n.info.type).normal)});
    });

    if (!is_small) {
      title.n = this;
      title.b = box;
      title.mouseover(function() {
        this.b.attr({fill: (is_stranger ? "#ccc" : $(colors).attr(this.b.n.info.type).hover)});
      });
      title.mouseout(function() {
        this.b.attr({fill: (is_stranger ? "#fff" : $(colors).attr(this.b.n.info.type).normal)});
      });

      title.toFront();
    }
  }
   
  // rotate if client
  if (this.info.type == 'client') {
    // move visual so that it does not overlap local-node
    // vector from local-node to this client-node
    var dir  = this.position.diff(this.info.nodepos);
    var diff = dir.scale(this.visual.getBBox().width / 2 - 6);
    this.visual.translate(diff.x, diff.y);

    this.visual.rotate(this.info.angle, false);
  }

  // update the position of the visual
  var bb = this.visual.getBBox();
  this.visual.translate(-bb.x + this.position.x - bb.width/2, -bb.y + this.position.y - bb.height/2);
  
  return this.visual;
};

Node.prototype.deactivate = function() {
  this.visual.hide();
  this.active = false;
};

Node.prototype.activate = function() {
  this.visual.show();
  this.active = true;
};

/* ------------------------------------------------- */
/* Graph Edge class */

var Edge = function(fromNode, toNode) {
  this.fromNode = fromNode;
  this.toNode = toNode;
  this.added = false;
};

Edge.prototype.render = function(paper) {
  if (!this.visual) {
    this.paper = paper;
    this.visual = this.paper.path("M0,0 L1,1");
    this.visual.attr("fill", "blue");
    this.visual.attr("stroke", "#666");
    if (this.fromNode.info.type != 'client' && this.toNode.info.type != 'client')
      this.visual.attr("stroke-width", 2);
  }
  this.visual.attr("path",
    "M" + this.fromNode.position.x + "," + this.fromNode.position.y + 
    " L" + this.toNode.position.x   + "," + this.toNode.position.y);
  
  this.visual.toBack();
  return this.visual;
}

Edge.prototype.deactivate = function() {
  this.visual.hide();
};

Edge.prototype.activate = function() {
  this.visual.show();
};

/* ------------------------------------------------- */

function calcOptimalSpringLength(area, num_nodes, is_small) {
  return (Math.sqrt(area / num_nodes) * (is_small ? 3.5 : 5.0));
}

function calcInitialTemperature(width) {
  return width * 100.0;
}

function rad_to_deg(x) {
  return (180.0 / 3.1415 * x);
}
function deg_to_rad(x) {
  return (3.1415 * x / 180.0);
}

/* ------------------------------------------------- */
/* Graph class */

var Graph = function(target_id, maxIterations, small) {
  this.nodes = new Array();
  this.edges = new Array();
  
  this.queue = new Array();

  this.small = small; // true for a more compact design

  this.iters         = 0;
  this.maxIterations = maxIterations;
  
  this.w = $($('#'+target_id)[0]).width();
  this.h = $($('#'+target_id)[0]).height();
  this.paper = Raphael(target_id, this.w, this.h);

  this.temperature = calcInitialTemperature(this.w);
  this.area = this.w * this.h;
  this.optimalSpringLength = calcOptimalSpringLength(this.area, this.nodes.length, this.small);
};

Graph.prototype.nodeExists = function(info) {
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].info.id == info.id)
      return true;
  }
  return false;
};

Graph.prototype.nodeNumberIsUsed = function(number) {
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].number == number)
      return true;
  }
  return false;
};

Graph.prototype.deleteEdgesAtNode = function(node) {
  for (var e = 0; e < this.edges.length; e++) {
    var from = this.edges[e].fromNode;
    var to   = this.edges[e].toNode;
    if (from.number == node.number || to.number == node.number)
      this.edges[e].deactivate();
  }
};

Graph.prototype.deleteNode = function(node) {
  for (var n = 0; n < this.nodes.length; n++) {
    if (this.nodes[n].number == node.number)
      this.nodes[n].deactivate();
  }
};

Graph.prototype.deleteClientNodesExcluding = function(online_users) {
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    if (node.info.type == 'client') {
      // try to find node in online_users
      var found = false;
      for (var key in online_users) {
        if (online_users[key].id == node.info.id)
          found = true;
      }
      if (!found) {
        this.deleteEdgesAtNode(node);
        this.deleteNode(node);
      }
    }
  }
};

Graph.prototype.getNodeById = function(id) {
  for (var n = 0; n < this.nodes.length; n++)
    if (this.nodes[n].info.id == id)
      return this.nodes[n];
  return false;
};

Graph.prototype.updateFromAsyncInfo = function(online_users) {
  /*
  online_users["11"] = {name:"client", supernode:null};
  online_users["12"] = {name:"mr.x", supernode:null};
  online_users["13"] = {name:"superman", supernode:null};
  online_users["14"] = {name:"superwoman", supernode:null};
  online_users["15"] = {name:"mrs.x", supernode:null};
  */
  //console.log(online_users.toSource());

  // add id to info
  for (var key in online_users) {
    online_users[key].id = key;
    online_users[key].type = 'client';
  }
  // delete all nodes (and edges to/from them) that are not
  // inside the current online_users hash
  this.deleteClientNodesExcluding(online_users);
  
  var by_uuid = {};
  for (var i = 0; i < this.nodes.length; i++) {
    by_uuid[this.nodes[i].info.id] = this.nodes[i];
  }
  
  for (var key in online_users) {
    var info = online_users[key];
    var net_node = by_uuid["1"]; //by_uuid[info['network_uuid']];
    if (net_node) {
      if (this.nodeExists(info)) {
        // find node (and connected edges) and activate
        var node = this.getNodeById(info.id);
        node.activate();
        for (var e = 0; e < this.edges.length; e++) {
          var u = this.edges[e].fromNode;
          var v = this.edges[e].toNode;
          if (u.active && v.active) {
            if (u.number == node.number || v.number == node.number) {
              this.edges[e].activate();
            }
          }
        }
      }
      else {
        var node = new Node(info);
        var edge = new Edge(node, net_node);
        this.queue.push(node);
        this.queue.push(edge);
      }
    }
  }
  this.restart();
};

Graph.prototype.restart = function() {
  this.temperature = calcInitialTemperature(this.w);
  this.iters = 0;
};

Graph.prototype.addNode = function(node) {
  if (!this.nodeExists(node.info))
    this.nodes.push(node);
    
  this.optimalSpringLength = 
    calcOptimalSpringLength(this.area, this.nodes.length, this.small);

  return node;
};

Graph.prototype.addEdge = function(edge, dublicateOk) {
  if (dublicateOk || (!dublicateOk && !this.edgeExists(edge.fromNode, edge.toNode)))
    this.edges.push(edge);
};

Graph.prototype.edgeExists = function(fromNode, toNode) {
  if (fromNode.number == toNode.number || fromNode.info.id == toNode.info.id)
    return true;
    
  for (var i = 0; i < this.edges.length; i++) {
    var from = this.edges[i].fromNode;
    var to   = this.edges[i].toNode;
    if (// via number
        (from.number == fromNode.number && to.number == toNode.number) ||
        (from.number == toNode.number   && to.number == fromNode.number) ||
        // via info.id
        (from.info.id == fromNode.info.id && to.info.id == toNode.info.id) ||
        (from.info.id == toNode.info.id   && to.info.id == fromNode.info.id))
          return true;
  }
  return false;
};

Graph.prototype.testOneNode = function() {
  this.addNode(new Node({name:"one",type:"supernode"}));
  return true;
}

Graph.prototype.testTwoNodes = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"two"}));
  this.addEdge(new Edge(n1, n2));
  return true;
}

Graph.prototype.testThreeNodes = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"stranger"}));
  var n3 = this.addNode(new Node({name:"three"}));
  this.addEdge(new Edge(n1, n2));
  this.addEdge(new Edge(n1, n3));
  return true;
}

Graph.prototype.testFourNodes = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"stranger"}));
  var n3 = this.addNode(new Node({name:"three"}));
  var n4 = this.addNode(new Node({name:"four"}));
  this.addEdge(new Edge(n1, n2));
  this.addEdge(new Edge(n1, n3));
  this.addEdge(new Edge(n1, n4));
  this.addEdge(new Edge(n2, n3));
  return true;
}

Graph.prototype.testFiveNodes = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"stranger"}));
  var n3 = this.addNode(new Node({name:"three"}));
  var n4 = this.addNode(new Node({name:"four"}));
  var n5 = this.addNode(new Node({name:"five"}));
  this.addEdge(new Edge(n1, n2));
  this.addEdge(new Edge(n1, n3));
  this.addEdge(new Edge(n1, n4));
  this.addEdge(new Edge(n2, n3));
  this.addEdge(new Edge(n2, n5));
  return true;
}

Graph.prototype.testSixNodes = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"stranger"}));
  var n3 = this.addNode(new Node({name:"three"}));
  var n4 = this.addNode(new Node({name:"four"}));
  var n5 = this.addNode(new Node({name:"five"}));
  var n6 = this.addNode(new Node({name:"six"}));
  this.addEdge(new Edge(n1, n2));
  this.addEdge(new Edge(n1, n3));
  this.addEdge(new Edge(n1, n4));
  this.addEdge(new Edge(n2, n3));
  this.addEdge(new Edge(n2, n5));
  this.addEdge(new Edge(n5, n6));
  return true;
}

// 6 nodes around a central one
// connected in a ring and to the central one
Graph.prototype.testComplex01 = function() {
  var n1 = this.addNode(new Node({name:"one",type:'supernode'}));
  var n2 = this.addNode(new Node({name:"stranger"}));
  var n3 = this.addNode(new Node({name:"three"}));
  var n4 = this.addNode(new Node({name:"four"}));
  var n5 = this.addNode(new Node({name:"five"}));
  var n6 = this.addNode(new Node({name:"six"}));
  var n7 = this.addNode(new Node({name:"seven"}));
  // ring
  this.addEdge(new Edge(n2, n3));
  this.addEdge(new Edge(n3, n4));
  this.addEdge(new Edge(n4, n5));
  this.addEdge(new Edge(n5, n6));
  this.addEdge(new Edge(n6, n7));
  this.addEdge(new Edge(n7, n2));
  // connection to center
  this.addEdge(new Edge(n1, n2));
  this.addEdge(new Edge(n1, n3));
  this.addEdge(new Edge(n1, n4));
  this.addEdge(new Edge(n1, n5));
  this.addEdge(new Edge(n1, n6));
  this.addEdge(new Edge(n1, n7));
  return true;
}

Graph.prototype.initFromNetworksInfo = function(networks) {

  //return this.testOneNode();
  //return this.testTwoNodes();
  //return this.testThreeNodes();
  //return this.testFourNodes();
  //return this.testFiveNodes();
  //return this.testSixNodes();
  //return this.testComplex01();
  
  var nodes = new Array();
  for (var i = 0; i < networks.length; i++) {
    if (networks[i].supernode)
      networks[i].type = 'supernode';
    else
      networks[i].type = 'node';
    var node = new Node(networks[i]);
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
  var nodes = ["nodes"];
  var edges = ["edges"];
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];
    nodes.push([
      node.info.id, node.info.type,
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
  this.temperature = this.temperature - 0.5; /* linear */
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

Graph.prototype.numConnectedClients = function(node) {
  var n = 0;
  for (var e = 0; e < this.edges.length; e++) {
    var edge = this.edges[e];
    var u = edge.fromNode;
    var v = edge.toNode;
    if ((u.number == node.number && v.info.type == 'client') ||
        (v.number == node.number && u.info.type == 'client'))
      n++;
  }
  return n;
}

Graph.prototype.processQueue = function() {
  if (this.queue.length) {
    var node = this.queue.shift();
    this.addNode(node);
    
    var edge = this.queue.shift();
    this.addEdge(edge, false);
    
    this.restart();
  }
}

Graph.prototype.layout = function() {
  //this.log();

  // determine amount of nodes (not clients!)
  var normal_nodes = new Array();
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    if (node.info.type != 'client' && node.active)
      normal_nodes.push(node);
  }

  // special case: one node
  if (normal_nodes.length == 1) {
    var node = normal_nodes[0];
    node.position.x = this.w / 2;
    node.position.y = this.h / 2;
    this.layout_clients();
    this.iters = this.maxIterations + 1;
    return true;
  }
  
  // special case: less than 5 (non-client) nodes
  if (normal_nodes.length < 5) {
    // circular layout
    var radius = Math.min(this.w, this.h) / 4;
    var angle  = 360.0 / normal_nodes.length;
    var count  = 0;
    for (var n = 0; n < normal_nodes.length; n++) {
      var node = normal_nodes[n];
      if (node.active) {
        node.position.x = this.w / 2 + Math.sin(deg_to_rad(45 + angle * count)) * radius;
        node.position.y = this.h / 2 + Math.cos(deg_to_rad(45 + angle * count)) * radius;       
        count++;
      }
    }
    this.layout_clients();
    this.iters = this.maxIterations + 1;
    return true;
  }

  var delta_t = 1000.0 / 50.0; // starts 50 times within 1000 ms
  
  if (this.temperature > 0.0)
  {
    // calculate repulsive forces
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      if (node.info.type != 'client' && node.active) {
        node.disp = new Vertex(0, 0);
        for (var m = 0; m < this.nodes.length; m++) {
          var otherNode = this.nodes[m];
          if (node.number != otherNode.number &&
              otherNode.info.type != 'client' && otherNode.active) {

            var delta = node.position.diff( otherNode.position );
            if (delta.len() == 0) delta = new Vertex(0.1,0.1);
            var d = delta.len();
    
            // the node gains mass when it "carries" a bunch of clients (it needs more space)
            var mass = node.mass / ((this.numConnectedClients(node) + 1) * 2.5);
    
            node.disp = 
              node.disp.sum(
                delta.quot(d).prod( 
                  this.force_repulse(d * mass)
                )
              );
          }
        }
      }
    }
    
    // calculate attractive forces
    for (var e = 0; e < this.edges.length; e++) {
      var edge = this.edges[e];
      var u = edge.fromNode;
      var v = edge.toNode;
      
      if (u.active && v.active &&
          u.info.type != 'client' && v.info.type != 'client') {
        var delta = v.position.diff(u.position);
        if (delta.len() == 0) delta = new Vertex(0.1,0.1);
        var d = delta.len();

        var rand = new Vertex(Math.random(), Math.random());

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
    }
    
    // apply forces
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      if (node.info.type != 'client' && node.active) {
        var optLen = calcOptimalSpringLength(this.area, this.nodes.length) / 3.0;
        node.disp = node.disp.scale(node.disp.len() > optLen ? optLen : node.disp.len());
        
        node.position = 
          node.position.sum(
            node.disp.quot(node.disp.len()).prod(
              this.min(node.disp)
            )
          );
        
        // don't let them escape the canvas
        if (node.position.x < 10) node.position.x = 10;
        if (node.position.x > this.w - 10) node.position.x = this.w - 10;
        if (node.position.y < 10) node.position.y = 10;
        if (node.position.y > this.h - 10) node.position.y = this.h - 10;
      
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
  return true; 
};

Graph.prototype.layout_clients = function() {
  // layout client nodes circular around each node
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    if (node.info.type != 'client' && node.active) {
      // find client node connected to this one
      var clients = new Array();
      for (var e = 0; e < this.edges.length; e++) {
        var edge = this.edges[e];
        var u = edge.fromNode;
        var v = edge.toNode;
        if (u.active && v.active) {
          if ((u.number == node.number && v.info.type == 'client') ||
              (v.number == node.number && u.info.type == 'client')) {
          
            if (u.number == node.number)
              clients.push(v);
            else
              clients.push(u);
          }
        }
      }
      
      // position clients circular around node
      if (clients.length > 0) {
        var radius = (this.small ? 20.0 : 30.0) + (clients.length * (this.small ? 4.0 : 5.0));
        var angle  = 360.0 / clients.length;
        for (var c = 0; c < clients.length; c++) {
          var client = clients[c];
          client.info.angle = (c > Math.floor(clients.length / 2) ? 270 : 90) - angle * c;
          client.position.x = node.position.x + Math.sin(deg_to_rad(angle * c)) * radius;
          client.position.y = node.position.y + Math.cos(deg_to_rad(angle * c)) * radius;
          client.info.nodepos = node.position;
        }
      }
    }
  }  
};

Graph.prototype.render = function() {
  this.processQueue();

  if (this.iters > this.maxIterations)
    return false;
  this.iters++;

  if (this.layout()) {
    if (!this.visual)
      this.visual = this.paper.set();
    
    // draw edges
    for (var i = 0; i < this.edges.length; i++) {
      var visual = this.edges[i].render(this.paper);
      if (this.edges[i].added == false) {
        this.visual.push(visual);
        this.edges[i].added = true;
      }
    }
    // draw nodes
    for (var i = 0; i < this.nodes.length; i++) {
      var visual = this.nodes[i].render(this.paper, this.small);
      if (this.nodes[i].added == false) {
        this.visual.push(visual);
        this.nodes[i].added = true;
      }
    }

    // center graph to canvas
    var bb = this.visual.getBBox();
    this.visual.translate(-bb.x + (this.w - bb.width) / 2.0, -bb.y + (this.h - bb.height) / 2.0);
  }
};

