# Multi-Tenant Service Booking Platform (MVP)

A unified end-to-end service booking platform comprising:
- **Web Dashboard (`frontend/`)**: React 19 + TypeScript + Vite + Tailwind CSS for business owners to manage services, availability schedules, appointments, and view real-time analytics.
- **Backend API (`backend/`)**: Django 5 + Django REST Framework + PostgreSQL with JWT authentication, role-based access control (Admin, Business Owner, Customer), and notification hooks.
- **Customer Mobile App (`mobile/`)**: Flutter Android app for customers to browse businesses, book appointments, view booking history, and receive status confirmations.

---

## Architecture Overview

```
service-booking-platform/
├── frontend/             # React Business Owner Web Dashboard
├── backend/              # Django REST API + PostgreSQL
├── mobile/               # Flutter Customer Mobile App
├── .gitignore
└── README.md
```

## Branch Strategy

- `main`: Production-ready, stable releases.
- `feature/frontend-dashboard`: React web dashboard for business owners.
- `feature/backend-api`: Django REST Framework backend API & PostgreSQL models.
- `feature/mobile-app`: Flutter Android customer mobile app.
