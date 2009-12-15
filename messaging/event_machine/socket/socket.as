
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
    /*
     * Fix for ExternalInterface Error When Parameters Contain Special Characters (stupid Adobe)
     * http://www.digitalmachina.com/archives/2009/03/11/externalinterface-error-when-parameters-contain-special-characters/
     */
/*    data = data.split("\n").join("\\n");
    data = data.split("\r").join("\\r");*/
    data = data.split("\\").join("\\\\");
    ExternalInterface.call("Dispatcher.messageReceived", data );
  }
  
  static function onConnect(status:Boolean) {
    ExternalInterface.call("Dispatcher.socketConnectCallback", status );
  }
  
  static function connectSocket(ip:String) {
    socket.connect(ip, 5000);
  }
  
  static function closeSocket() {
    socket.close();
  }

  static function main() {
    
    socket = new XMLSocket();
    socket.onData = onReceive;
    socket.onConnect = onConnect;
    
    ExternalInterface.addCallback("test", null, test);
    ExternalInterface.addCallback("sendData", null, sendData);
    ExternalInterface.addCallback("connectSocket", null, connectSocket);
    ExternalInterface.addCallback("closeSocket", null, closeSocket);
    
    ExternalInterface.call("Dispatcher.socketReadyCallback");
    

    
  }
}
