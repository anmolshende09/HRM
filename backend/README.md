# HRMS Backend

Node.js + Express + MongoDB API for the Human Resource Management System.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
npm run seed               # creates a default admin + sample departments
npm run dev                 # starts the API with nodemon on http://localhost:5000
```

Default admin created by `npm run seed`:
- email: `admin@hrms.local`
- password: `Admin@123`

**Change this password (or delete the seeded user) before using this anywhere but local development.**

## Folder Structure

```
backend/
├── config/         # DB connection, multer upload config
├── controllers/     # Route handler logic
├── middleware/       # JWT auth guard, role guard, error handler
├── models/            # Mongoose schemas
├── routes/             # Express routers
├── utils/               # asyncHandler, generateToken, seed script
├── validators/            # express-validator rule sets
├── uploads/                 # Uploaded employee profile pictures
└── server.js                 # App entry point
```

## Auth

All routes except `/api/auth/register` and `/api/auth/login` require:

```
Authorization: Bearer <token>
```

Roles: `admin`, `hr_manager`, `employee`. Each route file declares which roles
can call which endpoints via the `authorize(...)` middleware.

## API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a user account |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Private | Current user profile |
| POST | `/api/auth/logout` | Private | Logout (stateless) |
| GET/POST | `/api/employees` | Private | List (paginated/search) / create employee |
| GET/PUT/DELETE | `/api/employees/:id` | Private | Read / update / delete an employee |
| GET/POST | `/api/departments` | Private | List / create department |
| GET/PUT/DELETE | `/api/departments/:id` | Private | Read / update / delete a department |
| POST | `/api/attendance` | Private | Mark attendance (upserts per employee/day) |
| GET | `/api/attendance/today` | admin/hr_manager | Today's attendance summary |
| GET | `/api/attendance/history/:employeeId` | Private | Attendance history |
| GET | `/api/attendance/percentage/:employeeId` | Private | Attendance percentage |
| GET/POST | `/api/leaves` | Private | List / apply for leave |
| GET | `/api/leaves/:id` | Private | Single leave request |
| PUT | `/api/leaves/:id/review` | admin/hr_manager | Approve/reject a leave request |
| GET/POST | `/api/announcements` | Private | List / create announcement |
| PUT/DELETE | `/api/announcements/:id` | admin/hr_manager | Update / delete announcement |
| GET | `/api/dashboard` | Private | Aggregated stats for the dashboard |

## Employee Search & Pagination

```
GET /api/employees?search=john&department=<id>&status=active&page=1&limit=10
```

## File Uploads

Employee profile pictures are uploaded as `multipart/form-data` under the
field name `profilePicture` on the create/update employee routes, and served
statically from `/uploads/employees/<filename>`.

## Notes on Design Choices

- Attendance uses a **unique compound index** on `(employee, date)` so
  marking attendance twice for the same day updates the record instead of
  duplicating it (upsert).
- Departments cannot be deleted while employees still reference them —
  this mirrors the "Employee Count" shown in the Department module of the
  project spec and avoids orphaned foreign keys.
- Validation is centralized in `validators/` using `express-validator`, and
  errors flow through a single `errorHandler` middleware for consistent
  JSON error responses.
