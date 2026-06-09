class ChatModel {
  final String id;
  final String name;
  final String? avatarUrl;
  final String lastMessage;
  final DateTime lastMessageTime;
  final bool isGroup;

  ChatModel({
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.lastMessage,
    required this.lastMessageTime,
    this.isGroup = false,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json, String currentUserId) {
    String name = json['groupName'] ?? 'Unknown';
    if (json['type'] == 'direct' && json['participants'] != null) {
      final participants = json['participants'] as List;
      if (participants.isNotEmpty) {
        final other = participants.firstWhere(
          (participant) => participant['_id'] != currentUserId,
          orElse: () => participants[0],
        );
        name = other['username'] ?? 'Unknown';
      }
    }

    return ChatModel(
      id: json['_id'] ?? '',
      name: name,
      avatarUrl: json['groupAvatarUrl'],
      lastMessage: json['lastMessage']?['content'] ?? 'No messages yet',
      lastMessageTime: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      isGroup: json['type'] == 'group',
    );
  }
}
