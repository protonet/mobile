module("protonet.events.Emitter", {
  setup: function() {
    this.emitter = new protonet.events.Emitter();
  }
});

test("Attach, trigger and detach event", function() {
  expect(2);
  
  this.emitter.on("foo.bar", function() {
    ok(true, "foo.bar #1");
  });
  
  this.emitter.on("foo.bar", function() {
    ok(true, "foo.bar #2");
  });
  
  this.emitter.trigger("foo.bar");
  this.emitter.off("foo.bar");
  this.emitter.trigger("foo.bar");
});

test("Attach, trigger and detach event (with function reference)", function() {
  expect(2);
  
  var handler = function() {
    ok(true);
  };
  
  this.emitter.on("fooz", handler);
  
  this.emitter.trigger("fooz");
  this.emitter.off("fooz", function() {});
  this.emitter.trigger("fooz");
  
  this.emitter.off("fooz", handler);
  this.emitter.trigger("fooz");
});

test("one()", function() {
  expect(1);
  
  this.emitter.one("do123", function() {
    ok(true);
  });
  
  this.emitter.trigger("do123");
  this.emitter.trigger("do123");
});

test("Pass parameters", function() {
  expect(2);
  
  var arr = [{ spongebob: "krusty crab" }];
  
  this.emitter.on("do123", function(a, b) {
    equal(a, 1);
    equal(b, arr);
  });
  
  this.emitter.trigger("do123", 1, arr);
});