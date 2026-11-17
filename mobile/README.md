# BookEase - Customer Mobile Application (Flutter)

A cross-platform mobile application built with **Flutter 3.x** and **Dart** for customer self-service booking. Consumes the same centralized **Django REST API** as the React Business Owner Dashboard.

---

## 🎨 Visual Aesthetic & Design System

Crafted to match the modern, minimalist card aesthetic inspired by Donezo and Nexus:
- **Primary Hero Accent**: Deep Forest Green (`#144E3E`)
- **Vibrant Mint Detail**: Lime Mint (`#A3E635`) & Subtle Mint Tint (`#ECFDF5`)
- **Canvas**: Clean soft cool gray (`#F4F5F7`)
- **Surface**: Pure White Cards (`#FFFFFF`) with 16–24px rounded corners and subtle hairline borders (`#E2E8F0`).
- **Status Badges**:
  - `Pending Approval`: Soft Amber (`#FEF3C7` / `#D97706`)
  - `Confirmed`: Soft Emerald (`#D1FAE5` / `#059669`)
  - `Completed`: Soft Slate (`#F1F5F9` / `#475569`)
  - `Cancelled`: Soft Rose (`#FFE4E6` / `#E11D48`)

---

## 📱 Features & User Flows

1. **Customer Authentication**:
   - Customer login and registration with JWT tokens.
   - Persistent session storage via `SharedPreferences`.
   - Pre-filled credentials for instant testing (`totok.michael@example.com` / `CustomerPass123!`).

2. **Explore & Browse Businesses**:
   - Category filtering chips (*Barbershop*, *Spa & Facial*, *Haircut*, *Wellness*).
   - Dynamic search input.
   - Featured Partner hero banner highlighting ratings, review counts, and location.

3. **Services Menu & Reviews**:
   - Detailed service descriptions, durations (`45m`), and pricing (`$45.00`).
   - Verified customer ratings and owner replies.

4. **Time Slot Reservation**:
   - 14-day interactive date selector carousel.
   - Dynamic slot generation calculated against business operating schedules, break hours, and buffer times.
   - Contact detail confirmation and special instruction notes.

5. **Instant Booking Confirmation**:
   - Unique alphanumeric booking reference pill (e.g. `BK-8901`).
   - Notification confirmation hook feedback.

6. **Appointment History**:
   - Segregated tabs for *Upcoming* vs *Past & Cancelled* appointments.
   - In-app cancellation flow with reason capture.

---

## 🏗️ Project Architecture

```
mobile/
├── android/
│   └── app/src/main/AndroidManifest.xml
├── lib/
│   ├── constants/
│   │   ├── api_constants.dart      # Centralized API endpoints & host switcher
│   │   └── colors.dart             # Brand color palette & status tokens
│   ├── models/
│   │   ├── user_model.dart         # Customer user model
│   │   ├── business_model.dart     # Business profile model
│   │   ├── service_model.dart      # Catalog service model
│   │   ├── booking_model.dart      # Booking appointment model
│   │   └── review_model.dart       # Customer review model
│   ├── services/
│   │   ├── api_service.dart        # HTTP client with JWT header injection & fallback data
│   │   ├── auth_provider.dart      # User auth & session state provider
│   │   └── booking_provider.dart   # Booking state & directory provider
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── business/
│   │   │   └── business_detail_screen.dart
│   │   ├── booking/
│   │   │   ├── select_slot_screen.dart
│   │   │   └── booking_confirmation_screen.dart
│   │   ├── history/
│   │   │   └── booking_history_screen.dart
│   │   ├── profile/
│   │   │   └── profile_screen.dart
│   │   └── main_navigation_shell.dart
│   └── main.dart                   # App entrypoint & theme setup
├── pubspec.yaml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (3.x+)
- Android Studio or VS Code with Flutter extension
- An active Android Emulator or physical device

### Running the App
```bash
cd mobile

# Fetch dependencies
flutter pub get

# Run on Android Emulator (default host http://10.0.2.2:8000)
flutter run

# Or run on Chrome / Web preview
flutter run -d chrome
```

### API Connection Host Notes
- **Android Emulator**: Uses `http://10.0.2.2:8000/api` to connect to host Django server.
- **Physical Device**: Update to your local LAN IP (e.g. `http://192.168.1.xxx:8000/api`) either in `ApiConstants.baseUrl` or interactively in the app's **Profile > Backend API Host** modal.
