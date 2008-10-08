import flash.external.ExternalInterface;
class Foo {
  static var socket:XMLSocket;
  static function main() {
    socket = new XMLSocket();
    socket.onData = function (data) {
      ExternalInterface.call("console.log", data)
    }
    ExternalInterface.addCallback("socket_send", null, socket.send);
    socket.connect('http://localhost', 8080);

  }
}
