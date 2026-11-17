import 'service_model.dart';

class BookingModel {
  final String id;
  final String bookingReference;
  final String businessId;
  final String serviceId;
  final ServiceModel? service;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String bookingDate; // 'YYYY-MM-DD'
  final String startTime;   // 'HH:MM'
  final String endTime;     // 'HH:MM'
  final String status;      // 'pending', 'confirmed', 'completed', 'cancelled'
  final double totalPrice;
  final String notes;
  final String cancellationReason;
  final String createdAt;

  BookingModel({
    required this.id,
    required this.bookingReference,
    required this.businessId,
    required this.serviceId,
    this.service,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.bookingDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.totalPrice,
    this.notes = '',
    this.cancellationReason = '',
    this.createdAt = '',
  });

  bool get isUpcoming => status == 'pending' || status == 'confirmed';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    ServiceModel? parsedService;
    if (json['service'] is Map<String, dynamic>) {
      parsedService = ServiceModel.fromJson(json['service']);
    }

    return BookingModel(
      id: json['id']?.toString() ?? '',
      bookingReference: json['booking_reference'] ?? '',
      businessId: json['business_id']?.toString() ?? '',
      serviceId: json['service_id']?.toString() ?? parsedService?.id ?? '',
      service: parsedService,
      customerName: json['customer_name'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      customerPhone: json['customer_phone'] ?? '',
      bookingDate: json['booking_date'] ?? '',
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      status: json['status'] ?? 'pending',
      totalPrice: double.tryParse(json['total_price']?.toString() ?? '0.0') ?? 0.0,
      notes: json['notes'] ?? '',
      cancellationReason: json['cancellation_reason'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
