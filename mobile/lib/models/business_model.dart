class BusinessModel {
  final String id;
  final String name;
  final String slug;
  final String category;
  final String description;
  final String phone;
  final String email;
  final String address;
  final String city;
  final String state;
  final String postalCode;
  final double rating;
  final int reviewCount;
  final bool isActive;

  BusinessModel({
    required this.id,
    required this.name,
    this.slug = '',
    required this.category,
    this.description = '',
    this.phone = '',
    this.email = '',
    this.address = '',
    this.city = '',
    this.state = '',
    this.postalCode = '',
    this.rating = 5.0,
    this.reviewCount = 0,
    this.isActive = true,
  });

  String get fullAddress {
    final parts = [address, city, state, postalCode].where((p) => p.trim().isNotEmpty).toList();
    return parts.join(', ');
  }

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    return BusinessModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      category: json['category'] ?? 'Barbershop & Grooming',
      description: json['description'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      postalCode: json['postal_code'] ?? '',
      rating: double.tryParse(json['rating']?.toString() ?? '5.0') ?? 5.0,
      reviewCount: json['review_count'] is int ? json['review_count'] : int.tryParse(json['review_count']?.toString() ?? '0') ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }
}
