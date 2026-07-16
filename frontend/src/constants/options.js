export const LEAVE_TYPES = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "other", label: "Other" },
];

export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
};

export const EMPLOYEE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
};

export const CALENDAR_CATEGORIES = [
  { value: "holiday", label: "Holiday" },
  { value: "meeting", label: "Meeting" },
];

// Meetings = Blue, Holidays = Green, Leaves = Orange — per the Calendar spec's legend
export const CALENDAR_CATEGORY_STYLES = {
  meeting: { dot: "bg-primary", bar: "bg-primary/15 text-primary", label: "Meeting" },
  holiday: { dot: "bg-success", bar: "bg-success-soft text-success", label: "Holiday" },
  leave: { dot: "bg-warning", bar: "bg-warning-soft text-warning", label: "Leave" },
};
