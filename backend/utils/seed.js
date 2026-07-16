// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Announcement = require("../models/Announcement");

// --- Dummy data config ---------------------------------------------------

// Department name -> { code (used for employeeId prefix), headcount }
const DEPARTMENT_PLAN = {
  Engineering: { code: "ENG", count: 8 },
  Finance: { code: "FIN", count: 6 },
  "Human Resources": { code: "HR", count: 3 },
  Marketing: { code: "MKT", count: 7 },
  Sales: { code: "SLS", count: 6 },
};

const DESIGNATIONS_BY_DEPT = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "QA Engineer", "DevOps Engineer", "Engineering Manager"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager", "Payroll Specialist"],
  "Human Resources": ["HR Executive", "HR Manager", "Recruiter"],
  Marketing: ["Marketing Executive", "Content Strategist", "SEO Specialist", "Marketing Manager"],
  Sales: ["Sales Executive", "Account Manager", "Sales Manager", "Business Development Rep"],
};

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Arjun", "Rohan", "Karan",
  "Priya", "Ananya", "Diya", "Saanvi", "Meera", "Neha", "Isha", "Riya",
  "Rahul", "Amit", "Sanjay", "Vikram", "Nikhil", "Varun", "Manish", "Deepak",
  "Pooja", "Kavya", "Shreya", "Tanya", "Simran", "Anjali",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehta", "Kapoor", "Malhotra", "Reddy", "Nair",
  "Iyer", "Rao", "Chatterjee", "Bose", "Kulkarni", "Joshi", "Desai", "Pillai",
  "Agarwal", "Bhatt", "Choudhary", "Menon",
];

