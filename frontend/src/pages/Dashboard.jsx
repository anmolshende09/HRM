import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, CalendarClock } from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DepartmentDistribution from "../components/dashboard/DepartmentDistribution";
import EmployeesOnLeave from "../components/dashboard/EmployeesOnLeave";
import RecentLeaveRequests from "../components/dashboard/RecentLeaveRequests";
import AnnouncementsWidget from "../components/dashboard/AnnouncementsWidget";
import QuickActions from "../components/dashboard/QuickActions";

function WidgetCard({ title, children }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg">
      <h3 className="text-body-strong mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const canManage = MANAGER_ROLES.includes(user?.role);

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error("Couldn't load dashboard data"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner full label="Loading dashboard…" />;

  const cards = data?.cards || {};

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-display-md">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-caption text-ink-muted48 mt-1">Here's what's happening across your organization today.</p>
      </div>

      <QuickActions canManage={canManage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" count={cards.totalEmployees ?? 0} icon={Users} theme="blue" />
        <StatCard title="Present Today" count={cards.presentToday ?? 0} icon={UserCheck} theme="green" />
        <StatCard title="Absent Today" count={cards.absentToday ?? 0} icon={UserX} theme="red" />
        <StatCard title="On Leave" count={cards.onLeaveToday ?? 0} icon={CalendarClock} theme="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <WidgetCard title="Department Distribution">
          <DepartmentDistribution departments={data?.departmentDistribution} />
        </WidgetCard>
        <WidgetCard title="Employees on Leave Today">
          <EmployeesOnLeave items={data?.employeesOnLeave} />
        </WidgetCard>
        <WidgetCard title="Recent Leave Requests">
          <RecentLeaveRequests items={data?.recentLeaveRequests} />
        </WidgetCard>
        <WidgetCard title="Announcements">
          <AnnouncementsWidget items={data?.announcements} />
        </WidgetCard>
      </div>
    </div>
  );
}
