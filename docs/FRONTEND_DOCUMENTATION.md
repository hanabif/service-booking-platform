# Service Booking Platform - Frontend Web Dashboard Documentation

**Author:** Single-Stack Lead Developer  
**Status:** MVP Implemented & Verified  
**Branch:** `feature/frontend-dashboard`  
**Repository:** `service-booking-platform`  
**Target Surface:** Business Owner Web Dashboard  

---

## 1. Executive Summary

This document specifies the architecture, design system, component hierarchy, data models, and API integration contracts for the **Business Owner Web Dashboard** of the Multi-Tenant Service Booking Platform.

The dashboard empowers service business owners (barbershops, spas, beauty salons, wellness studios) to:
- Authenticate securely via JWT and access an executive overview of daily business operations.
- Review, filter, approve, complete, or decline incoming customer appointment requests in real-time.
- Configure service offerings, durations, prices, and visibility.
- Set up weekly working schedules, midday break intervals, appointment slot increments, and special holiday exceptions.
- Monitor business health through revenue trends, capacity metrics, and verified customer reviews.
- Seamlessly toggle between **Client-Side Mock Demo Mode** (with `localStorage` persistence) and the **Live Django REST API** (`http://127.0.0.1:8000/api`).

---

## 2. Technology Stack & Project Structure

### 2.1 Tech Stack
- **Framework:** React 19 + TypeScript (strict mode with `verbatimModuleSyntax`)
- **Build Tool:** Vite 8 (build output < 400ms)
- **Styling:** Tailwind CSS v4 with custom utility classes (`@tailwindcss/vite`)
- **Routing:** React Router v7 (client-side SPA navigation with protected routes)
- **Icons:** Lucide React
- **API & State:** Modular fetch/Axios-style data access layer with local storage caching

### 2.2 Directory Structure
```
service-booking-platform/
├── docs/
│   └── FRONTEND_DOCUMENTATION.md      # This specification document
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/                    # Static assets & brand logos
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.tsx          # Status pills (Pending, Confirmed, Completed, Cancelled)
│   │   │   │   ├── Modal.tsx          # Accessible modal dialog with backdrop & escape listener
│   │   │   │   └── StatCard.tsx       # KPI cards (Hero Forest Green & Clean White styles)
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.tsx# Main layout wrapper with pending badge counter
│   │   │       ├── Header.tsx         # Floating header with search (⌘F), actions & user capsule
│   │   │       └── Sidebar.tsx        # Clean white sidebar with mobile app promo widget
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Authentication provider & user session state
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx      # Revenue trends, top services & customer reviews
│   │   │   ├── AvailabilityPage.tsx   # Working hours, breaks & Flutter slot simulator
│   │   │   ├── BookingsPage.tsx       # Appointment filtering, inspection & approvals
│   │   │   ├── DashboardPage.tsx      # Executive command center & live session timer
│   │   │   ├── LoginPage.tsx          # Owner login & 1-click reviewer demo access
│   │   │   ├── RegisterPage.tsx       # New business owner onboarding
│   │   │   ├── ServicesPage.tsx       # Service offerings & pricing catalog
│   │   │   └── SettingsPage.tsx       # Profile, notification hooks & Django API config
│   │   ├── services/
│   │   │   ├── api.ts                 # Dual-mode API client (Mock & Django REST adapter)
│   │   │   └── mockData.ts            # Realistic seed data (Apex Grooming Lounge)
│   │   ├── types/
│   │   │   └── index.ts               # Core domain interfaces
│   │   ├── App.tsx                    # Route definitions & protected route guards
│   │   ├── index.css                  # Tailwind styles & diagonal-hatched patterns
│   │   └── main.tsx                   # React root entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                           # Django REST API (Next Phase)
├── mobile/                            # Flutter Customer App (Next Phase)
├── .gitignore
└── README.md
```

---

## 3. Design System & Visual Rhythm

The visual design is modeled on premier SaaS dashboards (**Donezo**, **Nexus**, and **Mondays**):

