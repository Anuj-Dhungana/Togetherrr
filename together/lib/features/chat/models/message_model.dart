class MessageModel {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderUsername;
  final String? senderAvatar;
  final String content;
  final String type;
  final String status;
  final DateTime createdAt;
  final bool isDeleted;

  MessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderUsername,
    this.senderAvatar,
    required this.content,
    this.type = 'text',
    this.status = 'sent',
    required this.createdAt,
    this.isDeleted = false,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final sender = json['senderId'];
    return MessageModel(
      id: json['_id'] ?? '',
      conversationId: json['conversationId'] ?? '',
      senderId: sender is Map ? sender['_id'] ?? '' : sender ?? '',
      senderUsername: sender is Map ? sender['username'] ?? '' : '',
      senderAvatar: sender is Map ? sender['avatar'] : null,
      content: json['content'] ?? '',
      type: json['type'] ?? 'text',
      status: json['status'] ?? 'sent',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      isDeleted: json['deletedForEveryone'] ?? false,
    );
  }
}
