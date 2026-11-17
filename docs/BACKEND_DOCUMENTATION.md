# Service Booking Platform - Backend Architecture & API Specification

**Author**: Lead Full-Stack Architect  
**Project**: Service Booking Platform MVP  
**Version**: 1.0.0-mvp  
**Status**: Integrated & Verified  
**Google Doc ID**: `1SBGDQvN8jIzcR52m7mbVkOaMitnZSBpStVwSeLwH4-w`  

---

## 1. Executive Summary & Architectural Overview

The backend is built with **Django 5.1** and **Django REST Framework (DRF)**. It functions as the authoritative data persistence, scheduling, and business logic engine for:
1. **React Web Dashboard (`frontend/`)**: Used by business owners to manage services, availability, appointments, customer reviews, and analytics.
2. **Flutter Android Customer App (`mobile/`)**: Used by clients to discover lounges, book time slots, view confirmations, and manage appointment history.

### Core Architectural Pillars
- **Stateless JWT Authentication**: Dual token model (`access` + `refresh`) powered by `djangorestframework-simplejwt`.
- **Role-Based Access Control (RBAC)**: Enforced via custom permissions (`IsAdminUser`, `IsBusinessOwner`, `IsCustomer`).
- **Flexible Database Engine**: Dual-mode engine running on PostgreSQL 16 in containerized production and SQLite in zero-config development.
- **Dynamic Slot Generation**: Mathematical interval calculation preventing collisions and enforcing operating schedules and buffer times.
- **Event-Driven Signals**: Decoupled notification hooks dispatched on booking lifecycle state changes.

---

## 2. Technology Stack

| Layer | Component | Version | Purpose |
|---|---|---|---|
| **Language** | Python | 3.13+ | Core programming runtime |
| **Framework** | Django | 5.1.15 | Web framework, ORM, migrations, and CLI |
| **API Engine** | Django REST Framework | 3.17.2 | Serializers, ViewSets, APIViews, routers |
| **Auth** | SimpleJWT | 5.5.1 | RFC 7519 JSON Web Token issuance and verification |
| **Database** | PostgreSQL / SQLite | 16-alpine / 3 | Dual-engine persistence layer via `psycopg2-binary` |
| **CORS** | django-cors-headers | 4.9.0 | Cross-Origin Resource Sharing for React & mobile |
| **Filtering** | django-filter | 25.1 | Query parameter filtering across services and bookings |
| **Container** | Docker & Compose | 29.8+ | Containerized multi-service deployment |

---

## 3. Database Schema & Data Models (ERD)

### 3.1 Custom User Model (`apps.authentication.User`)
Replaces Django's default user model with email-first authentication.
- `id` (UUID, Primary Key)
- `email` (EmailField, Unique, Username field)
- `first_name` (CharField, max 150)
- `last_name` (CharField, max 150)
- `role` (CharField: `'admin'`, `'business_owner'`, `'customer'`)
- `phone` (CharField, max 30)
- `avatar` (URLField, max 500)
- `is_active` (BooleanField, default True)
- `is_staff` (BooleanField, default False)
- `date_joined` (DateTimeField, auto_now_add)

### 3.2 Business Model (`apps.businesses.Business`)
Represents the provider entity (e.g. Apex Grooming Lounge).
- `id` (UUID, Primary Key)
- `owner` (OneToOneField -> `User`, related_name `'business'`)
- `name` (CharField, max 200)
- `slug` (SlugField, unique, auto-generated from name)
- `category` (CharField, max 100, default `'Barbershop & Grooming'`)
- `description` (TextField)
- `phone` (CharField, max 30)
- `email` (EmailField)
- `address`, `city`, `state`, `postal_code` (CharFields)
- `rating` (DecimalField, max_digits=3, decimal_places=2, default 5.00)
- `review_count` (PositiveIntegerField, default 0)
- `is_active` (BooleanField, default True)
- `created_at`, `updated_at` (DateTimeFields)

### 3.3 Service Model (`apps.services.Service`)
Offered grooming and wellness treatments.
- `id` (UUID, Primary Key)
- `business` (ForeignKey -> `Business`, on_delete CASCADE)
- `name` (CharField, max 200)
- `description` (TextField)
- `duration_minutes` (PositiveIntegerField, default 45)
- `price` (DecimalField, max_digits=8, decimal_places=2)
- `category` (CharField, max 100)
- `is_active` (BooleanField, default True)

### 3.4 Availability Engine Models (`apps.availability`)
- **`AvailabilitySettings`**:
  - `business` (OneToOneField -> `Business`)
  - `slot_duration_minutes` (PositiveIntegerField, default 30)
  - `buffer_time_minutes` (PositiveIntegerField, default 10)
  - `advance_booking_days` (PositiveIntegerField, default 30)
- **`DaySchedule`**:
  - `settings` (ForeignKey -> `AvailabilitySettings`, related_name `'weekly_schedule'`)
  - `day_of_week` (PositiveSmallIntegerField: `0`=Sunday .. `6`=Saturday)
  - `day_name` (CharField: `'Monday'`, etc.)
  - `is_open` (BooleanField, default True)
  - `open_time` (CharField `'09:00'`)
  - `close_time` (CharField `'19:00'`)
  - `break_start` (CharField `'13:00'`)
  - `break_end` (CharField `'14:00'`)
- **`SpecialDate`**:
  - `settings` (ForeignKey -> `AvailabilitySettings`)
  - `date` (DateField)
  - `is_closed` (BooleanField)
  - `reason` (CharField)
  - `open_time`, `close_time` (CharFields, optional overrides)

