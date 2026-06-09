import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/socket_service.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;

  AuthState({this.status = AuthStatus.initial, this.user, this.error});

  AuthState copyWith({AuthStatus? status, UserModel? user, String? error}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  static const _storage = FlutterSecureStorage();

  AuthNotifier() : super(AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final response = await ApiService.get('/auth/me');
      final user = UserModel.fromJson(response.data['user']);
      state = state.copyWith(status: AuthStatus.authenticated, user: user);
      await SocketService.init();
      SocketService.connect();
    } catch (e) {
      await _storage.delete(key: 'token');
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> register(String username, String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await ApiService.post('/auth/register', {
        'username': username,
        'email': email,
        'password': password,
      });
      final data = response.data;
      await _storage.write(key: 'token', value: data['token']);
      await SocketService.init();
      SocketService.connect();
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: UserModel.fromJson(data['user']),
      );
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, error: e.toString());
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      final data = response.data;
      await _storage.write(key: 'token', value: data['token']);
      await SocketService.init();
      SocketService.connect();

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: UserModel.fromJson(data['user']),
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        error: 'Invalid email or password',
      );
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    SocketService.disconnect();
    state = AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
