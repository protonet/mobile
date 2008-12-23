import flash.external.ExternalInterface;
class Socket {
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
  
  static function connectSocket() {
    ExternalInterface.call("Dispatcher.socketConnectCallback", socket.connect('localhost', 5000));
  }

  static function main() {
    
    socket = new XMLSocket();
    socket.onData = onReceive;
    
    ExternalInterface.addCallback("test", null, test);
    ExternalInterface.addCallback("sendData", null, sendData);
    ExternalInterface.addCallback("connectSocket", null, connectSocket);
    
  }
}