let nameCursor = 0;
const nextName = () => {
  const first = FIRST_NAMES[nameCursor % FIRST_NAMES.length];
  // Stride by a number coprime with LAST_NAMES.length so last names vary
  // across the run instead of all landing on the same index.
  const last = LAST_NAMES[(nameCursor * 7) % LAST_NAMES.length];
  nameCursor += 1;
  return `${first} ${last}`;
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomJoiningDate = () => {
  const daysAgo = Math.floor(Math.random() * 900) + 60; // 2 months to ~2.5 years ago
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- Seed steps -----------------------------------------------------------

const seedAdminAndDepartments = async () => {
  const existingAdmin = await User.findOne({ email: "admin@hrms.local" });
  if (!existingAdmin) {
    await User.create({
      name: "System Admin",
      email: "admin@hrms.local",
      password: "Admin@123",
      role: "admin",
    });
    console.log("Created default admin: admin@hrms.local / Admin@123");
  } else {
    console.log("Admin user already exists, skipping");
  }

  for (const name of Object.keys(DEPARTMENT_PLAN)) {
    const exists = await Department.findOne({ name });
    if (!exists) {
      await Department.create({ name, description: `${name} department` });
      console.log(`Created department: ${name}`);
    }
  }
};

// Creates the planned headcount per department (idempotent: skips employeeIds
// that already exist, so re-running only tops up what's missing).
const seedEmployees = async () => {
  const created = { Engineering: [], Finance: [], "Human Resources": [], Marketing: [], Sales: [] };

  for (const [deptName, plan] of Object.entries(DEPARTMENT_PLAN)) {
    const department = await Department.findOne({ name: deptName });
    if (!department) {
      console.warn(`Department "${deptName}" not found, skipping its employees`);
      continue;
    }

    for (let i = 1; i <= plan.count; i += 1) {
      const employeeId = `${plan.code}-${String(i).padStart(3, "0")}`;
      let employee = await Employee.findOne({ employeeId });

      if (!employee) {
        const name = nextName();
        const emailSafeName = name.toLowerCase().replace(/\s+/g, ".");
        employee = await Employee.create({
          employeeId,
          name,
          email: `${emailSafeName}.${plan.code.toLowerCase()}${i}@hrms-demo.local`,
          phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
          department: department._id,
          designation: randomFrom(DESIGNATIONS_BY_DEPT[deptName]),
          joiningDate: randomJoiningDate(),
          salary: Math.floor(Math.random() * 40000 + 40000) * 12, // annual, in whatever currency unit
          status: "active",
        });
        console.log(`Created employee: ${employee.name} (${employeeId}, ${deptName})`);
      }

      created[deptName].push(employee);
    }
  }

  return created;
};

// Marks 3 days of attendance for every employee. All days are "present"
// except one shared day where exactly 3 employees are absent:
// 1 Engineering employee + 2 Marketing employees (all others present that day too).
const seedAttendance = async (employeesByDept, markedByUserId) => {
  const allEmployees = Object.values(employeesByDept).flat();
  const attendanceDays = [daysAgo(2), daysAgo(1), daysAgo(0)];
  const absentDay = attendanceDays[1]; // the shared "some people were absent" day

  const absentEmployeeIds = new Set(
    [
      employeesByDept.Engineering[0], // 1 Engineering employee
      employeesByDept.Marketing[0], // 2 Marketing employees
      employeesByDept.Marketing[1],
    ]
      .filter(Boolean)
      .map((e) => e._id.toString())
  );

  let markedCount = 0;
  for (const employee of allEmployees) {
    for (const day of attendanceDays) {
      const isAbsentDay = day.getTime() === absentDay.getTime();
      const status = isAbsentDay && absentEmployeeIds.has(employee._id.toString()) ? "absent" : "present";

      await Attendance.findOneAndUpdate(
        { employee: employee._id, date: day },
        { employee: employee._id, date: day, status, markedBy: markedByUserId },
        { upsert: true, setDefaultsOnInsert: true }
      );
      markedCount += 1;
    }
  }

  console.log(
    `Marked attendance for ${allEmployees.length} employees across 3 days (${markedCount} records). ` +
      `3 employees were marked absent on ${absentDay.toDateString()}: ` +
      `${employeesByDept.Engineering[0]?.name} (Engineering), ` +
      `${employeesByDept.Marketing[0]?.name} & ${employeesByDept.Marketing[1]?.name} (Marketing).`
  );
};

// 2 Engineering + 1 Finance leave requests (skips if already seeded, matched by reason text).
const seedLeaveRequests = async (employeesByDept) => {
  const requests = [
    {
      employee: employeesByDept.Engineering[2],
      leaveType: "sick",
      startDate: daysAgo(-2), // 2 days from now
      endDate: daysAgo(-3),
      reason: "[Demo] Down with a fever, need a couple of days to recover",
    },
    {
      employee: employeesByDept.Engineering[4],
      leaveType: "annual",
      startDate: daysAgo(-10),
      endDate: daysAgo(-14),
      reason: "[Demo] Family trip planned, requesting annual leave",
    },
    {
      employee: employeesByDept.Finance[1],
      leaveType: "casual",
      startDate: daysAgo(-1),
      endDate: daysAgo(-1),
      reason: "[Demo] Personal errand, need a day off",
    },
  ];

  for (const req of requests) {
    if (!req.employee) continue;
    const exists = await LeaveRequest.findOne({ employee: req.employee._id, reason: req.reason });
    if (exists) continue;

    await LeaveRequest.create(req);
    console.log(`Created leave request: ${req.employee.name} — ${req.leaveType}`);
  }
};

// 2 dummy announcements (skips if a matching title already exists).
const seedAnnouncements = async (createdByUserId) => {
  const announcements = [
    {
      title: "[Demo] Welcome to the new HRMS dashboard",
      description:
        "We've rolled out a new Human Resource Management System to make employee, attendance, and leave management simpler for everyone. Explore the dashboard and let us know what you think!",
      date: daysAgo(1),
    },
    {
      title: "[Demo] Quarterly town hall next Friday",
      description:
        "Join us for the quarterly all-hands town hall next Friday at 4 PM in the main conference room. We'll cover company updates, team shout-outs, and a Q&A session.",
      date: daysAgo(0),
    },
  ];

  for (const a of announcements) {
    const exists = await Announcement.findOne({ title: a.title });
    if (exists) continue;
    await Announcement.create({ ...a, createdBy: createdByUserId });
    console.log(`Created announcement: ${a.title}`);
  }
};

// Creates demo login accounts for the other two roles, each linked to a real
// seeded Employee record so their self-service views (attendance history,
// leave requests) have real data behind them. Idempotent by email.
const seedDemoUsers = async (employeesByDept) => {
  const hrEmployee = employeesByDept["Human Resources"][0];
  const demoEmployee = employeesByDept.Engineering[2]; // already has a seeded leave request

  const demoUsers = [
    {
      email: "hr@hrms.local",
      password: "HRManager@123",
      role: "hr_manager",
      employee: hrEmployee,
    },
    {
      email: "employee@hrms.local",
      password: "Employee@123",
      role: "employee",
      employee: demoEmployee,
    },
  ];

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }

    await User.create({
      name: u.employee?.name || u.email,
      email: u.email,
      password: u.password,
      role: u.role,
      employee: u.employee?._id || null,
    });
    console.log(`Created ${u.role} login: ${u.email} / ${u.password}`);
  }
};

// ---------------------------------------------------------------------------

const run = async () => {
  await connectDB();

  await seedAdminAndDepartments();
  const admin = await User.findOne({ email: "admin@hrms.local" });

  const employeesByDept = await seedEmployees();
  await seedDemoUsers(employeesByDept);
  await seedAttendance(employeesByDept, admin._id);
  await seedLeaveRequests(employeesByDept);
  await seedAnnouncements(admin._id);

  console.log("Seeding complete");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
