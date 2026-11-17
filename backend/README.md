# Service Booking Platform - Backend API (Django + DRF)

A robust, enterprise-grade RESTful API built with **Django 5.1** and **Django REST Framework (DRF)**. Designed as the centralized data and business logic hub powering both the **React Business Owner Dashboard** and the **Flutter Customer Mobile App**.

---

## 🚀 Key Features

- **JWT Authentication & RBAC**:
  - Secure authentication via `djangorestframework-simplejwt`.
  - Role-based permissions: `admin`, `business_owner`, `customer`.
- **Multi-Tenant Business Profiles**:
  - Business profiles, categories, operating hours, geolocation, ratings, and stats.
- **Dynamic Services & Catalog**:
  - Duration, tiered pricing, categories, popular flags, and real-time status.
- **Configurable Availability Engine**:
  - Weekly recurring schedules (e.g. Mon-Sat 09:00-19:00, lunch break slots).
  - Special date overrides / closures.
  - Slot generator calculating available intervals based on service duration and buffer time.
- **Full Booking Lifecycle**:
  - Reference generation (e.g. `BK-8901`), double-booking prevention, status lifecycle (`pending` ➔ `confirmed` ➔ `completed` / `cancelled`).
- **Notification Hooks & Event Architecture**:
  - Django signals dispatching email hooks and push notification events on booking creation and status updates.
- **Analytics & Revenue Reporting**:
  - Aggregated metrics: gross revenue, total appointments, confirmation rates, and top performing services.
- **PostgreSQL / SQLite Dual Engine**:
  - Seamless zero-config local testing on SQLite, enterprise PostgreSQL 16 in Docker/production.

---

## 📦 Tech Stack

- **Python**: 3.13+
- **Django**: 5.1.x
- **Django REST Framework**: 3.17.x
- **JWT**: `djangorestframework-simplejwt`
- **Database**: PostgreSQL 16 (production/Docker) & SQLite3 (development)
- **CORS**: `django-cors-headers`

---

## 📋 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health/` | Service health status check | No |
| `POST` | `/api/auth/register/` | Register new customer or business owner | No |
| `POST` | `/api/auth/login/` | Obtain JWT access + refresh tokens | No |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access token | No |
| `GET` | `/api/business/me/` | Fetch current business owner's profile | Owner |
| `PUT/PATCH` | `/api/business/profile/` | Update business profile details | Owner |
| `GET` | `/api/business/directory/` | Public business directory | No |
| `GET` | `/api/services/` | List services (filterable by `business_id`) | Optional |
| `POST` | `/api/services/` | Create a new service | Owner |
| `GET` | `/api/availability/` | Get weekly schedule and buffer rules | Owner |
| `PUT` | `/api/availability/` | Update weekly schedule | Owner |
| `GET` | `/api/availability/slots/` | Query open slots for a specific date | No |
| `GET` | `/api/bookings/` | List bookings (Owner: business; Customer: user) | Authenticated |
| `POST` | `/api/bookings/` | Book a time slot | Authenticated / Public |
| `PATCH` | `/api/bookings/{id}/status/` | Update booking status (`confirmed`, etc.) | Owner |
| `GET` | `/api/reviews/` | List verified customer reviews | No |
| `POST` | `/api/reviews/{id}/reply/` | Owner reply to customer review | Owner |
| `GET` | `/api/analytics/summary/` | Business dashboard analytics & revenue metrics | Owner |

---

## 👥 Demo Accounts (Seeded)

| Role | Email | Password |
|---|---|---|
| **Business Owner** | `marcus@apexgrooming.com` | `ApexPass123!` |
| **Customer 1** | `totok.michael@example.com` | `CustomerPass123!` |
| **Customer 2** | `alexandra.deff@example.com` | `CustomerPass123!` |
| **Admin** | `admin@platform.com` | `AdminPass123!` |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Virtual environment tool (`venv`)

### 2. Setup Virtual Environment
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Migrations & Seed Data
```bash
python manage.py makemigrations authentication businesses services availability bookings reviews notifications analytics
python manage.py migrate
python manage.py seed_data
```

### 5. Verify API Suite
```bash
python test_api_endpoints.py
```

### 6. Start Development Server
```bash
python manage.py runserver 8000
```
Server runs at `http://127.0.0.1:8000/`.

---

## 🐳 Running with Docker Compose

From the root directory:
```bash
docker compose up --build
```
This automatically boots:
- PostgreSQL 16 on port `5432`
- Django REST API on port `8000` (auto-migrated and seeded)
