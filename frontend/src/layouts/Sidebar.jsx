import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  CalendarCheck,
  FileText,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MANAGER_ROLES } from "../constants/roles";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/employees", label: "Employees", icon: Users, managerOnly: true },
  { to: "/departments", label: "Departments", icon: Building2, managerOnly: true },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/leaves", label: "Leave Requests", icon: FileText },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-void text-white z-40 flex flex-col
          transition-transform duration-200 md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center px-lg border-b border-white/10">
          <span className="text-tagline text-white">HRMS</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => !item.managerOnly || canManage).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-nav-link tracking-normal text-[14px]
                 transition-colors press-active
                 ${isActive ? "bg-primary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
