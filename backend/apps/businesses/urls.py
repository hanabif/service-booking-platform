from django.urls import path
from .views import BusinessProfileView, BusinessListPublicView, BusinessDetailPublicView

urlpatterns = [
    path('profile/', BusinessProfileView.as_view(), name='business_profile'),
    path('me/', BusinessProfileView.as_view(), name='business_me'),
    path('directory/', BusinessListPublicView.as_view(), name='business_directory'),
    path('directory/<uuid:id>/', BusinessDetailPublicView.as_view(), name='business_detail'),
]
