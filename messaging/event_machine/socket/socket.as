import flash.external.ExternalInterface;
class Foo {
  static var socket:XMLSocket;

  static function test(data:String) {
    ExternalInterface.call("console.log", data);
  }

  static function sendData(data:String) {
    ExternalInterface.call( "console.log", socket.send(unescape(data)) );
  }

  static function onReceive(data:String) {
    ExternalInterface.call( "console.log", data );
  }

  static function main() {
    
    socket = new XMLSocket();

    socket.onData = onReceive;
    

    ExternalInterface.addCallback("test", null, test);
    ExternalInterface.addCallback("socket_send", null, sendData);
    
    ExternalInterface.call("console.log", socket.connect('localhost', 8080));
    
    socket.send('foobar');

  }
}
