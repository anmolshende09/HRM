# HRMS — Human Resource Management System

A modern, full-stack Human Resource Management System that lets organizations manage employees, departments, attendance, leave requests, and company announcements through a centralized, role-based dashboard.

Built with a **React (Vite) + Tailwind CSS** frontend and a **Node.js / Express / MongoDB** REST API backend, styled with a token system adapted from an Apple-inspired design analysis.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Overview]
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Features](#features)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Security](#security)
- [Known Follow-ups](#known-follow-ups)
- [Why This Scope](#why-this-scope)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local or hosted, e.g. MongoDB Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm run seed                # creates a default admin + sample departments
npm run dev                  # starts the API on http://localhost:5000
```

### `npm run seed` does

Runs `backend/utils/seed.js`, which connects to the database configured in `.env` and:

#### Default Login Credentials

| Field | Value |
|---|---|
| Email | `admin@hrms.local` |
| Password | `Admin@123` |
| Role | `admin` |

| Email | `hr@hrms.local` |
| Password | `HRManager@123` |
| Role | `HR Manager` |

| Email | `employee@hrms.local` |
| Password | `Employee@123` |
| Role | `Employee` |

Checks for a user with email `admin@hrms.local` — if none exists, creates one with the `admin` role (password hashed via bcrypt, same as any other user).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_BASE_URL (default: http://localhost:5000/api)
npm run dev                # starts the app on http://localhost:5173
```

Open `http://localhost:5173` and log in with the seeded admin credentials from the backend step above (`admin@hrms.local` / `Admin@123`), or any user you register via the API.


---

## User Roles & Permissions

| Capability | Admin | HR Manager | Employee |
|---|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ |
| Manage employees (add/edit/delete) | ✅ | ✅ (no delete) | ❌ |
| Manage departments | ✅ | ✅ (no delete) | ❌ |
| Mark attendance (for others) | ✅ | ✅ | ❌ |
| View own attendance | ✅ | ✅ | ✅ |
| Approve/reject leave requests | ✅ | ✅ | ❌ |
| Apply for leave | — | — | ✅ |
| Create/edit/delete announcements | ✅ | ✅ | ❌ |
| Read announcements | ✅ | ✅ | ✅ |

Role checks are enforced in three places: the backend's `authorize(...roles)` middleware, the frontend's route-level `ProtectedRoute`, and the frontend's navigation (managers-only links are hidden from employees).

---


## Overview

HRMS covers the core workflows expected in a day-to-day HR tool:

- **Employee management** — add, edit, search, and paginate through employee records, with optional profile pictures
- **Department management** — organize the org chart, with live employee counts
- **Attendance tracking** — mark present/absent/half-day/on-leave, view history and attendance percentage
- **Leave management** — employees apply for leave, managers approve or reject
- **Announcements** — company-wide updates, admin/HR authored
- **Dashboard** — a single-glance overview of stat cards, department distribution, who's on leave, recent requests, and announcements

It intentionally does **not** implement payroll, recruitment, asset management, or accounting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, React Router, Axios, Lucide React Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| File Uploads | Multer |

---

## Project Structure

```
hrms/
├── backend/                    # Node/Express/MongoDB REST API
│   ├── config/                  # DB connection, Multer upload config
│   ├── controllers/              # Route handler logic (auth, employees, departments,
│   │                               # attendance, leaves, announcements, dashboard)
│   ├── middleware/                 # JWT auth guard, role guard, centralized error handler
│   ├── models/                      # Mongoose schemas: User, Employee, Department,
│   │                                  # Attendance, LeaveRequest, Announcement
│   ├── routes/                        # Express routers, one per module
│   ├── utils/                          # asyncHandler, generateToken, seed script
│   ├── validators/                      # express-validator rule sets
│   ├── uploads/employees/                # Uploaded profile pictures (static-served)
│   ├── server.js                          # App entry point
│ 
│
└── frontend/                   # React (Vite) + Tailwind CSS SPA
    ├── src/
    │   ├── components/           # common/ (Button, Modal, Table, StatusBadge, etc.),
    │   │                           # dashboard/, employee/, leave/ reusable pieces
    │   ├── pages/                  # Login, Dashboard, Employees, Departments,
    │   │                            # Attendance, Leaves, Announcements, NotFound
    │   ├── layouts/                  # DashboardLayout, Sidebar, Topbar
    │   ├── routes/                    # ProtectedRoute (auth + role gating)
    │   ├── services/                   # Axios instance + one API service per module
    │   ├── context/                     # AuthContext, ToastContext
    │   ├── constants/, utils/, hooks/    # Roles/options, formatters, useDebounce
    │   └── App.jsx, main.jsx, index.css
    ├── tailwind.config.js         # Full design-token translation

```

---


## Features

### Dashboard
One aggregated API call renders: **Total Employees**, **Present Today**, **Absent Today**, and **On Leave** stat cards, plus **Department Distribution** (progress bars), **Employees on Leave Today**, **Recent Leave Requests**, **Announcements**, and **Quick Actions**.

### Employee Management
Add, edit, delete, and search employees (by name, email, or ID) with server-side pagination. Fields: Employee ID, Name, Email, Phone, Department, Designation, Joining Date, Salary (optional), Status, and an optional profile picture.

### Department Management
Create, edit, and delete departments. Deletion is blocked while employees are still assigned, and each department shows a live employee count.

### Attendance
Managers mark present/absent/half-day/on-leave per employee per day (re-marking the same day updates the record rather than duplicating it). Employees see their own attendance history and percentage.

### Leave Management
Employees apply for leave (sick, casual, annual, unpaid, other) with a date range and reason. Managers review pending requests and approve or reject with an optional note.

### Announcements
Managers post, edit, and delete company announcements; all users see a read-only feed on the dashboard and a dedicated page.

---

## API Reference

Base URL: `http://localhost:5000/api` (configurable via `VITE_API_BASE_URL` on the frontend)

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a user account |
| POST | `/auth/login` | Public | Log in, returns JWT |
| GET | `/auth/me` | Private | Current user profile |
| POST | `/auth/logout` | Private | Logout (stateless) |
| GET/POST | `/employees` | Private | List (paginated/search) / create employee |
| GET/PUT/DELETE | `/employees/:id` | Private | Read / update / delete an employee |
| GET/POST | `/departments` | Private | List / create department |
| GET/PUT/DELETE | `/departments/:id` | Private | Read / update / delete a department |
| POST | `/attendance` | Private | Mark attendance (upserts per employee/day) |
| GET | `/attendance/today` | Admin/HR Manager | Today's attendance summary |
| GET | `/attendance/history/:employeeId` | Private | Attendance history |
| GET | `/attendance/percentage/:employeeId` | Private | Attendance percentage |
| GET/POST | `/leaves` | Private | List / apply for leave |
| GET | `/leaves/:id` | Private | Single leave request |
| PUT | `/leaves/:id/review` | Admin/HR Manager | Approve/reject a leave request |
| GET/POST | `/announcements` | Private | List / create announcement |
| PUT/DELETE | `/announcements/:id` | Admin/HR Manager | Update / delete announcement |
| GET | `/dashboard` | Private | Aggregated stats for the dashboard |

All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

---

## Design System

The UI is styled with tokens adapted from an Apple-inspired design analysis:

- **Color**: a single Action Blue (`#0066cc`) as the only interactive accent, near-black `#1d1d1f` ink for text, and a light parchment (`#f5f5f7`) app background. Semantic status colors (success/danger/warning) were added for this app, since the source system defined none.
- **Typography**: SF Pro Display/Text with Inter as the web-safe substitute, a deliberate 300/400/600/700 weight ladder (no 500), and negative letter-spacing on headlines.
- **Shape**: a signature pill radius (`9999px`) for every button and status badge, and an 18px card radius for containers.
- **Elevation**: no shadows on UI chrome — cards are distinguished by a 1px hairline border, not drop shadows.

Full token values live in `frontend/tailwind.config.js`; the full rationale and every adaptation decision is documented in `frontend/README.md`.

---

## Security

- JWT-based authentication with bcrypt password hashing
- Role-based authorization on every protected route
- express-validator input validation on all write endpoints
- Centralized error handling (no stack traces leaked outside development)
- File upload restrictions (type + 2MB size limit) on profile pictures

---

## Known Follow-ups

- **Employee self-service attendance marking** — the backend already allows the `employee` role to mark their own attendance; the frontend UI for it hasn't been added yet.
- **Employee profile page** — employees can't yet view/edit their own profile from the UI.
- **End-to-end integration testing** — backend and frontend have each been verified independently (backend via a full require-graph load test, frontend via a successful production build) but haven't yet been run together against live data.

---

## Why This Scope

This project balances functionality and development effort. It covers the core HR workflows expected in a modern HRMS — employee management, attendance, leave, departments, announcements, and a dashboard — without expanding into advanced enterprise modules like payroll, recruitment, asset management, or accounting. The emphasis throughout is on clean architecture, reusable components, maintainable code, and a professional user experience inspired by ERPGo rather than an exact clone.
