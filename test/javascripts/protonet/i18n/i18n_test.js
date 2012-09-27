module("protonet.i18n", {
  setup: function() {
    $.extend(protonet.i18n, {
      label_save: "Save",
      test: {
        welcome_user: "Hello %{name}, you are from %{country}",
        messages: {
          one: "There is %{count} message",
          other: "There are %{count} messages",
          zero: "No messages"
        }
      },
      files: {
        one: "%{count} file uploaded",
        other: "%{count} files uploaded"
      }
    });
  }
});

test("Basic", function() {
  equal(protonet.t("label_save"), "Save");
  equal(protonet.t("test.welcome_user", { name: "Hans", country: "Norway" }), "Hello Hans, you are from Norway");
  equal(protonet.t("foo"), "foo");
  equal(protonet.t("foo.foo"), "foo");
});

test("Pluralization", function() {
  equal(protonet.t("files", { count: 1 }), "1 file uploaded");
  equal(protonet.t("files", { count: 0 }), "0 files uploaded");
  equal(protonet.t("files", { count: 100 }), "100 files uploaded");
  equal(protonet.t("test.messages", { count: 1 }), "There is 1 message");
  equal(protonet.t("test.messages", { count: 2 }), "There are 2 messages");
  equal(protonet.t("test.messages", { count: 0 }), "No messages");
});