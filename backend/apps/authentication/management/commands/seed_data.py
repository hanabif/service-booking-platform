import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.authentication.models import User
from apps.businesses.models import Business
from apps.services.models import Service
from apps.availability.models import AvailabilitySettings, DaySchedule
from apps.bookings.models import Booking
from apps.reviews.models import Review

class Command(BaseCommand):
    help = "Seed realistic MVP demo data matching the frontend dashboard & Flutter customer app"

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeder...")

        # 1. Superuser / Admin
        admin_user, created = User.objects.get_or_create(
            email="admin@platform.com",
            defaults={
                "first_name": "Platform",
                "last_name": "Admin",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("AdminPass123!")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Admin user created: admin@platform.com"))

        # 2. Business Owner (Marcus Sterling)
        owner_user, created = User.objects.get_or_create(
            email="marcus@apexgrooming.com",
            defaults={
                "first_name": "Marcus",
                "last_name": "Sterling",
                "phone": "+1 (555) 382-9011",
                "role": User.Role.BUSINESS_OWNER,
            }
        )
        if created:
            owner_user.set_password("ApexPass123!")
            owner_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Business owner created: marcus@apexgrooming.com"))

        # 3. Customer Users
        customers_data = [
            {"email": "totok.michael@example.com", "first_name": "Totok", "last_name": "Michael", "phone": "+1 (555) 124-7890"},
            {"email": "alexandra.deff@example.com", "first_name": "Alexandra", "last_name": "Deff", "phone": "+1 (555) 432-8765"},
            {"email": "edwin.adenike@example.com", "first_name": "Edwin", "last_name": "Adenike", "phone": "+1 (555) 987-1234"},
            {"email": "david.oshodi@example.com", "first_name": "David", "last_name": "Oshodi", "phone": "+1 (555) 678-4321"},
        ]
        customers = []
        for cdata in customers_data:
            cust, created = User.objects.get_or_create(
                email=cdata["email"],
                defaults={
                    "first_name": cdata["first_name"],
                    "last_name": cdata["last_name"],
                    "phone": cdata["phone"],
                    "role": User.Role.CUSTOMER,
                }
            )
            if created:
                cust.set_password("CustomerPass123!")
                cust.save()
            customers.append(cust)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(customers)} Customer accounts prepared"))

        # 4. Business (Apex Grooming Lounge)
        business, created = Business.objects.get_or_create(
            owner=owner_user,
            defaults={
                "name": "Apex Grooming Lounge",
                "category": "Barbershop & Grooming",
                "description": "Apex Grooming Lounge delivers premium grooming services for modern professionals. Designed with high-end comfort and dedicated craft barbers.",
                "phone": "+1 (555) 234-9080",
                "email": "contact@apexgrooming.com",
                "address": "452 Hudson St, Soho",
                "city": "New York",
                "state": "NY",
                "postal_code": "10014",
                "rating": 4.95,
                "review_count": 142,
                "is_active": True,
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✓ Business: {business.name}"))

        # 5. Services
        services_data = [
            {
                "name": "Signature Beard Sculpt & Hot Towel",
                "description": "Precision razor shaping, warm eucalyptus steam towel, organic conditioning balm, and scalp tension relief.",
                "duration_minutes": 45,
                "price": 45.00,
                "category": "Beard & Shave",
                "is_active": True,
            },
            {
                "name": "Executive Haircut & Styling",
                "description": "Consultation, custom tailored shear and clipper work, purifying wash, neck shave, and matte styling finish.",
                "duration_minutes": 45,
                "price": 60.00,
                "category": "Haircuts",
                "is_active": True,
            },
            {
                "name": "Royal Head Shave & Scalp Treatment",
                "description": "Straight razor head shave with pre-shave oil, hot lather, cool tonic, and deeply hydrating scalp massage.",
                "duration_minutes": 40,
                "price": 55.00,
                "category": "Shaving",
                "is_active": True,
            },
            {
                "name": "Charcoal Purifying Facial",
                "description": "Activated charcoal detox mask, pore extraction, warm steam infusion, and peptide moisturizer.",
                "duration_minutes": 30,
                "price": 50.00,
                "category": "Spa & Treatments",
                "is_active": True,
            },
            {
                "name": "Express Beard Trim",
                "description": "Quick line-up and trimmer maintenance for clean definition between full sculpt sessions.",
                "duration_minutes": 20,
                "price": 28.00,
                "category": "Beard & Shave",
                "is_active": True,
            },
            {
                "name": "Father & Son Combo Session",
                "description": "Back-to-back haircuts with neck taper, hair styling, and beverage service for both.",
                "duration_minutes": 75,
                "price": 95.00,
                "category": "Packages",
                "is_active": True,
            },
        ]
        created_services = []
        for sdata in services_data:
            svc, _ = Service.objects.get_or_create(
                business=business,
                name=sdata["name"],
                defaults=sdata
            )
            created_services.append(svc)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(created_services)} Services configured"))

        # 6. Availability Settings & Schedules
        # 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
        avail_settings, _ = AvailabilitySettings.objects.get_or_create(
            business=business,
            defaults={
                "slot_duration_minutes": 30,
                "buffer_time_minutes": 10,
                "advance_booking_days": 30,
            }
        )

        schedule_configs = [
            (0, "Sunday", False, "10:00", "15:00", None, None),
            (1, "Monday", True, "09:00", "18:30", "13:00", "14:00"),
            (2, "Tuesday", True, "09:00", "18:30", "13:00", "14:00"),
            (3, "Wednesday", True, "09:00", "18:30", "13:00", "14:00"),
            (4, "Thursday", True, "09:00", "19:00", "13:00", "14:00"),
            (5, "Friday", True, "09:00", "19:00", "13:00", "14:00"),
            (6, "Saturday", True, "09:30", "17:00", "13:30", "14:15"),
        ]
        for day_int, day_name, is_open, op_t, cl_t, brk_s, brk_e in schedule_configs:
            DaySchedule.objects.update_or_create(
                settings=avail_settings,
                day_of_week=day_int,
                defaults={
                    "day_name": day_name,
                    "is_open": is_open,
                    "open_time": op_t,
                    "close_time": cl_t,
                    "break_start": brk_s,
                    "break_end": brk_e,
                }
            )
        self.stdout.write(self.style.SUCCESS("✓ Weekly availability schedules seeded"))

        # 7. Bookings
        today = timezone.localdate()
        bookings_data = [
            # Upcoming bookings
            {
                "customer": customers[0],
                "service": created_services[0],
                "booking_date": today + datetime.timedelta(days=1),
                "start_time": "10:00",
                "end_time": "10:45",
                "status": Booking.Status.PENDING,
                "customer_name": "Totok Michael",
                "customer_email": customers[0].email,
                "customer_phone": customers[0].phone,
                "notes": "First time visit. Prefers natural eucalyptus oil balm.",
            },
            {
                "customer": customers[1],
                "service": created_services[1],
                "booking_date": today + datetime.timedelta(days=1),
                "start_time": "14:00",
                "end_time": "14:45",
                "status": Booking.Status.CONFIRMED,
                "customer_name": "Alexandra Deff",
                "customer_email": customers[1].email,
                "customer_phone": customers[1].phone,
                "notes": "Clean fade on sides, textured scissor cut on top.",
            },
            {
                "customer": customers[2],
                "service": created_services[3],
                "booking_date": today + datetime.timedelta(days=2),
                "start_time": "11:30",
                "end_time": "12:00",
                "status": Booking.Status.PENDING,
                "customer_name": "Edwin Adenike",
                "customer_email": customers[2].email,
                "customer_phone": customers[2].phone,
                "notes": "Sensitive skin, avoid high alcohol tonics.",
            },
            {
                "customer": customers[3],
                "service": created_services[5],
                "booking_date": today + datetime.timedelta(days=3),
                "start_time": "15:00",
                "end_time": "16:15",
                "status": Booking.Status.CONFIRMED,
                "customer_name": "David Oshodi",
                "customer_email": customers[3].email,
                "customer_phone": customers[3].phone,
                "notes": "Bringing my 8-year-old son for back-to-school haircut.",
            },
            # Past Completed Bookings (for Analytics & Revenue history)
            {
                "customer": customers[0],
                "service": created_services[1],
                "booking_date": today - datetime.timedelta(days=2),
                "start_time": "10:00",
                "end_time": "10:45",
                "status": Booking.Status.COMPLETED,
                "customer_name": "Totok Michael",
                "customer_email": customers[0].email,
                "customer_phone": customers[0].phone,
                "notes": "Completed session.",
            },
            {
                "customer": customers[1],
                "service": created_services[0],
                "booking_date": today - datetime.timedelta(days=3),
                "start_time": "13:00",
                "end_time": "13:45",
                "status": Booking.Status.COMPLETED,
                "customer_name": "Alexandra Deff",
                "customer_email": customers[1].email,
                "customer_phone": customers[1].phone,
                "notes": "Completed session.",
            },
            {
                "customer": customers[2],
                "service": created_services[2],
                "booking_date": today - datetime.timedelta(days=5),
                "start_time": "16:00",
                "end_time": "16:40",
                "status": Booking.Status.COMPLETED,
                "customer_name": "Edwin Adenike",
                "customer_email": customers[2].email,
                "customer_phone": customers[2].phone,
                "notes": "Completed session.",
            },
            {
                "customer": customers[3],
                "service": created_services[4],
                "booking_date": today - datetime.timedelta(days=6),
                "start_time": "12:00",
                "end_time": "12:20",
                "status": Booking.Status.CANCELLED,
                "customer_name": "David Oshodi",
                "customer_email": customers[3].email,
                "customer_phone": customers[3].phone,
                "notes": "Cancelled appointment",
                "cancellation_reason": "Flight rescheduled.",
            },
        ]

        created_bookings = []
        for bdata in bookings_data:
            svc = bdata["service"]
            booking, _ = Booking.objects.get_or_create(
                business=business,
                customer=bdata["customer"],
                booking_date=bdata["booking_date"],
                start_time=bdata["start_time"],
                defaults={
                    "service": svc,
                    "end_time": bdata["end_time"],
                    "status": bdata["status"],
                    "total_price": svc.price,
                    "customer_name": bdata["customer_name"],
                    "customer_email": bdata["customer_email"],
                    "customer_phone": bdata["customer_phone"],
                    "notes": bdata.get("notes", ""),
                    "cancellation_reason": bdata.get("cancellation_reason", ""),
                }
            )
            created_bookings.append(booking)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(created_bookings)} Demo bookings created"))

        # 8. Reviews
        reviews_data = [
            {
                "booking": created_bookings[4],
                "rating": 5.0,
                "comment": "Best haircut experience in Soho. Marcus is a true master with shears and the hot towel finish is pure luxury.",
                "reply": "Thank you so much Totok! Looking forward to welcoming you back next month.",
            },
            {
                "booking": created_bookings[5],
                "rating": 5.0,
                "comment": "The beard sculpt line was razor-sharp and stayed clean for weeks. Incredible attention to detail.",
                "reply": "Appreciate the kind words Alexandra! Always a pleasure.",
            },
            {
                "booking": created_bookings[6],
                "rating": 4.8,
                "comment": "Super clean lounge, great coffee, and punctual staff. The royal scalp treatment cured my dry skin instantly.",
                "reply": "Glad the scalp therapy worked wonders Edwin!",
            },
        ]
        for rdata in reviews_data:
            b = rdata["booking"]
            Review.objects.get_or_create(
                business=business,
                booking=b,
                defaults={
                    "customer": b.customer,
                    "customer_name": b.customer_name,
                    "rating": rdata["rating"],
                    "comment": rdata["comment"],
                    "reply": rdata["reply"],
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(reviews_data)} Customer reviews & owner replies seeded"))
        self.stdout.write(self.style.SUCCESS("All seed data successfully loaded into database!"))
