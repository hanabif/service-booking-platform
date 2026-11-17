import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/api_constants.dart';
import '../models/business_model.dart';
import '../models/service_model.dart';
import '../models/booking_model.dart';
import '../models/review_model.dart';
import 'api_service.dart';

class BookingProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // Business Directory
  List<BusinessModel> _businesses = [];
  BusinessModel? _selectedBusiness;
  bool _isLoadingBusinesses = false;

  // Services
  List<ServiceModel> _services = [];
  ServiceModel? _selectedService;
  bool _isLoadingServices = false;

  // Availability / Slots
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  List<String> _availableSlots = [];
  String? _selectedSlot;
  bool _isLoadingSlots = false;

  // Customer Bookings
  List<BookingModel> _myBookings = [];
  bool _isLoadingBookings = false;
  BookingModel? _latestConfirmedBooking;

  // Reviews
  List<ReviewModel> _reviews = [];

  // Getters
  List<BusinessModel> get businesses => _businesses;
  BusinessModel? get selectedBusiness => _selectedBusiness;
  bool get isLoadingBusinesses => _isLoadingBusinesses;

  List<ServiceModel> get services => _services;
  ServiceModel? get selectedService => _selectedService;
  bool get isLoadingServices => _isLoadingServices;

  DateTime get selectedDate => _selectedDate;
  List<String> get availableSlots => _availableSlots;
  String? get selectedSlot => _selectedSlot;
  bool get isLoadingSlots => _isLoadingSlots;

  List<BookingModel> get myBookings => _myBookings;
  bool get isLoadingBookings => _isLoadingBookings;
  BookingModel? get latestConfirmedBooking => _latestConfirmedBooking;
  List<ReviewModel> get reviews => _reviews;

  List<BookingModel> get upcomingBookings =>
      _myBookings.where((b) => b.isUpcoming).toList();

  List<BookingModel> get pastBookings =>
      _myBookings.where((b) => b.isCompleted || b.isCancelled).toList();

  // Fetch Businesses
  Future<void> fetchBusinesses() async {
    _isLoadingBusinesses = true;
    notifyListeners();

    try {
      final res = await _apiService.get(ApiConstants.businessDirectory, requiresAuth: false);
      final list = (res is List ? res : res['results'] ?? []) as List;
      _businesses = list.map((item) => BusinessModel.fromJson(item)).toList();
      if (_businesses.isNotEmpty && _selectedBusiness == null) {
        _selectedBusiness = _businesses.first;
      }
    } catch (_) {}

    _isLoadingBusinesses = false;
    notifyListeners();
  }

  void selectBusiness(BusinessModel business) {
    _selectedBusiness = business;
    _services.clear();
    _selectedService = null;
    notifyListeners();
    fetchServicesForBusiness(business.id);
    fetchReviewsForBusiness(business.id);
  }

  // Fetch Services
  Future<void> fetchServicesForBusiness(String businessId) async {
    _isLoadingServices = true;
    notifyListeners();

    try {
      final url = '${ApiConstants.services}?business_id=$businessId';
      final res = await _apiService.get(url, requiresAuth: false);
      final list = (res is List ? res : res['results'] ?? []) as List;
      _services = list.map((item) => ServiceModel.fromJson(item)).toList();
      if (_services.isNotEmpty) {
        _selectedService = _services.first;
      }
    } catch (_) {}

    _isLoadingServices = false;
    notifyListeners();
  }

  void selectService(ServiceModel service) {
    _selectedService = service;
    notifyListeners();
    fetchSlotsForDate(_selectedDate);
  }

  // Fetch Slots
  void setDate(DateTime date) {
    _selectedDate = date;
    _selectedSlot = null;
    notifyListeners();
    fetchSlotsForDate(date);
  }

  void selectSlot(String slot) {
    _selectedSlot = slot;
    notifyListeners();
  }

  Future<void> fetchSlotsForDate(DateTime date) async {
    if (_selectedBusiness == null) return;
    _isLoadingSlots = true;
    notifyListeners();

    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    final url = '${ApiConstants.availabilitySlots}?business_id=${_selectedBusiness!.id}&date=$dateStr';

    try {
      final res = await _apiService.get(url, requiresAuth: false);
      if (res['slots'] is List) {
        _availableSlots = List<String>.from(res['slots']);
      } else {
        _availableSlots = [];
      }
      if (_availableSlots.isNotEmpty) {
        _selectedSlot = _availableSlots.first;
      } else {
        _selectedSlot = null;
      }
    } catch (_) {
      _availableSlots = ['09:30', '10:15', '11:00', '11:45', '14:00', '14:45', '15:30', '16:15'];
      _selectedSlot = _availableSlots.first;
    }

    _isLoadingSlots = false;
    notifyListeners();
  }

  // Create Booking
  Future<BookingModel?> createBooking({
    required String customerName,
    required String customerEmail,
    required String customerPhone,
    String notes = '',
  }) async {
    if (_selectedBusiness == null || _selectedService == null || _selectedSlot == null) {
      return null;
    }

    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);

    final payload = {
      'business': _selectedBusiness!.id,
      'service_id': _selectedService!.id,
      'booking_date': dateStr,
      'start_time': _selectedSlot,
      'customer_name': customerName,
      'customer_email': customerEmail,
      'customer_phone': customerPhone,
      'notes': notes,
    };

    try {
      final res = await _apiService.post(ApiConstants.bookings, payload, requiresAuth: true);
      final newBooking = BookingModel.fromJson(res);
      _latestConfirmedBooking = newBooking;
      _myBookings.insert(0, newBooking);
      notifyListeners();
      return newBooking;
    } catch (e) {
      // Offline fallback booking
      final refNum = (1000 + (DateTime.now().microsecond % 8999)).toString();
      final fallbackBooking = BookingModel(
        id: 'bk-$refNum',
        bookingReference: 'BK-$refNum',
        businessId: _selectedBusiness!.id,
        serviceId: _selectedService!.id,
        service: _selectedService,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        bookingDate: dateStr,
        startTime: _selectedSlot!,
        endTime: '',
        status: 'pending',
        totalPrice: _selectedService!.price,
        notes: notes,
      );
      _latestConfirmedBooking = fallbackBooking;
      _myBookings.insert(0, fallbackBooking);
      notifyListeners();
      return fallbackBooking;
    }
  }

  // Fetch Customer Bookings
  Future<void> fetchMyBookings() async {
    _isLoadingBookings = true;
    notifyListeners();

    try {
      final res = await _apiService.get(ApiConstants.bookings, requiresAuth: true);
      final list = (res is List ? res : res['results'] ?? []) as List;
      _myBookings = list.map((item) => BookingModel.fromJson(item)).toList();
    } catch (_) {}

    _isLoadingBookings = false;
    notifyListeners();
  }

  // Cancel Booking
  Future<bool> cancelBooking(String bookingId, String reason) async {
    try {
      await _apiService.patch(
        ApiConstants.cancelBooking(bookingId),
        {'status': 'cancelled', 'cancellation_reason': reason},
        requiresAuth: true,
      );

      final index = _myBookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        final old = _myBookings[index];
        _myBookings[index] = BookingModel(
          id: old.id,
          bookingReference: old.bookingReference,
          businessId: old.businessId,
          serviceId: old.serviceId,
          service: old.service,
          customerName: old.customerName,
          customerEmail: old.customerEmail,
          customerPhone: old.customerPhone,
          bookingDate: old.bookingDate,
          startTime: old.startTime,
          endTime: old.endTime,
          status: 'cancelled',
          totalPrice: old.totalPrice,
          notes: old.notes,
          cancellationReason: reason,
        );
        notifyListeners();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  // Fetch Reviews
  Future<void> fetchReviewsForBusiness(String businessId) async {
    try {
      final url = '${ApiConstants.reviews}?business_id=$businessId';
      final res = await _apiService.get(url, requiresAuth: false);
      final list = (res is List ? res : res['results'] ?? []) as List;
      _reviews = list.map((item) => ReviewModel.fromJson(item)).toList();
      notifyListeners();
    } catch (_) {}
  }
}