### 3.1 Color Palette
- **Canvas Neutral:** `#f4f5f7` (light, cool-tinted grey providing soft contrast without harsh shadows).
- **Surface Containers:** Pure White (`#ffffff`) with `rounded-3xl` corners (border-radius: 24px) and subtle hairline borders (`border-slate-200/80`).
- **Primary Hero Accent:** Deep Forest Emerald (`#144e3e` / `#0f3c30`) representing precision, stability, and elegance.
- **Tonal Mints & Sages:** `#e8f7f0`, `#a7f3d0`, `#10b981` for active badges, standard chart bars, and positive indicators.
- **Warm Accents:** Soft Amber (`#fef3c7`, `#d97706`) for pending reviews, and Soft Rose (`#fee2e2`, `#dc2626`) for cancellations.
- **Typography:** System UI sans-serif stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`) with tight letter-spacing for headings and clear tabular numerals.

### 3.2 Visual Signature Elements
1. **Hero Stat Card:** A rich solid forest green card (`#144e3e`) displaying **Total Bookings (84)**, an arrow badge button (`↗`), and an `Increased by 18.5%` pill.
2. **Capsule Pill Chart:** Rounded pill bars representing 7-day booking volume, featuring standard days in soft mint, peak days in forest green, and available/future slots rendered with a **diagonal-striped hatched pattern** (`.pattern-stripes`).
3. **Active Session Timer:** A dark forest green card with an active digital clock (`00:45:00`), live pulse badge, and circular pause/finish controls.
4. **Mobile App Promotional Widget:** Positioned in the sidebar with a download badge for the upcoming customer Flutter Android app.

---

## 4. Domain Data Models (`src/types/index.ts`)

```typescript
export type UserRole = 'admin' | 'business_owner' | 'customer';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface DaySchedule {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_name: string;
  is_open: boolean;
  open_time: string;   // '09:00' (24-hour)
  close_time: string;  // '19:00' (24-hour)
  break_start?: string;// '13:00'
  break_end?: string;  // '14:00'
}

export interface AvailabilitySettings {
  slot_duration_minutes: number;
  buffer_time_minutes: number;
  advance_booking_days: number;
  weekly_schedule: DaySchedule[];
  special_dates: SpecialDate[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_reference: string; // e.g. "BK-8901"
  business_id: string;
  service_id: string;
  service: Service;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;     // 'YYYY-MM-DD'
  start_time: string;       // '09:30'
  end_time: string;         // '10:15'
  status: BookingStatus;
  total_price: number;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
}
```

---

## 5. Screen Specifications & Capabilities

### 5.1 Authentication (`/login`, `/register`)
- **Login Flow:** Accepts email and password, exchanges for JWT token pair.
- **Instant Demo Review Button:** Allows immediate evaluation as *Marcus Sterling (Apex Grooming Lounge)* without manual data entry.
- **Registration Form:** Onboards new business owners with business name, industry category, email, and password.

### 5.2 Dashboard Overview (`/`)
- **Top Metric Cards:** Total Bookings (84), Completed Bookings (28), Today's Appointments (6), and Pending Approvals (3).
- **Weekly Analytics Capsule Chart:** Visualizes weekly workload and peak hours.
- **Reminders / Up Next:** Highlights the immediate next appointment with quick session start action.
- **Services Menu Widget:** Quick access to active service list and pricing.
- **Customer Requests:** Pending booking cards with one-click **Approve** and **Decline** triggers.
- **Capacity & Completion Gauge:** Semi-circular gauge showing 96% fulfillment.
- **Active Session Timer:** Live stopwatch for in-progress services.

### 5.3 Bookings Management (`/bookings`)
- **Lifecycle Tabs:** All, Pending, Confirmed, Completed, Cancelled with dynamic count badges.
- **Search & Filter:** Real-time search across customer names, reference codes (`BK-8901`), service titles, and phone numbers.
- **Date Selector:** Today, Tomorrow, Upcoming, or All Dates.
- **Detail Inspection Modal:** Displays client contact, price breakdown, notes, and cancellation reason.
- **Actions:** Instant Approve, Complete, or Cancel (with required reason prompt).

