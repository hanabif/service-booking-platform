class ApiConstants {
  // Default to Android Emulator loopback. Can be overridden in runtime or settings.
  static String baseUrl = 'http://10.0.2.2:8000/api';

  // Alternative local dev addresses:
  static const String localHostUrl = 'http://127.0.0.1:8000/api';
  static const String physicalDeviceUrl = 'http://192.168.1.100:8000/api';

  // Auth Endpoints
  static String get login => '$baseUrl/auth/login/';
  static String get register => '$baseUrl/auth/register/';
  static String get refreshToken => '$baseUrl/auth/token/refresh/';

  // Business Endpoints
  static String get businessDirectory => '$baseUrl/business/directory/';
  static String businessDetail(String id) => '$baseUrl/business/directory/$id/';

  // Services
  static String get services => '$baseUrl/services/';

  // Availability & Slots
  static String get availabilitySlots => '$baseUrl/availability/slots/';

  // Bookings
  static String get bookings => '$baseUrl/bookings/';
  static String bookingDetail(String id) => '$baseUrl/bookings/$id/';
  static String cancelBooking(String id) => '$baseUrl/bookings/$id/status/';

  // Reviews
  static String get reviews => '$baseUrl/reviews/';
}
