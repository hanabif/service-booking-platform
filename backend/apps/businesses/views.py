from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Business
from .serializers import BusinessSerializer
from apps.authentication.permissions import IsBusinessOwner

class BusinessProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsBusinessOwner]

    def get(self, request):
        try:
            business = request.user.business
            serializer = BusinessSerializer(business)
            return Response(serializer.data)
        except Business.DoesNotExist:
            return Response({'detail': 'No business profile associated with this account.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try:
            business = request.user.business
            serializer = BusinessSerializer(business, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Business.DoesNotExist:
            return Response({'detail': 'No business profile associated with this account.'}, status=status.HTTP_404_NOT_FOUND)

class BusinessListPublicView(generics.ListAPIView):
    """Public list of active businesses for customers and mobile app."""
    permission_classes = [permissions.AllowAny]
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True)
    filterset_fields = ['category', 'city']
    search_fields = ['name', 'description', 'category', 'city']

class BusinessDetailPublicView(generics.RetrieveAPIView):
    """Public business detail by ID."""
    permission_classes = [permissions.AllowAny]
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True)
    lookup_field = 'id'
