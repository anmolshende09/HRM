# HRMS Frontend

React (Vite) + Tailwind CSS frontend for the Human Resource Management System, styled
with a token system adapted from an Apple-inspired design analysis (see `tailwind.config.js`
for the full color/type/spacing/radius scale).

## Setup

```bash
cd frontend
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your running backend
npm run dev                 # starts on http://localhost:5173
```

Make sure the backend (see `hrms-backend`) is running on the URL set in `.env`
(default `http://localhost:5000/api`), and that you've run its `npm run seed`
script so you have a login: `admin@hrms.local` / `Admin@123`.

## Folder Structure

```
src/
├── assets/
├── components/
│   ├── common/       # Button, Modal, ConfirmDialog, Table, SearchBar, Pagination,
│   │                  # StatusBadge, StatCard, EmptyState, LoadingSpinner, FormField
│   ├── dashboard/     # DepartmentDistribution, EmployeesOnLeave, RecentLeaveRequests,
│   │                  # AnnouncementsWidget, QuickActions
│   ├── employee/       # EmployeeForm
│   ├── leave/           # LeaveForm, LeaveReviewModal
│   └── attendance/       # (attendance views live inline in pages/Attendance.jsx)
├── pages/                  # Login, Dashboard, Employees, Departments, Attendance,
│                             # Leaves, Announcements, NotFound
├── layouts/                  # DashboardLayout, Sidebar, Topbar
├── routes/                     # ProtectedRoute (auth + role gating)
├── hooks/                       # useDebounce
├── services/                     # api.js (axios + JWT interceptor) + one service per module
├── utils/                         # format.js (dates, initials, title case)
├── constants/                      # roles.js, options.js
└── context/                         # AuthContext, ToastContext
```

## Design System Notes

- Tokens (colors, type scale, spacing, radii, elevation) are lifted directly from the
  Apple design analysis and mapped into `tailwind.config.js`.
- The source system is a **marketing site** language (hero tiles, product photography).
  For this dashboard app, the token *values* were kept but the *components* were
  reinterpreted for data-app patterns: cards, tables, forms, sidebars — none of which
  exist in the source spec.
- **Status colors (success/danger/warning)** and **form validation error states** are
  additions not present in the source design system (documented as a known gap) —
  they reuse Apple's own system-color palette (`#34c759` / `#ff3b30` / `#ff9500`) to
  stay visually consistent with the rest of the token set.
- The single system shadow (`shadow-product`) is reserved per the source spec and
  intentionally unused on cards/buttons — elevation is communicated via color and
  a hairline border instead, matching the "no shadows on chrome" rule.
- Inter is loaded as the SF Pro substitute (see `index.html`), with `ss03` font
  features enabled to approximate SF Pro's rounded characters.

## Role-Based Access

- **Admin / HR Manager**: full access, including `/employees` and `/departments`
  (gated via `ProtectedRoute roles={MANAGER_ROLES}`).
- **Employee**: Dashboard, Attendance (own history), Leave (apply + track), Announcements
  (read-only). Attempting to visit `/employees` or `/departments` redirects to `/dashboard`.

## Known Follow-ups

- Employee-side "mark my own attendance" (listed as optional in the spec) isn't wired
  into the UI yet — the backend route already allows the `employee` role to call
  `POST /api/attendance`, so this is a small addition to `Attendance.jsx` if wanted.
- Employee profile view/self-service page isn't built yet (only Admin/HR-side employee
  management exists) — small follow-up if individual profile editing is needed.
