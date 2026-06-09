class UserModel {
  final String id;
  final String username;
  final String email;
  final String? avatar;
  final bool isOnline;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.avatar,
    this.isOnline = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      avatar: json['avatar'],
      isOnline: json['isOnline'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'email': email,
    'avatar': avatar,
    'isOnline': isOnline,
  };
}
