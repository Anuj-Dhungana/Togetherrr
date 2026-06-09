import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/chat_model.dart';
import '../models/message_model.dart';

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref);
});

class ChatState {
  final List<ChatModel> conversations;
  final List<MessageModel> currentMessages;
  final bool isLoading;
  final String? error;

  ChatState({
    this.conversations = const [],
    this.currentMessages = const [],
    this.isLoading = false,
    this.error,
  });

  ChatState copyWith({
    List<ChatModel>? conversations,
    List<MessageModel>? currentMessages,
    bool? isLoading,
    String? error,
  }) {
    return ChatState(
      conversations: conversations ?? this.conversations,
      currentMessages: currentMessages ?? this.currentMessages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final Ref ref;

  ChatNotifier(this.ref) : super(ChatState());

  Future<void> loadConversations() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await ApiService.get('/conversations');
      final data = response.data['conversations'] as List;
      final currentUserId = ref.read(authProvider).user?.id ?? '';
      final conversations = data
          .map(
            (conversation) => ChatModel.fromJson(
              Map<String, dynamic>.from(conversation as Map),
              currentUserId,
            ),
          )
          .toList();

      state = state.copyWith(conversations: conversations, isLoading: false);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<List<dynamic>> searchUsers(String query) async {
    final response = await ApiService.get('/auth/search', params: {'q': query});
    return response.data['users'] as List<dynamic>;
  }

  Future<ChatModel?> createDirectConversation(String otherUserId) async {
    try {
      final response = await ApiService.post('/conversations/direct', {
        'otherUserId': otherUserId,
      });
      final currentUserId = ref.read(authProvider).user?.id ?? '';
      final conversation = ChatModel.fromJson(
        Map<String, dynamic>.from(response.data['conversation'] as Map),
        currentUserId,
      );
      await loadConversations();
      return conversation;
    } catch (error) {
      debugPrint('Create conversation error: $error');
      return null;
    }
  }

  Future<void> loadMessages(String conversationId) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await ApiService.get('/messages/$conversationId');
      final data = response.data['messages'] as List;
      final messages = data
          .map(
            (message) => MessageModel.fromJson(
              Map<String, dynamic>.from(message as Map),
            ),
          )
          .toList();

      state = state.copyWith(currentMessages: messages, isLoading: false);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> sendMessage(String conversationId, String content) async {
    try {
      final response = await ApiService.post('/messages', {
        'conversationId': conversationId,
        'content': content,
        'type': 'text',
      });
      final message = MessageModel.fromJson(
        Map<String, dynamic>.from(response.data['message'] as Map),
      );

      state = state.copyWith(
        currentMessages: [...state.currentMessages, message],
      );
    } catch (error) {
      state = state.copyWith(error: error.toString());
    }
  }
}
