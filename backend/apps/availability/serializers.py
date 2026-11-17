from rest_framework import serializers
from .models import AvailabilitySettings, DaySchedule, SpecialDate

class DayScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DaySchedule
        fields = [
            'day_of_week', 'day_name', 'is_open',
            'open_time', 'close_time', 'break_start', 'break_end'
        ]

class SpecialDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialDate
        fields = ['id', 'date', 'is_closed', 'reason', 'open_time', 'close_time']
        read_only_fields = ['id']

class AvailabilitySettingsSerializer(serializers.ModelSerializer):
    weekly_schedule = DayScheduleSerializer(many=True, required=False)
    special_dates = SpecialDateSerializer(many=True, required=False)

    class Meta:
        model = AvailabilitySettings
        fields = [
            'slot_duration_minutes', 'buffer_time_minutes', 'advance_booking_days',
            'weekly_schedule', 'special_dates'
        ]

    def update(self, instance, validated_data):
        weekly_schedule_data = validated_data.pop('weekly_schedule', None)
        special_dates_data = validated_data.pop('special_dates', None)

        instance.slot_duration_minutes = validated_data.get('slot_duration_minutes', instance.slot_duration_minutes)
        instance.buffer_time_minutes = validated_data.get('buffer_time_minutes', instance.buffer_time_minutes)
        instance.advance_booking_days = validated_data.get('advance_booking_days', instance.advance_booking_days)
        instance.save()

        if weekly_schedule_data is not None:
            instance.weekly_schedule.all().delete()
            for day_data in weekly_schedule_data:
                DaySchedule.objects.create(settings=instance, **day_data)

        if special_dates_data is not None:
            instance.special_dates.all().delete()
            for sp_data in special_dates_data:
                SpecialDate.objects.create(settings=instance, **sp_data)

        return instance