### 3.5 Booking Model (`apps.bookings.Booking`)
Appointments and reservation lifecycle.
- `id` (UUID, Primary Key)
- `booking_reference` (CharField, unique, auto-generated e.g. `'BK-8901'`)
- `business` (ForeignKey -> `Business`)
- `service` (ForeignKey -> `Service`, on_delete PROTECT)
- `customer` (ForeignKey -> `User`, null=True, blank=True)
- `customer_name` (CharField, max 150)
- `customer_email` (EmailField)
- `customer_phone` (CharField, max 30)
- `booking_date` (DateField)
- `start_time` (CharField, `'HH:MM'`)
- `end_time` (CharField, `'HH:MM'`)
- `status` (CharField: `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`)
- `total_price` (DecimalField, snapshot of service price at booking)
- `notes` (TextField)
- `cancellation_reason` (TextField)
- `created_at`, `updated_at` (DateTimeFields)

### 3.6 Review Model (`apps.reviews.Review`)
Verified feedback and owner communications.
- `id` (UUID, Primary Key)
- `business` (ForeignKey -> `Business`)
- `booking` (OneToOneField -> `Booking`, null=True)
- `customer` (ForeignKey -> `User`, null=True)
- `customer_name` (CharField)
- `rating` (DecimalField, 1.0 - 5.0)
- `comment` (TextField)
- `reply` (TextField, owner response)
- `created_at` (DateTimeField)

---

## 4. API Endpoints Catalog

| HTTP Method | Endpoint | Description | Permission | Payload / Response |
|---|---|---|---|---|
| `GET` | `/api/health/` | Service health status | AllowAny | `{"status": "healthy", "service": "..."}` |
| `POST` | `/api/auth/register/` | Register user | AllowAny | Body: `{email, password, role, first_name, ...}` |
| `POST` | `/api/auth/login/` | Obtain JWT tokens | AllowAny | Body: `{email, password}` -> `{access, refresh, user}` |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access | AllowAny | Body: `{refresh}` -> `{access}` |
| `GET` | `/api/business/me/` | Owner business profile | IsBusinessOwner | Returns business profile |
| `PUT/PATCH` | `/api/business/profile/` | Update profile | IsBusinessOwner | Updates business info |
| `GET` | `/api/business/directory/` | Browse businesses | AllowAny | List of active businesses (for Flutter) |
| `GET` | `/api/services/` | List services | AllowAny | Filterable by `?business_id=` |
| `POST` | `/api/services/` | Create new service | IsBusinessOwner | Body: `{name, price, duration_minutes, ...}` |
| `PUT/PATCH` | `/api/services/{id}/` | Update service | IsBusinessOwner | Updates existing service |
| `DELETE` | `/api/services/{id}/` | Delete service | IsBusinessOwner | Removes service |
| `GET` | `/api/availability/` | Get weekly schedule | IsBusinessOwner | Returns settings & 7-day schedule |
| `PUT` | `/api/availability/` | Update schedule | IsBusinessOwner | Bulk updates open/close/breaks |
| `GET` | `/api/availability/slots/` | Public time slots | AllowAny | Query: `?business_id=&date=YYYY-MM-DD` |
| `GET` | `/api/bookings/` | List bookings | Authenticated | Owner: business bookings; Customer: my bookings |
| `POST` | `/api/bookings/` | Create appointment | AllowAny | Body: `{business, service_id, booking_date, start_time, ...}` |
| `PATCH` | `/api/bookings/{id}/status/` | Update status | IsBusinessOwner | Body: `{status: "confirmed"}` |
| `GET` | `/api/reviews/` | List reviews | AllowAny | Filterable by `?business_id=` |
| `POST` | `/api/reviews/{id}/reply/` | Reply to review | IsBusinessOwner | Body: `{reply: "Thank you!"}` |
| `GET` | `/api/analytics/summary/` | Dashboard metrics | IsBusinessOwner | Returns revenue, bookings, trend, top services |

---

## 5. Availability & Slot Generation Logic

The slot calculator in `apps.availability.views.AvailableSlotsPublicView` generates bookable intervals using the following workflow:
1. Validates `target_date` and retrieves `AvailabilitySettings`.
2. Checks for `SpecialDate` overrides. If closed, returns `slots: []`.
3. Computes system day of week (`(python_weekday + 1) % 7`).
4. Checks `DaySchedule.is_open`. If closed, returns `slots: []`.
5. Determines operational boundaries: `open_time` to `close_time`.
6. Iterates in steps of `slot_duration_minutes`.
7. Filters out slots falling within `break_start` and `break_end`.
8. Returns clean array of formatted slots: `["09:00", "09:30", "10:00", ...]`.

---

## 6. Notification Hooks & Signals

Django signals in `apps.notifications` provide decoupled event hooks:
- **`booking_created` Signal**:
  - Dispatched immediately upon successful booking insertion.
  - Receiver logs and formats customer confirmation email payload and business owner push notification hook.
- **`booking_status_changed` Signal**:
  - Dispatched on status transition (`confirmed`, `completed`, `cancelled`).
  - Receiver triggers customer SMS / push alert with updated booking reference and notes.

---

## 7. Seed Data & Automated Testing

### Management Command
```bash
python manage.py seed_data
```
Populates the database with Marcus Sterling, Apex Grooming Lounge, 6 signature grooming services, weekly schedules (Mon-Sat open, Sun closed), 8 bookings across all statuses, and verified reviews with owner replies.

### Automated Test Suite
`backend/test_api_endpoints.py` tests:
- `/api/health/` (200 OK)
- Business owner login & JWT generation
- Profile retrieval `/api/business/me/`
- Service catalog listing
- Weekly availability schedules
- Public time slot calculation
- Appointment status updates (`PATCH /status/`)
- Analytics revenue and KPI calculations
- Customer registration & login flow
- Customer directory browsing
- Customer booking creation and reference verification
- Customer appointment history retrieval

**Result**: 100% test pass across all endpoints.
