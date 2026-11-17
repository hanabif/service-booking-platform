from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from apps.authentication.permissions import IsBusinessOwner
from apps.businesses.models import Business

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'reply':
            return [permissions.IsAuthenticated(), IsBusinessOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')

        # If filtered by public query parameter
        if business_id:
            return Review.objects.filter(business_id=business_id)

        # If business owner is authenticated
        if self.request.user.is_authenticated and hasattr(self.request.user, 'business'):
            return Review.objects.filter(business=self.request.user.business)

        return Review.objects.all()

    def perform_create(self, serializer):
        customer = self.request.user if self.request.user.is_authenticated else None
        serializer.save(customer=customer)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        review = self.get_object()
        reply_text = request.data.get('reply', '')
        if not reply_text:
            return Response({'detail': 'Reply content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        review.reply = reply_text
        review.save()
        return Response(ReviewSerializer(review).data)
