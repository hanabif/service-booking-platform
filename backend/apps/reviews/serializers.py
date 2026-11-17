from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    business_id = serializers.ReadOnlyField(source='business.id')

    class Meta:
        model = Review
        fields = [
            'id', 'business_id', 'booking', 'customer_name',
            'rating', 'comment', 'reply', 'created_at'
        ]
        read_only_fields = ['id', 'business_id', 'created_at']
