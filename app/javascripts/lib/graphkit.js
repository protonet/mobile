
/* ------------------------------------------------- */
/* ID Generator class */

var NodeIDGenerator = {
  last: 0,
  genId: function() {
    this.last++;
    return this.last;
  }
};

/* ------------------------------------------------- */
/* Graph Node class */

var Node = function(info) {
  this.number = NodeIDGenerator.genId();
  this.info = info;
  
  if (!this.info.type)
    this.info.type = 'node';

  this.position = new Vertex(Math.random() * 10, Math.random() * 10);
  this.disp     = new Vertex(0, 0);
  this.mass     = 500.0;    
  this.added = false;
  
  this.padding = {h:6, v:8};
  
  this.tmp = {};
  this.tmp.name = "";
  
  this.active = true;
};

Node.prototype = {
  init: function(graph) {
    this.graph = graph;
    //console.log("init "+this.info.id+" ("+this.graph.area+")");
  },
  
  reinit: function() {
    this.position = new Vertex(Math.random() * 10, Math.random() * 10);
    this.disp     = new Vertex(0, 0);
    this.mass     = 500.0;    
  },
  
  get_style: function(attrname, actualType) {
    var styles = {
      node: {
        fill: "#ff7400", 
        hover: "#ff9640",
        color: "#fff",
        fontsize: 11,
        stroke: "#fff",
        strokewidth: 3
      },
      supernode: {
        fill: "#f00",
        hover: "#ff4040",
        color: "#fff",
        fontsize: 11,
        stroke: "#fff",
        strokewidth: 3
      },
      client: {
        fill: "#cd0074",
        hover: "#e6399b",
        color: "#fff",
        fontsize: 10,
        stroke: "#fff",
        strokewidth: 3
      },
      stranger: {
        fill: "#fff",
        hover: "#ccc",
        color: "#333",
        fontsize: 10,
        stroke: "#333",
        strokewidth: 1
      }
    };
    var type = (actualType ? actualType : this.info.type);
    if (this.info.name.match(/^stranger/) || this.tmp.name != "")
      type = "stranger";
    if (this.graph.small && attrname == "strokewidth")
      return 1;
    if (this.graph.small && attrname == "fontsize")
      return styles[type][attrname] - 2;
    return styles[type][attrname];
  },
  
  render: function(paper, small) {
    var actualType =
      (this.info.type == "client" && this.tmp.name.length > 0 ?
        "stranger" : 0);

    var padding = {
      v: (small ? this.padding.v - 2 : this.padding.v),
      h: (small ? this.padding.h - 2 : this.padding.h)
    };

    if (!this.visual) {
      // create the initial visual
      this.paper  = paper;
      this.visual = paper.set();

      var is_small = small && (this.info.type == 'client' || this.info.type == 'node');
    
      var name = this.info.name;
      var is_stranger = this.info.name.match(/^stranger/);

      if (!is_small) {
        if (name.length > 10)
          name = name.substr(0,4)+'...'+name.substr(name.length-4,4);

        if (is_stranger)
          name = '?';

        var title = this.paper.text(this.position.x, this.position.y, name);
        this.visual.push(title);
        
        this.visual_title = title;
      }

      var bb = (!is_small ? title.getBBox() : {x:0, y:0, width:6, height:4});
      var w = bb.width + (padding.v * 2);
      var h = bb.height + (padding.h * 2);
      var box;
      var borderradius = (this.info.type == 'client' ? h/2 : 5);
      if (is_small && this.info.type == 'client') {
        box = this.paper.circle(this.position.x, this.position.y, 5);
      } else {
        box = this.paper.rect(this.position.x - (w / 2), this.position.y - (h / 2), w, h, borderradius);
      }

      box.n = this;
      this.visual.push(box);
      
      this.visual_box = box;

      if (!is_small) {
        title.n = this;
        title.b = box;
        title.mouseover(function() {
            this.b.attr({fill: this.b.n.get_style("hover", actualType)
          });
        });
        title.mouseout(function() {
            this.b.attr({fill: this.b.n.get_style("fill", actualType)
          });
        });

        title.toFront();
      }
    }

    // set attributes of the text
    if (this.visual_title) {
      this.visual_title.attr({fill: this.get_style("color"), "font-size": this.get_style("fontsize")});
    }

    // set attributes of the box
    if (this.visual_box) {
      this.visual_box.attr({
        fill: this.get_style("fill"),
        stroke: this.get_style("stroke"),
        opacity: 1,
        "stroke-width": this.get_style("strokewidth")
      });

      // on mouse drauf Farbe aendern
      this.visual_box.mouseover(function() {
          this.attr({fill: this.n.get_style("hover", actualType)
        });
      });
      this.visual_box.mouseout(function() {
          this.attr({fill: this.n.get_style("fill", actualType)
        });
      });
    }
    
    // update text if tempName is set
    if (this.info.type == "client" && this.tmp.name.length > 0
        && this.visual_title && this.visual_box) {
      
      //console.log("updating "+this.info.name+" "+this.info.angle);
      
      // set title
      this.visual_title.attr({text: this.tmp.name});

      var bbt = this.visual_title.getBBox();
      var bbb = this.visual_box.getBBox();
      this.visual_title.translate(-bbt.x, -bbt.y);
      this.visual_box.translate(-bbb.x, -bbb.y);

      // update box size
      this.visual_box.attr({
        width: bbt.width + (padding.v * 2), 
        height: bbt.height + (padding.h * 2)}
      );
      
      //this.visual_title.translate(this., 0);
      //this.visual_box.translate(-diff, 0);
      
      this.tmp.name = "";
    }
   
    // update the position of the visual
    var bb = this.visual.getBBox();
    this.visual.translate(-bb.x + this.position.x - bb.width/2, -bb.y + this.position.y - bb.height/2);
    
    // rotate if client
    if (this.info.type == 'client') {
      // move visual so that it does not overlap local-node
      // vector from local-node to this client-node
      //var dir = this.position.diff(this.info.nodepos);
      //var diff = dir.scale(this.visual.getBBox().width / 2 - 6);
      //this.visual.translate(diff.x, diff.y);
      
      this.visual.rotate(this.info.angle, false);
    }

    // show visual on mouse-over
    this.visual.n = this;
    this.visual.mouseover(function() {
      this.n.graph.showInfo(this.n);
    });
    this.visual.mouseout(function() {
      this.n.graph.hideInfo(this.n);
    });
    
    if (this.active)
      this.visual.show();
    else
      this.visual.hide();
  
    return this.visual;
  },

  deactivate: function() {
    this.active = false;
  },

  activate: function() {
    this.active = true;
  }
};

