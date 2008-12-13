import flash.external.ExternalInterface;
class Foo {
  static var socket:XMLSocket;

  static function test(data:String) {
    ExternalInterface.call("Dispatcher.test", data);
  }

  static function sendData(data:String) {
    ExternalInterface.call("Dispatcher.sentCallback", socket.send(unescape(data)) );
  }

  static function onReceive(data:String) {
    ExternalInterface.call("Dispatcher.messageReceived", data );
  }

  static function main() {
    
    socket = new XMLSocket();

    socket.onData = onReceive;
    

    ExternalInterface.addCallback("test", null, test);
    ExternalInterface.addCallback("socket_send", null, sendData);
    
    ExternalInterface.call("Dispatcher.socketConnectCallback", socket.connect('localhost', 5000));

  }
}
