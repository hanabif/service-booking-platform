class ReviewModel {
  final String id;
  final String customerName;
  final double rating;
  final String comment;
  final String reply;
  final String createdAt;

  ReviewModel({
    required this.id,
    required this.customerName,
    required this.rating,
    required this.comment,
    this.reply = '',
    this.createdAt = '',
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id']?.toString() ?? '',
      customerName: json['customer_name'] ?? 'Verified Customer',
      rating: double.tryParse(json['rating']?.toString() ?? '5.0') ?? 5.0,
      comment: json['comment'] ?? '',
      reply: json['reply'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
