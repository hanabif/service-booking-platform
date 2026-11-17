class ServiceModel {
  final String id;
  final String businessId;
  final String name;
  final String description;
  final int durationMinutes;
  final double price;
  final String category;
  final bool isActive;

  ServiceModel({
    required this.id,
    this.businessId = '',
    required this.name,
    this.description = '',
    this.durationMinutes = 45,
    required this.price,
    this.category = 'General',
    this.isActive = true,
  });

  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  String get formattedDuration => '${durationMinutes}m';

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id']?.toString() ?? '',
      businessId: json['business_id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      durationMinutes: json['duration_minutes'] is int
          ? json['duration_minutes']
          : int.tryParse(json['duration_minutes']?.toString() ?? '45') ?? 45,
      price: double.tryParse(json['price']?.toString() ?? '0.0') ?? 0.0,
      category: json['category'] ?? 'General',
      isActive: json['is_active'] ?? true,
    );
  }
}
