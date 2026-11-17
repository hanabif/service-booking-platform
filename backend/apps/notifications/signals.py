from django.dispatch import Signal

# Sent when a new booking is requested
booking_created = Signal() # kwargs: booking, business, customer

# Sent when a booking status changes (confirmed, cancelled, completed)
booking_status_changed = Signal() # kwargs: booking, old_status, new_status, reason
