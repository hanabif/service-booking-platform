import uuid
from django.db import models
from apps.businesses.models import Business

class AvailabilitySettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.OneToOneField(
        Business,
        on_delete=models.CASCADE,
        related_name='availability_settings'
    )
    slot_duration_minutes = models.PositiveIntegerField(default=30)
    buffer_time_minutes = models.PositiveIntegerField(default=10)
    advance_booking_days = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Availability for {self.business.name}"

class DaySchedule(models.Model):
    settings = models.ForeignKey(
        AvailabilitySettings,
        on_delete=models.CASCADE,
        related_name='weekly_schedule'
    )
    day_of_week = models.PositiveSmallIntegerField() # 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    day_name = models.CharField(max_length=20)
    is_open = models.BooleanField(default=True)
    open_time = models.CharField(max_length=5, default='09:00')
    close_time = models.CharField(max_length=5, default='19:00')
    break_start = models.CharField(max_length=5, blank=True, null=True, default='13:00')
    break_end = models.CharField(max_length=5, blank=True, null=True, default='14:00')

    class Meta:
        ordering = ['day_of_week']
        unique_together = ('settings', 'day_of_week')

    def __str__(self):
        return f"{self.day_name}: {self.open_time} - {self.close_time} ({'Open' if self.is_open else 'Closed'})"

class SpecialDate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    settings = models.ForeignKey(
        AvailabilitySettings,
        on_delete=models.CASCADE,
        related_name='special_dates'
    )
    date = models.DateField()
    is_closed = models.BooleanField(default=True)
    reason = models.CharField(max_length=200)
    open_time = models.CharField(max_length=5, blank=True, null=True)
    close_time = models.CharField(max_length=5, blank=True, null=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.date} - {self.reason}"
