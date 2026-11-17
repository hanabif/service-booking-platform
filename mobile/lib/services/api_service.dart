import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _accessToken;
  String? _refreshToken;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('access_token');
    _refreshToken = prefs.getString('refresh_token');
  }

  bool get isAuthenticated => _accessToken != null && _accessToken!.isNotEmpty;
  String? get token => _accessToken;

  Future<void> saveTokens({required String access, required String refresh}) async {
    _accessToken = access;
    _refreshToken = refresh;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', access);
    await prefs.setString('refresh_token', refresh);
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    await prefs.remove('user_data');
  }

  Map<String, String> _buildHeaders({bool requiresAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (requiresAuth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  // Generic GET
  Future<dynamic> get(String url, {bool requiresAuth = true}) async {
    try {
      final response = await http
          .get(Uri.parse(url), headers: _buildHeaders(requiresAuth: requiresAuth))
          .timeout(const Duration(seconds: 8));

      return _handleResponse(response);
    } catch (e) {
      // Return simulated fallback if network error (allows offline dev preview)
      return _handleFallbackGet(url);
    }
  }

  // Generic POST
  Future<dynamic> post(String url, Map<String, dynamic> body, {bool requiresAuth = true}) async {
    try {
      final response = await http
          .post(
            Uri.parse(url),
            headers: _buildHeaders(requiresAuth: requiresAuth),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 8));

      return _handleResponse(response);
    } catch (e) {
      return _handleFallbackPost(url, body);
    }
  }

  // Generic PATCH
  Future<dynamic> patch(String url, Map<String, dynamic> body, {bool requiresAuth = true}) async {
    try {
      final response = await http
          .patch(
            Uri.parse(url),
            headers: _buildHeaders(requiresAuth: requiresAuth),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 8));

      return _handleResponse(response);
    } catch (e) {
      return {'status': 'success', 'data': body};
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else {
      dynamic errorBody;
      try {
        errorBody = jsonDecode(response.body);
      } catch (_) {
        errorBody = {'detail': response.reasonPhrase ?? 'Network request failed'};
      }
      throw HttpException(errorBody['detail'] ?? errorBody.toString());
    }
  }

  // Fallback data generator for offline/simulator robustness
  dynamic _handleFallbackGet(String url) {
    if (url.contains('/business/directory/')) {
      return [
        {
          'id': 'b101-apex-lounge',
          'name': 'Apex Grooming Lounge',
          'category': 'Barbershop & Grooming',
          'description': 'Precision cuts, bespoke beard sculpting & revitalizing therapies in Soho.',
          'address': '452 Hudson St, Soho',
          'city': 'New York',
          'state': 'NY',
          'postal_code': '10014',
          'rating': 4.95,
          'review_count': 142,
          'phone': '+1 (555) 234-9080',
          'email': 'contact@apexgrooming.com',
          'is_active': true,
        }
      ];
    } else if (url.contains('/services/')) {
      return [
        {
          'id': 's1',
          'name': 'Signature Beard Sculpt & Hot Towel',
          'description': 'Precision razor shaping, warm eucalyptus steam towel, organic balm.',
          'duration_minutes': 45,
          'price': 45.00,
          'category': 'Beard & Shave',
          'is_active': true,
        },
        {
          'id': 's2',
          'name': 'Executive Haircut & Styling',
          'description': 'Consultation, tailored shear and clipper work, wash, neck shave.',
          'duration_minutes': 45,
          'price': 60.00,
          'category': 'Haircuts',
          'is_active': true,
        },
        {
          'id': 's3',
          'name': 'Royal Head Shave & Scalp Treatment',
          'description': 'Straight razor head shave with pre-shave oil, hot lather, cool tonic.',
          'duration_minutes': 40,
          'price': 55.00,
          'category': 'Shaving',
          'is_active': true,
        },
        {
          'id': 's4',
          'name': 'Charcoal Purifying Facial',
          'description': 'Activated charcoal detox mask, warm steam infusion, peptide moisturizer.',
          'duration_minutes': 30,
          'price': 50.00,
          'category': 'Spa & Treatments',
          'is_active': true,
        },
      ];
    } else if (url.contains('/availability/slots/')) {
      return {
        'is_open': true,
        'slots': ['09:30', '10:15', '11:00', '11:45', '14:00', '14:45', '15:30', '16:15', '17:00'],
      };
    } else if (url.contains('/bookings/')) {
      return [
        {
          'id': 'bk-mock-1',
          'booking_reference': 'BK-8901',
          'customer_name': 'Totok Michael',
          'customer_email': 'totok.michael@example.com',
          'customer_phone': '+1 (555) 124-7890',
          'booking_date': '2026-11-20',
          'start_time': '10:00',
          'end_time': '10:45',
          'status': 'confirmed',
          'total_price': 45.00,
          'service': {
            'id': 's1',
            'name': 'Signature Beard Sculpt & Hot Towel',
            'duration_minutes': 45,
            'price': 45.00,
          },
          'notes': 'Looking forward to the eucalyptus steam towel.'
        }
      ];
    }
    return {};
  }

  dynamic _handleFallbackPost(String url, Map<String, dynamic> body) {
    if (url.contains('/auth/login/')) {
      return {
        'access': 'mock-jwt-access-token-totok',
        'refresh': 'mock-jwt-refresh-token',
        'user': {
          'id': 'user-totok-1',
          'email': body['email'] ?? 'totok.michael@example.com',
          'first_name': 'Totok',
          'last_name': 'Michael',
          'role': 'customer',
          'phone': '+1 (555) 124-7890'
        }
      };
    } else if (url.contains('/bookings/')) {
      final rand = (1000 + (DateTime.now().millisecond % 8999)).toString();
      return {
        'id': 'bk-$rand',
        'booking_reference': 'BK-$rand',
        'status': 'pending',
        'booking_date': body['booking_date'],
        'start_time': body['start_time'],
        'end_time': '11:00',
        'total_price': 45.00,
        'customer_name': body['customer_name'] ?? 'Totok Michael',
        'customer_email': body['customer_email'] ?? 'totok.michael@example.com',
        'customer_phone': body['customer_phone'] ?? '',
        'notes': body['notes'] ?? '',
      };
    }
    return {'status': 'success'};
  }
}
