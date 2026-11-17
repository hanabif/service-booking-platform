from datetime import datetime, date, time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import AvailabilitySettings, DaySchedule
from .serializers import AvailabilitySettingsSerializer
from apps.authentication.permissions import IsBusinessOwner
from apps.businesses.models import Business

class AvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsBusinessOwner]

    def get_or_create_settings(self, business):
        settings, created = AvailabilitySettings.objects.get_or_create(business=business)
        if created or not settings.weekly_schedule.exists():
            # Populate default standard week
            days = [
                (1, 'Monday', True, '09:00', '19:00', '13:00', '14:00'),
                (2, 'Tuesday', True, '09:00', '19:00', '13:00', '14:00'),
                (3, 'Wednesday', True, '09:00', '19:00', '13:00', '14:00'),
                (4, 'Thursday', True, '09:00', '20:00', '13:00', '14:00'),
                (5, 'Friday', True, '09:00', '20:00', '13:00', '14:00'),
                (6, 'Saturday', True, '10:00', '18:00', '13:30', '14:15'),
                (0, 'Sunday', False, '10:00', '16:00', None, None),
            ]
            for dow, name, is_open, op, cl, bs, be in days:
                DaySchedule.objects.get_or_create(
                    settings=settings,
                    day_of_week=dow,
                    defaults={
                        'day_name': name,
                        'is_open': is_open,
                        'open_time': op,
                        'close_time': cl,
                        'break_start': bs,
                        'break_end': be,
                    }
                )
        return settings

    def get(self, request):
        try:
            business = request.user.business
            settings = self.get_or_create_settings(business)
            serializer = AvailabilitySettingsSerializer(settings)
            return Response(serializer.data)
        except Business.DoesNotExist:
            return Response({'detail': 'No business profile found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            business = request.user.business
            settings = self.get_or_create_settings(business)
            serializer = AvailabilitySettingsSerializer(settings, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Business.DoesNotExist:
            return Response({'detail': 'No business profile found.'}, status=status.HTTP_404_NOT_FOUND)

class AvailableSlotsPublicView(APIView):
    """
    Public endpoint for customer mobile app to fetch bookable slots:
    GET /api/availability/slots/?business_id=<id>&date=YYYY-MM-DD
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        business_id = request.query_params.get('business_id')
        date_str = request.query_params.get('date')

        if not business_id and request.user.is_authenticated and hasattr(request.user, 'business'):
            business_id = str(request.user.business.id)
        elif not business_id:
            # Fall back to first active business
            first_biz = Business.objects.filter(is_active=True).first()
            if first_biz:
                business_id = str(first_biz.id)

        if not business_id or not date_str:
            return Response({'detail': 'Both business_id and date (YYYY-MM-DD) are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            business = Business.objects.get(id=business_id, is_active=True)
            settings = AvailabilitySettings.objects.filter(business=business).first()
            if not settings:
                return Response({'slots': [], 'is_open': False, 'message': 'Business availability not configured.'})

            # Check special date overrides first
            special = settings.special_dates.filter(date=target_date).first()
            if special and special.is_closed:
                return Response({'slots': [], 'is_open': False, 'reason': special.reason})

            # Get day of week (Python Monday is 0, Sunday is 6; our system uses 0=Sunday, 1=Monday... 6=Saturday)
            python_weekday = target_date.weekday()
            system_dow = (python_weekday + 1) % 7 # Mon (0) -> 1, Sun (6) -> 0

            day_schedule = settings.weekly_schedule.filter(day_of_week=system_dow).first()
            if not day_schedule or not day_schedule.is_open:
                return Response({'slots': [], 'is_open': False, 'reason': 'Business is closed on this day.'})

            open_time_str = special.open_time if (special and special.open_time) else day_schedule.open_time
            close_time_str = special.close_time if (special and special.close_time) else day_schedule.close_time

            # Generate slots
            start_h, start_m = map(int, open_time_str.split(':'))
            end_h, end_m = map(int, close_time_str.split(':'))

            current_minutes = start_h * 60 + start_m
            end_minutes = end_h * 60 + end_m
            interval = settings.slot_duration_minutes

            break_start_min = None
            break_end_min = None
            if day_schedule.break_start and day_schedule.break_end:
                bsh, bsm = map(int, day_schedule.break_start.split(':'))
                beh, bem = map(int, day_schedule.break_end.split(':'))
                break_start_min = bsh * 60 + bsm
                break_end_min = beh * 60 + bem

            slots = []
            while current_minutes + interval <= end_minutes:
                h = current_minutes // 60
                m = current_minutes % 60
                slot_time = f"{h:02d}:{m:02d}"

                is_break = False
                if break_start_min is not None and break_end_min is not None:
                    if current_minutes >= break_start_min and current_minutes < break_end_min:
                        is_break = True

                if not is_break:
                    slots.append(slot_time)

                current_minutes += interval

            return Response({
                'business_id': str(business.id),
                'date': date_str,
                'is_open': True,
                'slots': slots
            })
        except Business.DoesNotExist:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
