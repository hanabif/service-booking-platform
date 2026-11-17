from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Service
from .serializers import ServiceSerializer
from apps.authentication.permissions import IsBusinessOwner

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsBusinessOwner()]

    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')

        # If a public user or mobile app passes ?business_id=<uuid>
        if business_id:
            return Service.objects.filter(business_id=business_id, is_active=True)

        # If an authenticated business owner
        if self.request.user.is_authenticated and hasattr(self.request.user, 'business'):
            return Service.objects.filter(business=self.request.user.business)

        # Otherwise all active services
        return Service.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(business=self.request.user.business)
