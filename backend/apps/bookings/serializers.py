from rest_framework import serializers
from .models import Booking
from apps.services.serializers import ServiceSerializer
from apps.services.models import Service

class BookingSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    business_id = serializers.ReadOnlyField(source='business.id')
    service_id = serializers.ReadOnlyField(source='service.id')

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'business_id', 'service_id', 'service',
            'customer_name', 'customer_email', 'customer_phone',
            'booking_date', 'start_time', 'end_time', 'status',
            'total_price', 'notes', 'cancellation_reason', 'created_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'business_id', 'service_id', 'total_price', 'created_at']

class BookingCreateSerializer(serializers.ModelSerializer):
    service_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'business', 'service_id',
            'customer_name', 'customer_email', 'customer_phone',
            'booking_date', 'start_time', 'end_time', 'status',
            'total_price', 'notes'
        ]
        read_only_fields = ['id', 'booking_reference', 'end_time', 'status', 'total_price']

    def create(self, validated_data):
        service_id = validated_data.pop('service_id')
        service = Service.objects.get(id=service_id)

        # Calculate end_time based on service duration
        start_time_str = validated_data['start_time']
        sh, sm = map(int, start_time_str.split(':'))
        total_start_mins = sh * 60 + sm
        total_end_mins = total_start_mins + service.duration_minutes
        eh = total_end_mins // 60
        em = total_end_mins % 60
        end_time_str = f"{eh:02d}:{em:02d}"

        # Bind customer if user is authenticated
        request = self.context.get('request')
        customer = request.user if (request and request.user.is_authenticated) else None

        booking = Booking.objects.create(
            service=service,
            end_time=end_time_str,
            total_price=service.price,
            customer=customer,
            **validated_data
        )
        return booking
