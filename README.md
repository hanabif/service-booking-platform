# Multi-Tenant Service Booking Platform (End-to-End MVP)

A complete, enterprise-grade, end-to-end service booking solution built across three modern application tiers:
1. **Web Dashboard (`frontend/`)**: React 19 + TypeScript + Vite + Tailwind CSS v4 business owner dashboard (styled in the Donezo / Nexus card aesthetic).
2. **Backend REST API (`backend/`)**: Django 5.1 + Django REST Framework + PostgreSQL/SQLite with JWT authentication, role-based access control (`admin`, `business_owner`, `customer`), and email/push notification signals.
3. **Customer Mobile App (`mobile/`)**: Flutter + Dart Android customer application for exploring service businesses, reserving dynamic time slots, and managing appointment history.

---

## 🏛️ System Architecture

```
service-booking-platform/
├── frontend/                     # React 19 Business Owner Dashboard
│   ├── src/                      # Pages, components, api client, types
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Django 5.1 REST Framework API
│   ├── apps/
│   │   ├── authentication/       # Custom User model, JWT views, permissions
│   │   ├── businesses/           # Business profile & public directory
│   │   ├── services/             # Services catalog & pricing
│   │   ├── availability/         # Weekly schedules & dynamic slot generator
│   │   ├── bookings/             # Appointments lifecycle & status updates
│   │   ├── reviews/              # Verified reviews & owner replies
│   │   ├── notifications/        # Signal handlers (email / push hooks)
│   │   └── analytics/            # Revenue, metrics & top services
│   ├── core/                     # Project settings, wsgi, asgi, root urls
│   ├── Dockerfile
│   ├── requirements.txt
│   └── test_api_endpoints.py    # Automated end-to-end test suite
├── mobile/                       # Flutter Customer Mobile App
│   ├── android/                  # Android manifest & gradle configuration
│   ├── lib/
│   │   ├── constants/            # API endpoints & brand color tokens
│   │   ├── models/               # Data models (User, Business, Service, Booking)
│   │   ├── services/             # HTTP client with JWT injection & state providers
│   │   └── screens/              # Auth, Home, Services, Slots, History, Profile
│   └── pubspec.yaml
├── docs/                         # Technical specifications & documentation
│   └── FRONTEND_DOCUMENTATION.md # Frontend architecture & API contract
├── docker-compose.yml            # Multi-container orchestration (DB + Backend)
└── README.md
```

---

## 🌿 Git Branching Strategy

Each milestone was engineered on an isolated feature branch and integrated into `main`:
- **`main`**: Production-ready unified codebase.
- **`feature/frontend-dashboard`**: React business owner web dashboard.
- **`feature/backend-api`**: Django REST Framework API, models, seed data & tests.
- **`feature/mobile-app`**: Flutter customer Android mobile application.

---

## 👥 Seeded Demo Credentials

| Role | Email | Password | Target App |
|---|---|---|---|
| **Business Owner** | `marcus@apexgrooming.com` | `ApexPass123!` | Web Dashboard |
| **Customer 1** | `totok.michael@example.com` | `CustomerPass123!` | Flutter Mobile App |
| **Customer 2** | `alexandra.deff@example.com` | `CustomerPass123!` | Flutter Mobile App |
| **Admin** | `admin@platform.com` | `AdminPass123!` | Django Admin (`/admin/`) |

---

## 🚀 Quickstart: Docker Compose (Full Stack)

To run the PostgreSQL database and Django REST API with auto-migrations and seed data in Docker:

```bash
# Build and run backend + PostgreSQL
docker compose up --build
```
- API server accessible at: `http://localhost:8000/`
- API health check: `http://localhost:8000/api/health/`

---

## 💻 Manual Setup & Local Development

### 1. Backend REST API (`backend/`)
```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and seed sample business data
python manage.py makemigrations authentication businesses services availability bookings reviews notifications analytics
python manage.py migrate
python manage.py seed_data

# Run automated API test suite (Owner + Customer flows)
python test_api_endpoints.py

# Launch development server
python manage.py runserver 8000
```

### 2. Frontend Web Dashboard (`frontend/`)
```bash
cd frontend

# Install npm dependencies
npm install

# Run Vite development server
npm run dev
# Dashboard opens at: http://localhost:5173/

# Run production build & verify TypeScript
npm run build
```

### 3. Customer Mobile App (`mobile/`)
```bash
cd mobile

# Fetch Flutter dependencies
flutter pub get

# Run on Android emulator or physical device
flutter run

# Or launch Web preview
flutter run -d chrome
```

---

## 📑 Technical Documentation Links

- **Frontend Specification & Google Doc**: [FRONTEND_DOCUMENTATION.md](file:///c:/service-booking-platform/docs/FRONTEND_DOCUMENTATION.md)
- **Live Google Docs Sync**: [Google Docs Link](https://docs.google.com/document/d/1SBGDQvN8jIzcR52m7mbVkOaMitnZSBpStVwSeLwH4-w/edit)
- **Backend API Documentation**: [backend/README.md](file:///c:/service-booking-platform/backend/README.md)
- **Customer Mobile App Documentation**: [mobile/README.md](file:///c:/service-booking-platform/mobile/README.md)