/* ------------------------------------------------- */
/* Graph Edge class */

var Edge = function(fromNode, toNode) {
  this.fromNode = fromNode;
  this.toNode = toNode;
  this.added = false;
  this.active = true;
};

Edge.prototype = {
  render: function(paper) {
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

    if (this.active)
      this.visual.show();
    else
      this.visual.hide();
  
    return this.visual;
  },

  deactivate: function() {
    this.active = false;
  },

  activate: function() {
    this.active = true;
  },
};

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

  this.area = this.w * this.h;
  
  // create info layer
  this.infobubble = new Speechbubble(this.paper, this.w, this.h);
  this.infobubble.hide();
  
  this.maxNumDisplayedClients = 5;
  
  // the vertex used for centering the whole graph on the canvas
  this.centerVertex = new Vertex(0,0);
};

Graph.prototype = {

  calcOptimalSpringLength: function() {
    return (Math.sqrt(this.area / this.nodes.length) * 4.0);
  },

  calcInitialTemperature: function() {
    return this.w * 100.0;
  },

  /*
  rad_to_deg: function(x) {
    return (180.0 / 3.1415 * x);
  },
  */
  
  deg_to_rad: function(x) {
    return (3.1415 * x / 180.0);
  },

  showInfo: function(node) {
    // determine text to show
    var text = "";
    if (node.tmp.name != "") {
      // "x more" text...
      text = node.tmp.name+"\n"+node.info.name+"\n";
      
      // find the node this client is connected to
      var nod;
      for (var e = 0; e < this.edges.length; e++) {
        var u = this.edges[e].fromNode;
        var v = this.edges[e].toNode;
        if (u.number == node.number)
          nod = v;
        if (v.number == node.number)
          nod = u;
      }
      
      for (var e = 0; e < this.edges.length; e++) {
        var u = this.edges[e].fromNode;
        var v = this.edges[e].toNode;
        //text += 
        //  u.info.name+"("+u.number+"/"+u.info.type+"/"+u.active+")"+"/"+
        //  v.info.name+"("+v.number+"/"+v.info.type+"/"+v.active+")"+"\n";
        if ((u.number == nod.number && v.info.type == "client" && !v.active) ||
            (v.number == nod.number && u.info.type == "client" && !u.active)) {
        
          var client = (u.number == nod.number ? v : u);
          text += client.info.name+"\n";
        }
      }
    }
    else {
      // normal info for node
      text =
        //"id: "+node.info.id+"\n"+
        "type: "+node.info.type+"\n"+
        "name: "+node.info.name
    }

    this.infobubble.setText(text);
    
    var nodepos = node.position.sum(this.centerVertex);
    this.infobubble.setTargetPos(nodepos);
    
    var bb = node.visual.getBBox(); // we can be sure there is one at this point!
    if (node.info.type == 'client') {
      this.infobubble.setTargetOffset(7);    
    }
    else {
      this.infobubble.setTargetOffset(bb.width / 2 - 3);     
    }
    
    this.infobubble.show();

    // highlight connected edges
    for (var e = 0; e < this.edges.length; e++) {
      var edge = this.edges[e];
      var u = edge.fromNode;
      var v = edge.toNode;
      if (u.active && v.active && (u.number == node.number || v.number == node.number)) {
        edge.visual.attr({"stroke-width": 3});
      }
    }
  },
  
  hideInfo: function(node) {
    this.infobubble.hide();

    // un-highlight connected edges
    for (var e = 0; e < this.edges.length; e++) {
      var edge = this.edges[e];
      var u = edge.fromNode;
      var v = edge.toNode;
      if (u.active && v.active && (u.number == node.number || v.number == node.number)) {
        edge.visual.attr({"stroke-width": 1});
      }
    }
  },
  
  nodeExists: function(info) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].info.id == info.id)
        return true;
    }
    return false;
  },

  nodeNumberIsUsed: function(number) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].number == number)
        return true;
    }
    return false;
  },

  deleteEdgesAtNode: function(node) {
    for (var e = 0; e < this.edges.length; e++) {
      var from = this.edges[e].fromNode;
      var to   = this.edges[e].toNode;
      if (from.number == node.number || to.number == node.number)
        this.edges[e].deactivate();
    }
  },

  deleteNode: function(node) {
    for (var n = 0; n < this.nodes.length; n++) {
      if (this.nodes[n].number == node.number)
        this.nodes[n].deactivate();
    }
  },

  deleteClientNodesExcluding: function(online_users) {
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
  },

  getNodeById: function(id) {
    for (var n = 0; n < this.nodes.length; n++)
      if (this.nodes[n].info.id == id)
        return this.nodes[n];
    return false;
  },

  updateFromAsyncInfo: function(online_users) {
    //return true;
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
    this.processQueue();
    this.restart();
  },

  addNode: function(node) {
    if (!this.nodeExists(node.info))
      this.nodes.push(node);
    
    this.optimalSpringLength = this.calcOptimalSpringLength();
    
    node.init(this);
    return node;
  },

  addEdge: function(edge, dublicateOk) {
    if (dublicateOk || (!dublicateOk && !this.edgeExists(edge.fromNode, edge.toNode)))
      this.edges.push(edge);
  },

  edgeExists: function(fromNode, toNode) {
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
  },

  testOneNode: function() {
    this.addNode(new Node({id:1, name:"one",type:"supernode"}));
    return true;
  },

  testTwoNodes: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"two"}));
    this.addEdge(new Edge(n1, n2));
    return true;
  },

  testThreeNodes: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"stranger"}));
    var n3 = this.addNode(new Node({id:3, name:"three"}));
    this.addEdge(new Edge(n1, n2));
    this.addEdge(new Edge(n1, n3));
    return true;
  },

  testFourNodes: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"stranger"}));
    var n3 = this.addNode(new Node({id:3, name:"three"}));
    var n4 = this.addNode(new Node({id:4, name:"four"}));
    this.addEdge(new Edge(n1, n2));
    this.addEdge(new Edge(n1, n3));
    this.addEdge(new Edge(n1, n4));
    this.addEdge(new Edge(n2, n3));
    return true;
  },

  testFiveNodes: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"stranger"}));
    var n3 = this.addNode(new Node({id:3, name:"three"}));
    var n4 = this.addNode(new Node({id:4, name:"four"}));
    var n5 = this.addNode(new Node({id:5, name:"five"}));
    this.addEdge(new Edge(n1, n2));
    this.addEdge(new Edge(n1, n3));
    this.addEdge(new Edge(n1, n4));
    this.addEdge(new Edge(n2, n3));
    this.addEdge(new Edge(n2, n5));
    return true;
  },

  testSixNodes: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"stranger"}));
    var n3 = this.addNode(new Node({id:3, name:"three"}));
    var n4 = this.addNode(new Node({id:4, name:"four"}));
    var n5 = this.addNode(new Node({id:5, name:"five"}));
    var n6 = this.addNode(new Node({id:6, name:"six"}));
    this.addEdge(new Edge(n1, n2));
    this.addEdge(new Edge(n1, n3));
    this.addEdge(new Edge(n1, n4));
    this.addEdge(new Edge(n2, n3));
    this.addEdge(new Edge(n2, n5));
    this.addEdge(new Edge(n5, n6));
    return true;
  },

  // 6 nodes around a central one
  // connected in a ring and to the central one
  testComplex01: function() {
    var n1 = this.addNode(new Node({id:1, name:"one",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"stranger"}));
    var n3 = this.addNode(new Node({id:3, name:"three"}));
    var n4 = this.addNode(new Node({id:4, name:"four"}));
    var n5 = this.addNode(new Node({id:5, name:"five"}));
    var n6 = this.addNode(new Node({id:6, name:"six"}));
    var n7 = this.addNode(new Node({id:7, name:"seven"}));
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
  },

  // realistic layout...
  testComplex02: function() {
    var n1 = this.addNode(new Node({id:1, name:"team",type:'supernode'}));
    var n2 = this.addNode(new Node({id:2, name:"backup",type:'supernode'}));
    var n3 = this.addNode(new Node({id:3, name:"protonet",type:'supernode'}));
    var n4 = this.addNode(new Node({id:4, name:"local",type:'supernode'}));
    var n5 = this.addNode(new Node({id:5, name:"danopia",type:'supernode'}));
    var c1 = this.addNode(new Node({id:6, name:"dudemeister",type:"client"}));
    var c2 = this.addNode(new Node({id:7, name:"seda",type:"client"}));
    var c3 = this.addNode(new Node({id:8, name:"danopia",type:"client"}));
    var c4 = this.addNode(new Node({id:9, name:"duckinator",type:"client"}));
    var c5 = this.addNode(new Node({id:10, name:"tom",type:"client"}));
    var c6 = this.addNode(new Node({id:11, name:"fishman",type:"client"}));
    var c7 = this.addNode(new Node({id:12, name:"stranger#1",type:"client"}));
    var c8 = this.addNode(new Node({id:13, name:"stranger#2",type:"client"}));
    var c9 = this.addNode(new Node({id:14, name:"stranger#3",type:"client"}));
    // supernode connections
    this.addEdge(new Edge(n1, n2));
    this.addEdge(new Edge(n1, n3));
    this.addEdge(new Edge(n1, n4));
    this.addEdge(new Edge(n1, n5));
    // client connections
    this.addEdge(new Edge(n1, c1));
    this.addEdge(new Edge(n1, c2));
    this.addEdge(new Edge(n1, c3));
    this.addEdge(new Edge(n1, c4));
    this.addEdge(new Edge(n1, c5));
    this.addEdge(new Edge(n1, c6));
    this.addEdge(new Edge(n1, c7));
    this.addEdge(new Edge(n1, c8));
    this.addEdge(new Edge(n1, c9));
    return true;
  },

  initFromNetworksInfo: function(networks) {

    //return this.testOneNode();
    //return this.testTwoNodes();
    //return this.testThreeNodes();
    //return this.testFourNodes();
    //return this.testFiveNodes();
    //return this.testSixNodes();
    //return this.testComplex01();
    return this.testComplex02();
  
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
      var j = 0;// TODO: use a complete map
      //for (var j = 0; j < nodes.length; j++) {
        this.addEdge(new Edge(nodes[i], nodes[j]), false);
      //}
    }
  },

  log: function() {
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
  },

  cool: function() {
    this.temperature = this.temperature - 0.5; /* linear */
  },

  min: function(v) {
    return v.len() * this.temperature / 100000.0;
  },

  force_attract: function(x) {
    return (x * x) / this.optimalSpringLength;
  },

  force_repulse: function(x) {
    return (this.optimalSpringLength * this.optimalSpringLength) / x;
  },

  numConnectedClients: function(node) {
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
  },

  layout: function() {
    //this.log();
    if (!this.temperature)
      this.temperature = this.calcInitialTemperature();
    if (!this.optimalSpringLength)
      this.optimalSpringLength = this.calcOptimalSpringLength();

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
          node.position.x = this.w / 2 + Math.sin(this.deg_to_rad(45 + angle * count)) * radius;
          node.position.y = this.h / 2 + Math.cos(this.deg_to_rad(45 + angle * count)) * radius;       
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
              //var mass = node.mass / ((this.numConnectedClients(node) + 1) * 1.5);
              var mass = node.mass;
    
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
          
          if (this.numConnectedClients(u) > 0 || this.numConnectedClients(v) > 0)
            d /= 6;

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

          var optLen = this.calcOptimalSpringLength() / 3.0;
          
          node.disp = 
            node.disp.scale(
                node.disp.len() > optLen ? optLen : node.disp.len());
        
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
  },

  set_node_active: function(node, status) {
    node.active = status;
    for (var e = 0; e < this.edges.length; e++) {
      var edge = this.edges[e];
      if (edge.fromNode.number == node.number ||
          edge.toNode.number == node.number)
        edge.active = status;     
    }
    
  },
  
  log_tmp_names: function() {
    var names =  new Array();
    for (var n = 0; n < this.nodes.length; n++) {
      if (this.nodes[n].tmp.name != "")
        names.push(this.nodes[n].info.name+":"+this.nodes[n].tmp.name);
      else
        names.push("");
    }
    console.log(names);    
  },

  layout_clients: function() {
    // layout client nodes circular around each node
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      if (node.info.type != 'client' && node.active) {
        // find client node connected to this one
        var clients = new Array();
        var clientsInactive = new Array();
        for (var e = 0; e < this.edges.length; e++) {
          var edge = this.edges[e];
          var u = edge.fromNode;
          var v = edge.toNode;
          //if (u.active && v.active) {
            if ((u.number == node.number && v.info.type == 'client') ||
                (v.number == node.number && u.info.type == 'client')) {
              
              var nodeToPush = (u.number == node.number ? v : u);
              if (clients.length < this.maxNumDisplayedClients) {
                clients.push(nodeToPush);
              } else {
                clientsInactive.push(nodeToPush);
              }
            }
          //}
        }

        // position clients circular around node
        if (clients.length > 0) {
          var radius = (this.small ? 20.0 : 30.0) + 25; // + (clients.length * (this.small ? 4.0 : 5.0));
          var angle  = 360.0 / clients.length;
          for (var c = 0; c < clients.length; c++) {
            var client = clients[c];
            this.layout_client(client, node, clients.length, c, angle, radius);
            // activate node and connected edges
            this.set_node_active(client, true);
          }
          for (var c = 0; c < clientsInactive.length; c++) {
            var client = clientsInactive[c];
            this.layout_client(client, node, clientsInactive.length, c, 0, 10);
            // deactivate node and connected edges
            this.set_node_active(client, false);
          }
          
          for (var n = 0; n < clients.length; n++) {
            clients[n].tmp.name = '';
            //console.log("clearing temp name of "+clients[n].info.name);
          }          
          // set temp name of last displayed client node to "x more..."
          //console.log(clients.length+" / "+this.maxNumDisplayedClients+" / "+clientsInactive.length);
          if (clients.length == this.maxNumDisplayedClients && clientsInactive.length > 0) {
            var client = clients[this.maxNumDisplayedClients - 1];
            client.tmp.name = '#'+(clientsInactive.length+1)+' more...';
          }
        }
      }
    }  

    //this.log_tmp_names();
  },
  
  layout_client: function(client, node, total, num, angle, radius) {
    client.info.angle = (num > Math.floor(total / 2) ? 270 : 90) - angle * num;
    client.position.x = node.position.x + Math.sin(this.deg_to_rad(angle * num)) * radius;
    client.position.y = node.position.y + Math.cos(this.deg_to_rad(angle * num)) * radius;
    client.info.nodepos = node.position;    
  },

  render_graph: function() {
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
    this.centerVertex = new Vertex( -bb.x + (this.w - bb.width) / 2.0, -bb.y + (this.h - bb.height) / 2.0 );
    this.visual.translate(this.centerVertex.x, this.centerVertex.y);    
  },

  processQueue: function() {
    for (var q = 0; q < this.queue.length / 2; q++) {
    //if (this.queue.length) {
      var node = this.queue.shift();
      this.addNode(node);
    
      var edge = this.queue.shift();
      this.addEdge(edge, false);
      //this.restart();
    }
    //this.restart();
  },

  // should be called within a setInterval() code string
  render_iterative: function() {
    this.processQueue();

    if (this.iters > this.maxIterations)
      return false;
    this.iters++;

    if (this.layout())
      this.render_graph();
  },

  render: function() {
    while (this.iters < this.maxIterations) {
      //console.log("i: "+this.iters);
      this.layout();
      this.iters++;
    }
    this.render_graph();
  },

  restart: function() {
    this.temperature = this.calcInitialTemperature();
    this.iters = 0;
    this.render();
  },

  retry: function() {
    // place nodes at random positions
    for (var n = 0; n < this.nodes.length; n++) {
      this.nodes[n].reinit();
    }
    this.restart();
  }
};