### 5.4 Services Catalog (`/services`)
- **Card Grid:** Displays services with duration pills, category labels, prices, and status badges.
- **Add & Edit Modal:** Form validation for service title, duration (15m–120m), price, and description.
- **Quick Toggle:** Instant show/hide switch to toggle visibility in customer apps.
- **Deletion Protection:** Confirmation dialog before permanent deletion.

### 5.5 Availability & Working Hours (`/availability`)
- **Weekly Schedule Editor:** Day-by-day open/close toggles, operating hours, and midday break intervals.
- **Copy Monday Helper:** Single click copies Monday hours across all weekdays.
- **Slot Config:** Sets base slot duration (15, 30, 45, 60 mins), turnover buffer time, and advance booking window.
- **Holiday Overrides:** Specific date exception list (e.g., Thanksgiving, Christmas).
- **Interactive Mobile Slot Simulator:** Live preview of bookable slot buttons generated for customers in the Flutter app.

### 5.6 Business Analytics (`/analytics`)
- **Revenue KPIs:** Total gross revenue, bookings volume, and on-time completion rate.
- **7-Day Revenue Trend:** Bar chart breakdown of daily revenue and booking volume.
- **Status Distribution:** Progress bar visualization of appointment lifecycle.
- **Top Services Leaderboard:** Services ranked by bookings count and gross revenue.
- **Customer Reviews Feed:** 5-star ratings breakdown and verified customer feedback with owner response tool.

### 5.7 Settings & API Configuration (`/settings`)
- **Profile Form:** Updates business name, category, address, phone, email, and description.
- **Notification Hooks:** Toggles for new booking email alerts, push notifications, and daily morning briefings.
- **Dual-Mode Switcher:**
  - *Mock Mode:* Stores all mutations in browser `localStorage`.
  - *Django REST API:* Routes requests to `http://127.0.0.1:8000/api` with JWT Bearer tokens.
  - *Health Ping Tester:* Verifies live backend connection with one click.
  - *Reset Seed Data:* Restores initial default data state.

---

## 6. Django REST API Integration Contract

The frontend data service (`src/services/api.ts`) is designed to consume the upcoming Django REST API endpoints seamlessly:

| HTTP Method | Endpoint | Description | Request Body / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | JWT token acquisition | `{ email, password }` | `{ user, business, access, refresh }` |
| `POST` | `/api/auth/register/` | Register new business owner | `{ email, password, first_name, last_name, business_name, category }` | `{ user, business, access, refresh }` |
| `GET` | `/api/business/profile/` | Fetch business profile | Header: `Bearer <token>` | `Business` object |
| `PATCH` | `/api/business/profile/` | Update business profile | Partial `Business` object | Updated `Business` object |
| `GET` | `/api/services/` | List all services for business | Header: `Bearer <token>` | `Service[]` |
| `POST` | `/api/services/` | Create a new service | `{ name, category, price, duration_minutes, description, is_active }` | `Service` object |
| `PATCH` | `/api/services/:id/` | Update service details or toggle | Partial `Service` object | Updated `Service` object |
| `DELETE` | `/api/services/:id/` | Remove a service | Header: `Bearer <token>` | `204 No Content` |
| `GET` | `/api/availability/` | Get schedule & slot settings | Header: `Bearer <token>` | `AvailabilitySettings` |
| `PUT` | `/api/availability/` | Update schedule & slot settings | `AvailabilitySettings` object | Updated `AvailabilitySettings` |
| `GET` | `/api/bookings/` | List appointments (filterable) | `?status=pending&date=2026-11-17` | `Booking[]` |
| `PATCH` | `/api/bookings/:id/status/` | Approve, complete, or cancel booking | `{ status: "confirmed" \| "completed" \| "cancelled", cancellation_reason? }` | Updated `Booking` object |
| `GET` | `/api/analytics/summary/` | Get aggregated business metrics | Header: `Bearer <token>` | `AnalyticsSummary` |
| `GET` | `/api/reviews/` | List customer reviews | Header: `Bearer <token>` | `Review[]` |
| `POST` | `/api/reviews/:id/reply/` | Publish owner response | `{ reply: string }` | Updated `Review` object |

---

## 7. Setup & Run Instructions

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# The app opens at http://localhost:5173

# 4. Production build & type check
npm run build
# Verified output in 347ms with 0 errors
```
