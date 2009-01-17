
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
  
  static function onConnect(status:Boolean) {
    ExternalInterface.call("Dispatcher.socketConnectCallback", status );
  }
  
  static function connectSocket(ip:String) {
    socket.connect(ip, 5000);
  }

  static function main() {
    
    socket = new XMLSocket();
    socket.onData = onReceive;
    socket.onConnect = onConnect;
    
    ExternalInterface.addCallback("test", null, test);
    ExternalInterface.addCallback("sendData", null, sendData);
    ExternalInterface.addCallback("connectSocket", null, connectSocket);
    
  }
}
