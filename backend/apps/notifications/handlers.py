import logging
from django.dispatch import receiver
from .signals import booking_created, booking_status_changed

logger = logging.getLogger('notifications')

@receiver(booking_created)
def handle_booking_created(sender, booking, **kwargs):
    """
    Email & Push notification hook: Dispatched when customer creates a booking.
    """
    # 1. Customer confirmation email hook
    logger.info(
        f"[EMAIL HOOK] To: {booking.customer_email} | Subject: Booking Request Received #{booking.booking_reference} | "
        f"Service: {booking.service.name} on {booking.booking_date} at {booking.start_time}"
    )

    # 2. Business Owner alert email/push hook
    owner_email = booking.business.email or booking.business.owner.email
    logger.info(
        f"[EMAIL HOOK] To Owner: {owner_email} | Subject: New Booking Request from {booking.customer_name} | "
        f"Amount: ${booking.total_price}"
    )

    # 3. Mobile Push notification hook for Flutter app
    logger.info(
        f"[PUSH HOOK] User: {booking.customer_email} | Title: Appointment Pending | "
        f"Body: Your request for {booking.service.name} has been submitted."
    )

@receiver(booking_status_changed)
def handle_booking_status_changed(sender, booking, old_status, new_status, reason=None, **kwargs):
    """
    Email & Push notification hook: Dispatched when booking is approved, cancelled, or completed.
    """
    if new_status == 'confirmed':
        logger.info(
            f"[PUSH HOOK] To Customer: {booking.customer_email} | "
            f"Title: Booking Confirmed! | Body: Your appointment #{booking.booking_reference} for {booking.service.name} is confirmed for {booking.booking_date} at {booking.start_time}."
        )
        logger.info(
            f"[EMAIL HOOK] To: {booking.customer_email} | "
            f"Subject: Your Appointment is Confirmed! #{booking.booking_reference}"
        )
    elif new_status == 'cancelled':
        logger.info(
            f"[PUSH HOOK] To Customer: {booking.customer_email} | "
            f"Title: Booking Cancelled | Body: Your appointment #{booking.booking_reference} was cancelled. Reason: {reason or 'Schedule conflict'}"
        )
        logger.info(
            f"[EMAIL HOOK] To: {booking.customer_email} | "
            f"Subject: Booking Cancellation #{booking.booking_reference} | Reason: {reason}"
        )
    elif new_status == 'completed':
        logger.info(
            f"[PUSH HOOK] To Customer: {booking.customer_email} | "
            f"Title: Thank you for your visit! | Body: How was your experience with {booking.service.name}? Tap to leave a review."
        )
