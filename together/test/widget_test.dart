import 'package:flutter_test/flutter_test.dart';
import 'package:together/features/chat/models/message_model.dart';

void main() {
  test('MessageModel parses the backend schema', () {
    final message = MessageModel.fromJson({
      '_id': 'message-1',
      'conversationId': 'conversation-1',
      'senderId': {
        '_id': 'user-1',
        'username': 'alice',
        'avatar': 'https://example.com/avatar.png',
      },
      'content': 'Hello',
      'type': 'text',
      'status': 'read',
      'createdAt': '2026-06-09T10:00:00.000Z',
      'deletedForEveryone': false,
    });

    expect(message.id, 'message-1');
    expect(message.conversationId, 'conversation-1');
    expect(message.senderId, 'user-1');
    expect(message.senderUsername, 'alice');
    expect(message.content, 'Hello');
    expect(message.status, 'read');
    expect(message.isDeleted, isFalse);
  });
}
