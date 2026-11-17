# Business Owner Web Dashboard (React)

A modern, responsive web dashboard built for business owners to manage services, availability schedules, appointments, and performance analytics.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Icons**: Lucide React
- **API Client**: Modular Data Layer (`api.ts`) supporting both **Client-side Mock Mode** and **Live Django REST API** via JWT Bearer authentication.

---

## Key Features

1. **Dashboard Overview (`/`)**:
   - KPIs: Today's Appointments, Pending Approvals, Total Gross Revenue, Customer Rating.
   - Immediate "Action Required" section with one-click **Approve** and **Decline** for pending bookings.
   - Today's chronological schedule agenda with client contact info.
   - Quick navigation shortcuts.

2. **Bookings Management (`/bookings`)**:
   - Status filtering tabs: All, Pending, Confirmed, Completed, Cancelled.
   - Real-time search across customer names, reference numbers (e.g. `BK-8901`), and services.
   - Date range selector (All Dates, Today, Tomorrow, Upcoming).
   - Modal inspection of complete customer details, notes, and timestamps.
   - Action buttons: Approve, Mark Completed, and Cancel with custom reason prompt.

3. **Services Catalog (`/services`)**:
   - Grid cards of services with categories, durations, and pricing.
   - "Add New Service" and "Edit Service" modals with validation.
   - Quick one-click toggle to show/hide services from customer booking apps.
   - Delete service with safety modal confirmation.

4. **Availability & Working Hours (`/availability`)**:
   - Day-by-day weekly business hours editor (Monday through Sunday).
   - Configurable opening times, closing times, and lunch/midday breaks.
   - One-click "Copy Mon to Weekdays" helper.
   - Slot duration settings (15m, 30m, 45m, 60m), turnover buffers, and advance booking window.
   - Special holiday exceptions and custom date overrides.
   - **Interactive Live Slot Simulator**: Preview the exact time buttons rendered for mobile app customers.

5. **Analytics & Reports (`/analytics`)**:
   - Revenue and appointment volume metrics with % change indicators.
   - 7-day revenue trend bar chart visualizer.
   - Appointment lifecycle status distribution breakdown.
   - Top-performing services leaderboard (ranked by booking count and gross revenue).
   - Verified customer reviews feed with 5-star rating breakdown and public business response tool.

6. **Settings & Backend Configuration (`/settings`)**:
   - Edit business profile information (name, address, category, bio, phone, email).
   - Notification triggers (email on new booking, push on cancellation, morning briefing).
   - **Backend Mode Switcher**: Toggle between **Mock Demo Mode** (persists in browser `localStorage`) and **Live Django REST API** (`http://127.0.0.1:8000/api`).
   - Backend health ping tester and demo data reset button.

7. **Authentication (`/login`, `/register`)**:
   - JWT-based authentication flow with Bearer tokens.
   - **1-Click Quick Demo Login** button for instant reviewer evaluation without manual typing.
   - Full onboarding registration form for new business owners.

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.
