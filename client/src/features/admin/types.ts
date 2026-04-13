export type AdminRole = 'customer' | 'officer' | 'admin';
export type AdminUserStatus = 'active' | 'disabled' | 'pending';

export interface AdminSummaryCard {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

export interface AdminChartDatum {
  [key: string]: string | number;
  name: string;
  value: number;
}

export interface AdminMonthlyTrend {
  month: string;
  applications: number;
  approved: number;
  disbursed: number;
}

export interface AdminAlert {
  id: string;
  level: 'success' | 'info' | 'warning';
  title: string;
  description: string;
}

export interface AdminWatchlistItem {
  id: string;
  applicant: string;
  amount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: string;
  reason: string;
}

export interface AdminActivityItem {
  id: string;
  type: 'application' | 'user';
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminOverview {
  hero: {
    title: string;
    subtitle: string;
    approvalRate: number;
    systemHealthScore: number;
    activeUsers: number;
  };
  summaryCards: AdminSummaryCard[];
  roleDistribution: AdminChartDatum[];
  statusDistribution: AdminChartDatum[];
  riskDistribution: AdminChartDatum[];
  monthlyTrend: AdminMonthlyTrend[];
  alerts: AdminAlert[];
  watchlist: AdminWatchlistItem[];
  recentActivity: AdminActivityItem[];
  queue: {
    pendingApplications: number;
    needsInfoApplications: number;
    disabledUsers: number;
    pendingUsers: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  branch: string;
  department: string;
  phone: string;
  notes: string;
  permissions: string[];
  lastActiveAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  summary: {
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
    pendingUsers: number;
    admins: number;
    officers: number;
    customers: number;
  };
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  branch: string;
  department: string;
  phone?: string;
  notes?: string;
}
