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

// New Models
const Company = require("../models/Company");
const Branch = require("../models/Branch");
const Designation = require("../models/Designation");
const Holiday = require("../models/Holiday");
const Timesheet = require("../models/Timesheet");
const Shift = require("../models/Shift");
const AttendancePolicy = require("../models/AttendancePolicy");
const JobCategory = require("../models/JobCategory");
const JobType = require("../models/JobType");
const JobPosting = require("../models/JobPosting");
const Candidate = require("../models/Candidate");
const AwardType = require("../models/AwardType");
const DocumentType = require("../models/DocumentType");

// --- Dummy data config ---------------------------------------------------

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
  const last = LAST_NAMES[(nameCursor * 7) % LAST_NAMES.length];
  nameCursor += 1;
  return `${first} ${last}`;
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomJoiningDate = () => {
  const daysAgo = Math.floor(Math.random() * 900) + 60;
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

const run = async () => {
  await connectDB();

  console.log("Clearing existing data for new modules...");
  await Company.deleteMany({});
  await Branch.deleteMany({});
  await Designation.deleteMany({});
  await Holiday.deleteMany({});
  await Timesheet.deleteMany({});
  await Shift.deleteMany({});
  await AttendancePolicy.deleteMany({});
  await JobCategory.deleteMany({});
  await JobType.deleteMany({});
  await JobPosting.deleteMany({});
  await Candidate.deleteMany({});
  await AwardType.deleteMany({});
  await DocumentType.deleteMany({});

  console.log("Seeding Company root...");
  const company = await Company.create({
    name: "Main Corporation",
    registrationNumber: "MC-12345678",
    address: "100 Innovation Way, Silicon Valley, CA",
    status: "active",
  });
  console.log("Company seeded");

  console.log("Seeding Branches...");
  const headOffice = await Branch.create({
    company: company._id,
    name: "Head Office",
    email: "ho@maincorp.com",
    phone: "1-800-555-0100",
    address: "100 Innovation Way, Silicon Valley, CA",
    status: "active",
  });
  const techHub = await Branch.create({
    company: company._id,
    name: "Tech Hub",
    email: "techhub@maincorp.com",
    phone: "1-800-555-0200",
    address: "500 Developers Row, Austin, TX",
    status: "active",
  });
  console.log("Branches seeded");

  console.log("Seeding Departments...");
  // Clear departments so they get linked to the Company & Branch
  await Department.deleteMany({});
  const depts = {};
  for (const name of Object.keys(DEPARTMENT_PLAN)) {
    depts[name] = await Department.create({
      company: company._id,
      branch: name === "Engineering" ? techHub._id : headOffice._id,
      name,
      description: `${name} department`,
    });
    console.log(`Created department: ${name}`);
  }

  console.log("Seeding Designations...");
  const designationsMap = {}; // deptName -> Designation doc list
  for (const [deptName, names] of Object.entries(DESIGNATIONS_BY_DEPT)) {
    designationsMap[deptName] = [];
    const deptDoc = depts[deptName];
    for (const name of names) {
      let grade = "L1";
      if (name.includes("Senior")) grade = "L2";
      if (name.includes("Manager")) grade = "L3";
      if (name.includes("VP") || name.includes("Lead")) grade = "L4";

      const designation = await Designation.create({
        company: company._id,
        department: deptDoc._id,
        branch: deptDoc.branch,
        name,
        description: `Role of ${name} in ${deptName}`,
        grade,
        status: "active",
      });
      designationsMap[deptName].push(designation);
    }
  }
  console.log("Designations seeded");

  console.log("Seeding Shifts & Attendance Policies...");
  const morningShift = await Shift.create({
    company: company._id,
    name: "Morning Shift",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    workingHours: 8,
    gracePeriod: 15,
    status: "active",
  });
  const standardPolicy = await AttendancePolicy.create({
    company: company._id,
    name: "Standard Attendance Policy",
    type: "standard",
    lateArrivalGrace: 15,
    earlyDepartureGrace: 15,
    overtimeRate: 1.5,
    status: "active",
  });

  console.log("Seeding Admin User...");
  await User.deleteMany({ role: "admin" });
  const admin = await User.create({
    name: "System Admin",
    email: "admin@hrms.local",
    password: "Admin@123",
    role: "admin",
    company: company._id,
  });
  console.log("Created default admin: admin@hrms.local / Admin@123");

  console.log("Seeding Employees...");
  await Employee.deleteMany({});
  const employeesByDept = { Engineering: [], Finance: [], "Human Resources": [], Marketing: [], Sales: [] };
  const allEmployees = [];

  for (const [deptName, plan] of Object.entries(DEPARTMENT_PLAN)) {
    const deptDoc = depts[deptName];
    for (let i = 1; i <= plan.count; i += 1) {
      const employeeId = `${plan.code}-${String(i).padStart(3, "0")}`;
      const name = nextName();
      const emailSafeName = name.toLowerCase().replace(/\s+/g, ".");
      const designationDoc = randomFrom(designationsMap[deptName]);

      const employee = await Employee.create({
        employeeId,
        name,
        email: `${emailSafeName}.${plan.code.toLowerCase()}${i}@hrms-demo.local`,
        phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
        company: company._id,
        branch: deptDoc.branch,
        department: deptDoc._id,
        designation: designationDoc._id,
        joiningDate: randomJoiningDate(),
        salary: Math.floor(Math.random() * 40000 + 40000) * 12,
        status: "active",
        shift: morningShift._id,
        attendancePolicy: standardPolicy._id,
      });

      employeesByDept[deptName].push(employee);
      allEmployees.push(employee);
      console.log(`Created employee: ${employee.name} (${employeeId}, ${deptName})`);
    }
  }

  // Update reportingManager relationships
  // Assign first employee of each department as manager of subsequent ones
  for (const [deptName, list] of Object.entries(employeesByDept)) {
    if (list.length > 1) {
      const manager = list[0];
      for (let i = 1; i < list.length; i++) {
        list[i].reportingManager = manager._id;
        await list[i].save();
      }
      console.log(`Assigned ${manager.name} as manager for ${deptName} team`);
    }
  }

  console.log("Seeding demo login users...");
  await User.deleteMany({ role: { $ne: "admin" } });
  const hrEmployee = employeesByDept["Human Resources"][0];
  const demoEmployee = employeesByDept.Engineering[2];

  await User.create({
    name: hrEmployee.name,
    email: "hr@hrms.local",
    password: "HRManager@123",
    role: "hr_manager",
    company: company._id,
    employee: hrEmployee._id,
  });
  await User.create({
    name: demoEmployee.name,
    email: "employee@hrms.local",
    password: "Employee@123",
    role: "employee",
    company: company._id,
    employee: demoEmployee._id,
  });
  console.log("Demo logins seeded: hr@hrms.local / employee@hrms.local");

  console.log("Seeding Attendance records...");
  await Attendance.deleteMany({});
  const attendanceDays = [daysAgo(2), daysAgo(1), daysAgo(0)];
  const absentDay = attendanceDays[1];
  const absentEmployeeIds = new Set([
    employeesByDept.Engineering[0]?._id.toString(),
    employeesByDept.Marketing[0]?._id.toString(),
    employeesByDept.Marketing[1]?._id.toString(),
  ].filter(Boolean));

  for (const employee of allEmployees) {
    for (const day of attendanceDays) {
      const isAbsentDay = day.getTime() === absentDay.getTime();
      const status = isAbsentDay && absentEmployeeIds.has(employee._id.toString()) ? "absent" : "present";

      await Attendance.create({
        company: company._id,
        employee: employee._id,
        date: day,
        status,
        markedBy: admin._id,
        remarks: status === "absent" ? "Personal emergency" : "Regular schedule",
      });
    }
  }
  console.log("Seeding Leave Requests...");
  await LeaveRequest.deleteMany({});
  const leaveRequests = [
    {
      company: company._id,
      employee: employeesByDept.Engineering[2]._id,
      leaveType: "sick",
      startDate: daysAgo(-2),
      endDate: daysAgo(-3),
      reason: "[Demo] Down with a fever, need a couple of days to recover",
    },
    {
      company: company._id,
      employee: employeesByDept.Engineering[4]._id,
      leaveType: "annual",
      startDate: daysAgo(-10),
      endDate: daysAgo(-14),
      reason: "[Demo] Family trip planned, requesting annual leave",
    },
    {
      company: company._id,
      employee: employeesByDept.Finance[1]._id,
      leaveType: "casual",
      startDate: daysAgo(-1),
      endDate: daysAgo(-1),
      reason: "[Demo] Personal errand, need a day off",
    },
  ];
  await LeaveRequest.create(leaveRequests);

  console.log("Seeding Announcements...");
  await Announcement.deleteMany({});
  await Announcement.create([
    {
      company: company._id,
      title: "[Demo] Welcome to the new HRMS dashboard",
      description: "We've rolled out a new Human Resource Management System to make employee, attendance, and leave management simpler for everyone.",
      publishDate: daysAgo(1),
      isPinned: true,
      createdBy: admin._id,
    },
    {
      company: company._id,
      title: "[Demo] Quarterly town hall next Friday",
      description: "Join us for the quarterly all-hands town hall next Friday at 4 PM in the main conference room.",
      publishDate: daysAgo(0),
      isPinned: false,
      createdBy: admin._id,
    }
  ]);

  console.log("Seeding Holidays...");
  await Holiday.create([
    {
      company: company._id,
      title: "Company Foundation Day",
      date: new Date("2026-07-01"),
      category: "company_specific",
      branches: [headOffice._id, techHub._id],
    },
    {
      company: company._id,
      title: "National Holiday",
      date: new Date("2026-07-15"),
      category: "national",
      branches: [headOffice._id, techHub._id],
    },
    {
      company: company._id,
      title: "Festival Holiday",
      date: new Date("2026-07-25"),
      category: "religious",
      branches: [techHub._id],
    }
  ]);

  console.log("Seeding Timesheets...");
  await Timesheet.create([
    {
      company: company._id,
      employee: employeesByDept.Engineering[2]._id,
      date: daysAgo(1),
      workingHours: 7.5,
      projectName: "Documentation",
      approvalStatus: "approved",
    },
    {
      company: company._id,
      employee: employeesByDept.Engineering[2]._id,
      date: daysAgo(0),
      workingHours: 8.5,
      projectName: "Bug Fixes",
      approvalStatus: "pending",
    },
    {
      company: company._id,
      employee: employeesByDept.Engineering[3]._id,
      date: daysAgo(0),
      workingHours: 7.0,
      projectName: "Testing",
      approvalStatus: "pending",
    }
  ]);

  console.log("Seeding Recruitment Data...");
  const techCategory = await JobCategory.create({ company: company._id, name: "Technology" });
  const ftime = await JobType.create({ company: company._id, name: "Full-time" });
  
  const devPosting = await JobPosting.create({
    company: company._id,
    jobCode: "JOB-ENG-001",
    title: "Senior Full Stack Developer",
    category: techCategory._id,
    type: ftime._id,
    location: "Austin, TX",
    salaryRange: "$100,000 - $130,000",
    description: "Looking for an expert developer fluent in React, Node, and MongoDB.",
    deadline: daysAgo(-30),
    status: "published",
    applicationsCount: 2,
  });

  const cand1 = await Candidate.create({
    company: company._id,
    name: "John Doe Applicant",
    email: "john.doe@candidate.local",
    phone: "512-555-1234",
    jobPosting: devPosting._id,
    source: "LinkedIn",
    experience: "5 Years",
    expectedSalary: "$110,000",
    status: "interviewed",
  });

  const cand2 = await Candidate.create({
    company: company._id,
    name: "Jane Miller",
    email: "jane.miller@candidate.local",
    phone: "512-555-5678",
    jobPosting: devPosting._id,
    source: "Indeed",
    experience: "3 Years",
    expectedSalary: "$95,000",
    status: "applied",
  });

  console.log("Seeding Award & Document Types...");
  await AwardType.create({ company: company._id, name: "Employee of the Month", description: "Monthly recognition award" });
  await DocumentType.create({ company: company._id, name: "Joining Letter", description: "Signed joining contract copy", required: true });

  console.log("Seeding complete!");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
