import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _apiService.isAuthenticated && _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    await _apiService.init();

    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_data');
    if (userJson != null) {
      try {
        _currentUser = UserModel.fromJson(jsonDecode(userJson));
      } catch (_) {}
    } else if (_apiService.isAuthenticated) {
      // Default to Totok Michael demo customer if token exists
      _currentUser = UserModel(
        id: 'user-totok-1',
        email: 'totok.michael@example.com',
        firstName: 'Totok',
        lastName: 'Michael',
        role: 'customer',
        phone: '+1 (555) 124-7890',
      );
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiService.post(
        ApiConstants.login,
        {'email': email.trim(), 'password': password},
        requiresAuth: false,
      );

      if (res['access'] != null) {
        await _apiService.saveTokens(
          access: res['access'],
          refresh: res['refresh'] ?? '',
        );

        if (res['user'] != null) {
          _currentUser = UserModel.fromJson(res['user']);
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_data', jsonEncode(res['user']));
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = res['detail'] ?? 'Login failed. Please check credentials.';
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '').replaceAll('HttpException: ', '');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiService.post(
        ApiConstants.register,
        {
          'email': email.trim(),
          'password': password,
          'first_name': firstName.trim(),
          'last_name': lastName.trim(),
          'phone': phone.trim(),
          'role': 'customer',
        },
        requiresAuth: false,
      );

      if (res['tokens'] != null && res['tokens']['access'] != null) {
        await _apiService.saveTokens(
          access: res['tokens']['access'],
          refresh: res['tokens']['refresh'] ?? '',
        );

        if (res['user'] != null) {
          _currentUser = UserModel.fromJson(res['user']);
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_data', jsonEncode(res['user']));
        }

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '').replaceAll('HttpException: ', '');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    _currentUser = null;
    await _apiService.clearTokens();
    notifyListeners();
  }
}
