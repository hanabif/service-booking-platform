from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from apps.notifications.signals import booking_created, booking_status_changed

class BookingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'booking_date']
    search_fields = ['customer_name', 'customer_email', 'booking_reference', 'service__name']
    ordering_fields = ['booking_date', 'start_time', 'created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Booking.objects.none()

        # Business owner views bookings for their business
        if hasattr(user, 'business') and user.role in ['business_owner', 'admin']:
            return Booking.objects.filter(business=user.business).select_related('service')

        # Customer views their own bookings
        return Booking.objects.filter(customer=user).select_related('service')

    def perform_create(self, serializer):
        booking = serializer.save()
        # Dispatch notification hook
        booking_created.send(
            sender=self.__class__,
            booking=booking,
            business=booking.business,
            customer=booking.customer
        )

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('cancellation_reason', '')

        if new_status not in [choice[0] for choice in Booking.Status.choices]:
            return Response({'detail': f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        old_status = booking.status
        booking.status = new_status
        if reason:
            booking.cancellation_reason = reason
        booking.save()

        # Dispatch notification hook
        booking_status_changed.send(
            sender=self.__class__,
            booking=booking,
            old_status=old_status,
            new_status=new_status,
            reason=reason
        )

        serializer = BookingSerializer(booking)
        return Response(serializer.data)
