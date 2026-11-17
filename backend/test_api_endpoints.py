import os
import sys
import datetime
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from rest_framework.test import APIClient
from apps.authentication.models import User
from apps.businesses.models import Business

def run_tests():
    print("==================================================")
    print("SERVICE BOOKING PLATFORM - BACKEND API SUITE TEST")
    print("==================================================")

    client = APIClient()

    # 1. Health Check
    health_resp = client.get('/api/health/')
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.status_code}"
    print(f"✓ GET /api/health/ -> 200 OK: {health_resp.json()}")

    # 2. JWT Login as Marcus Sterling (Business Owner)
    login_resp = client.post('/api/auth/login/', {
        "email": "marcus@apexgrooming.com",
        "password": "ApexPass123!"
    }, format='json')
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.content}"
    tokens = login_resp.json()
    owner_token = tokens["access"]
    user_info = tokens["user"]
    print(f"✓ POST /api/auth/login/ -> 200 OK: Signed in as {user_info['email']} ({user_info['role']})")
    assert user_info["role"] == "business_owner"

    # Authenticate client with Owner Bearer token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {owner_token}')

    # 3. Business Profile
    biz_resp = client.get('/api/business/me/')
    assert biz_resp.status_code == 200, f"Business me failed: {biz_resp.status_code} {biz_resp.content}"
    biz_data = biz_resp.json()
    business_id = biz_data['id']
    print(f"✓ GET /api/business/me/ -> 200 OK: '{biz_data['name']}' ({biz_data['city']}, {biz_data['state']})")

    # 4. Services Endpoint
    services_resp = client.get('/api/services/')
    assert services_resp.status_code == 200, f"Services list failed: {services_resp.status_code}"
    services = services_resp.json()
    svc_list = services.get('results', services) if isinstance(services, dict) else services
    print(f"✓ GET /api/services/ -> 200 OK: {len(svc_list)} services found")
    selected_service = svc_list[0]

    # 5. Availability Schedule
    avail_resp = client.get('/api/availability/')
    assert avail_resp.status_code == 200, f"Availability get failed: {avail_resp.status_code}"
    avail_data = avail_resp.json()
    schedules = avail_data.get('weekly_schedule', [])
    print(f"✓ GET /api/availability/ -> 200 OK: {len(schedules)} day schedules configured")

    # 6. Public Time Slots for Flutter / Customer
    target_date = (datetime.date.today() + datetime.timedelta(days=4)).isoformat()
    slots_resp = client.get(f'/api/availability/slots/?business_id={business_id}&date={target_date}')
    assert slots_resp.status_code == 200, f"Slots query failed: {slots_resp.status_code} {slots_resp.content}"
    slots_data = slots_resp.json()
    slots = slots_data.get('slots', [])
    print(f"✓ GET /api/availability/slots/?date={target_date} -> 200 OK: {len(slots)} slots available: {slots[:4]}...")

    # 7. Bookings Endpoint
    bookings_resp = client.get('/api/bookings/')
    assert bookings_resp.status_code == 200, f"Bookings list failed: {bookings_resp.status_code}"
    b_data = bookings_resp.json()
    b_list = b_data.get('results', b_data) if isinstance(b_data, dict) else b_data
    print(f"✓ GET /api/bookings/ -> 200 OK: {len(b_list)} bookings retrieved")

    # Test Status Update (Approve a pending booking)
    pending_booking = next((b for b in b_list if b['status'] == 'pending'), None)
    if pending_booking:
        b_id = pending_booking['id']
        status_resp = client.patch(f'/api/bookings/{b_id}/status/', {'status': 'confirmed'}, format='json')
        assert status_resp.status_code == 200, f"Status update failed: {status_resp.status_code}"
        print(f"✓ PATCH /api/bookings/{b_id}/status/ -> 200 OK: {pending_booking['booking_reference']} updated to confirmed")

    # 8. Reviews Endpoint
    reviews_resp = client.get('/api/reviews/')
    assert reviews_resp.status_code == 200, f"Reviews list failed: {reviews_resp.status_code}"
    r_data = reviews_resp.json()
    r_list = r_data.get('results', r_data) if isinstance(r_data, dict) else r_data
    print(f"✓ GET /api/reviews/ -> 200 OK: {len(r_list)} reviews retrieved")

    # 9. Analytics Summary
    analytics_resp = client.get('/api/analytics/summary/')
    assert analytics_resp.status_code == 200, f"Analytics summary failed: {analytics_resp.status_code} {analytics_resp.content}"
    an_data = analytics_resp.json()
    print(f"✓ GET /api/analytics/summary/ -> 200 OK: Total revenue ${an_data.get('total_revenue')}")

    print("\n--------------------------------------------------")
    print("TESTING CUSTOMER FLOW (FOR FLUTTER MOBILE APP)")
    print("--------------------------------------------------")

    # Customer Client
    cust_client = APIClient()

    # Customer Login
    cust_login = cust_client.post('/api/auth/login/', {
        "email": "totok.michael@example.com",
        "password": "CustomerPass123!"
    }, format='json')
    assert cust_login.status_code == 200, f"Customer login failed: {cust_login.content}"
    cust_tokens = cust_login.json()
    cust_token = cust_tokens["access"]
    print(f"✓ Customer login: totok.michael@example.com")
    cust_client.credentials(HTTP_AUTHORIZATION=f'Bearer {cust_token}')

    # Customer browses business directory
    dir_resp = cust_client.get('/api/business/directory/')
    assert dir_resp.status_code == 200, f"Directory failed: {dir_resp.content}"
    dir_data = dir_resp.json()
    dir_list = dir_data.get('results', dir_data) if isinstance(dir_data, dict) else dir_data
    print(f"✓ Customer browses businesses: {len(dir_list)} business(es) found")

    # Customer creates a booking
    new_booking_resp = cust_client.post('/api/bookings/', {
        "business": business_id,
        "service_id": selected_service['id'],
        "booking_date": target_date,
        "start_time": slots[0] if slots else "11:00",
        "customer_name": "Totok Michael",
        "customer_email": "totok.michael@example.com",
        "customer_phone": "+1 (555) 124-7890",
        "notes": "Booked from customer mobile app.",
    }, format='json')
    assert new_booking_resp.status_code in [200, 201], f"Booking creation failed: {new_booking_resp.status_code} {new_booking_resp.content}"
    new_booking = new_booking_resp.json()
    print(f"✓ Customer created booking: ref={new_booking.get('booking_reference')} status={new_booking.get('status')} total=${new_booking.get('total_price')}")

    # Customer views booking history
    my_bookings = cust_client.get('/api/bookings/')
    assert my_bookings.status_code == 200
    my_b_data = my_bookings.json()
    my_b_list = my_b_data.get('results', my_b_data) if isinstance(my_b_data, dict) else my_b_data
    print(f"✓ Customer booking history: {len(my_b_list)} booking(s) found")

    print("\n==================================================")
    print("ALL API TESTS (OWNER + CUSTOMER) PASSED 100%!")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
