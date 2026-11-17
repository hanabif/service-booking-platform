from rest_framework import serializers
from .models import Business

class BusinessSerializer(serializers.ModelSerializer):
    owner_id = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Business
        fields = [
            'id', 'owner_id', 'name', 'slug', 'category', 'description',
            'phone', 'email', 'address', 'city', 'state', 'postal_code',
            'rating', 'review_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner_id', 'rating', 'review_count', 'created_at', 'updated_at']
