import uuid
import random
from django.db import models
from django.conf import settings
from apps.businesses.models import Business
from apps.services.models import Service

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Approval'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='bookings'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_bookings'
    )
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)

    booking_date = models.DateField()
    start_time = models.CharField(max_length=5) # '09:30'
    end_time = models.CharField(max_length=5)   # '10:15'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date', 'start_time']

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            # Generate reference e.g. BK-8901
            rand_digits = random.randint(1000, 9999)
            ref = f"BK-{rand_digits}"
            while Booking.objects.filter(booking_reference=ref).exists():
                rand_digits = random.randint(1000, 9999)
                ref = f"BK-{rand_digits}"
            self.booking_reference = ref

        if not self.total_price and self.service:
            self.total_price = self.service.price

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_reference} - {self.customer_name} ({self.status})"
