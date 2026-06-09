import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_config.dart';

class ApiService {
  static const _storage = FlutterSecureStorage();

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  static void init() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          return handler.next(error);
        },
      ),
    );
  }

  static Future<Response> post(String path, Map<String, dynamic> data) async {
    return _dio.post(path, data: data);
  }

  static Future<Response> get(
    String path, {
    Map<String, dynamic>? params,
  }) async {
    return _dio.get(path, queryParameters: params);
  }

  static Future<Response> delete(String path) async {
    return _dio.delete(path);
  }
}
