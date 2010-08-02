//= require "lib/raphael-min.js"
//= require "lib/jquery-ui-1.7.2.custom.min.js"

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
