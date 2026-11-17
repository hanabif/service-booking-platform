from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from apps.businesses.models import Business

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class BusinessBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ['id', 'name', 'slug', 'category', 'description', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'rating', 'review_count', 'is_active']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = UserSerializer(user).data
        try:
            business = getattr(user, 'business', None)
            data['business'] = BusinessBriefSerializer(business).data if business else None
        except Exception:
            data['business'] = None
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    business_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    category = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'business_name', 'category']
        extra_kwargs = {
            'role': {'required': False},
        }

    def create(self, validated_data):
        business_name = validated_data.pop('business_name', None)
        category = validated_data.pop('category', 'Barbershop & Grooming')
        password = validated_data.pop('password')

        # If business_name is provided, force role to business_owner
        if business_name:
            validated_data['role'] = User.Role.BUSINESS_OWNER

        user = User.objects.create_user(password=password, **validated_data)

        if business_name:
            Business.objects.create(
                owner=user,
                name=business_name,
                category=category or 'Barbershop & Grooming',
                email=user.email,
                phone=user.phone or ''
            )

        return user
