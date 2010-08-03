
import flash.external.ExternalInterface;
class Socket {
  static var socket:XMLSocket;

  static function test(data:String) {
    ExternalInterface.call("protonet.globals.dispatcher.test", data);
  }

  static function sendData(data:String) {
    socket.send(unescape(data));
  }

  static function onReceive(data:String) {
    /*
     * Fix for ExternalInterface Error When Parameters Contain Special Characters (stupid Adobe)
     * http://www.digitalmachina.com/archives/2009/03/11/externalinterface-error-when-parameters-contain-special-characters/
     */
    data = data.split("\\").join("\\\\");
    ExternalInterface.call("protonet.Notifications.trigger", "socket.receive", data);
  }
  
  static function onConnect(status:Boolean) {
    ExternalInterface.call("protonet.Notifications.trigger", "socket.connected", status);
  }
  
  static function connectSocket(ip:String, port:Number) {
    socket.connect(ip, port);
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
    
    ExternalInterface.call("protonet.Notifications.trigger", "socket.initialized");
  }
}
