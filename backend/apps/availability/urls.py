from django.urls import path
from .views import AvailabilityView, AvailableSlotsPublicView

urlpatterns = [
    path('', AvailabilityView.as_view(), name='availability_settings'),
    path('slots/', AvailableSlotsPublicView.as_view(), name='available_slots_public'),
]
