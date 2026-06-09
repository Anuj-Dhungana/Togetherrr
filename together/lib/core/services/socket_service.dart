import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/app_config.dart';

class SocketService {
  static const _storage = FlutterSecureStorage();
  static io.Socket? _socket;

  static io.Socket? get socket => _socket;

  static Future<void> init() async {
    final token = await _storage.read(key: 'token');

    _socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );
  }

  static void connect() {
    _socket?.connect();
    _socket?.onConnect((_) => debugPrint('Socket connected'));
    _socket?.onDisconnect((_) => debugPrint('Socket disconnected'));
    _socket?.onError((error) => debugPrint('Socket error: $error'));
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  static void joinRoom(String conversationId) {
    _socket?.emit('room:join', conversationId);
  }

  static void leaveRoom(String conversationId) {
    _socket?.emit('room:leave', conversationId);
  }

  static void sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
  }) {
    _socket?.emit('message:send', {
      'conversationId': conversationId,
      'content': content,
      'type': type,
    });
  }

  static void startTyping(String conversationId) {
    _socket?.emit('typing:start', {'conversationId': conversationId});
  }

  static void stopTyping(String conversationId) {
    _socket?.emit('typing:stop', {'conversationId': conversationId});
  }

  static void onNewMessage(Function(dynamic) callback) {
    _socket?.on('message:new', callback);
  }

  static void onTypingIndicator(Function(dynamic) callback) {
    _socket?.on('typing:indicator', callback);
  }

  static void onUserOnline(Function(dynamic) callback) {
    _socket?.on('user:online', callback);
  }

  static void onUserOffline(Function(dynamic) callback) {
    _socket?.on('user:offline', callback);
  }

  static void off(String event) {
    _socket?.off(event);
  }
}
