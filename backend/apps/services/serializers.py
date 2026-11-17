from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    business_id = serializers.ReadOnlyField(source='business.id')

    class Meta:
        model = Service
        fields = [
            'id', 'business_id', 'name', 'description',
            'duration_minutes', 'price', 'category', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'business_id', 'created_at', 'updated_at']
