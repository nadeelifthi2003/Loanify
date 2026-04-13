import { useEffect, useState } from 'react';
import { RefreshCw, Search, Shield, UserCheck, UserPlus, UserX } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { createAdminUser, fetchAdminUsers, updateAdminUserRole, updateAdminUserStatus } from '@/features/admin/api';
import type { AdminRole, AdminUser, AdminUserStatus, AdminUsersResponse, CreateAdminUserPayload } from '@/features/admin/types';

const roleBadge = { customer: 'info', officer: 'warning', admin: 'error' } as const;
const statusBadge = { active: 'success', pending: 'warning', disabled: 'default' } as const;

const initialForm: CreateAdminUserPayload = {
    name: '',
    email: '',
    role: 'customer',
    status: 'pending',
    branch: 'Head Office',
    department: 'Operations',
    phone: '',
    notes: '',
};

function formatRelativeTime(value: string | null) {
    if (!value) return 'No activity';
    const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hr ago`;
    return `${Math.round(minutes / 1440)} day ago`;
}

export const UserManagement = () => {
    const { showToast } = useToast();
    const [response, setResponse] = useState<AdminUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<AdminUserStatus | 'all'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [formData, setFormData] = useState<CreateAdminUserPayload>(initialForm);

    const loadUsers = async (notify = false) => {
        try {
            if (response) setRefreshing(true);
            const data = await fetchAdminUsers({ search: searchTerm, role: roleFilter, status: statusFilter });
            setResponse(data);
            if (notify) showToast('User directory refreshed.', 'success');
        } catch (error) {
            console.error('Failed to load users:', error);
            showToast('Unable to load user management data.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadUsers();
        }, 200);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, roleFilter, statusFilter]);

    const handleStatusAction = async (user: AdminUser) => {
        const nextStatus: AdminUserStatus = user.status === 'active' ? 'disabled' : 'active';
        try {
            setBusyId(user.id);
            const updatedUser = await updateAdminUserStatus(user.id, nextStatus);
            await loadUsers();
            showToast(`${updatedUser.name} is now ${updatedUser.status}.`, 'success');
        } catch (error) {
            console.error('Failed to update user status:', error);
            showToast('Unable to update user status.', 'error');
        } finally {
            setBusyId(null);
        }
    };

    const handleRoleChange = async (userId: string, role: AdminRole) => {
        try {
            setBusyId(userId);
            const updatedUser = await updateAdminUserRole(userId, role);
            await loadUsers();
            showToast(`${updatedUser.name} is now assigned as ${updatedUser.role}.`, 'success');
        } catch (error) {
            console.error('Failed to update user role:', error);
            showToast('Unable to update user role.', 'error');
        } finally {
            setBusyId(null);
        }
    };

    const handleCreateUser = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            showToast('Name and email are required.', 'warning');
            return;
        }
        try {
            setCreateLoading(true);
            await createAdminUser({ ...formData, name: formData.name.trim(), email: formData.email.trim() });
            setIsCreateOpen(false);
            setFormData(initialForm);
            showToast('User created successfully.', 'success');
            await loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
            showToast('Unable to create user.', 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const users = response?.users ?? [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">User Management</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Activate, disable, onboard, and role-manage Loanify users across the platform.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => void loadUsers(true)}
                        isLoading={refreshing}
                        leftIcon={!refreshing ? <RefreshCw className="h-4 w-4" /> : undefined}
                    >
                        Refresh
                    </Button>
                    <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>Add User</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-5"><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total users</p><p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{response?.summary.totalUsers ?? 0}</p></Card>
                <Card className="p-5"><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active users</p><p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{response?.summary.activeUsers ?? 0}</p></Card>
                <Card className="p-5"><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Disabled users</p><p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{response?.summary.disabledUsers ?? 0}</p></Card>
                <Card className="p-5"><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Pending onboarding</p><p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{response?.summary.pendingUsers ?? 0}</p></Card>
            </div>

            <Card className="p-4 md:p-5">
                <div className="grid gap-3 lg:grid-cols-[1.6fr_0.7fr_0.7fr]">
                    <Input placeholder="Search users..." leftIcon={<Search className="h-4 w-4" />} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                    <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as AdminRole | 'all')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-light-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-dark-surface dark:text-dark-text-primary">
                        <option value="all">All roles</option>
                        <option value="customer">Customers</option>
                        <option value="officer">Officers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AdminUserStatus | 'all')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-light-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-dark-surface dark:text-dark-text-primary">
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[940px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">
                            <tr>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Branch</th>
                                <th className="pb-3">Last Active</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-light-text-secondary dark:text-dark-text-secondary">Loading users...</td></tr>
                            ) : users.length > 0 ? users.map((user) => (
                                <tr key={user.id}>
                                    <td className="py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">{user.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{user.name}</p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.department}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <Badge variant={roleBadge[user.role]} className="mb-2 capitalize">{user.role}</Badge>
                                        <select
                                            value={user.role}
                                            onChange={(event) => void handleRoleChange(user.id, event.target.value as AdminRole)}
                                            disabled={busyId === user.id}
                                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-light-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-slate-600 dark:bg-dark-surface dark:text-dark-text-primary"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="officer">Officer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-4"><Badge variant={statusBadge[user.status]} className="capitalize">{user.status}</Badge></td>
                                    <td className="py-4 text-light-text-secondary dark:text-dark-text-secondary">{user.branch}</td>
                                    <td className="py-4 text-light-text-secondary dark:text-dark-text-secondary">{formatRelativeTime(user.lastActiveAt)}</td>
                                    <td className="py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant={user.status === 'active' ? 'danger' : 'success'}
                                                isLoading={busyId === user.id}
                                                onClick={() => void handleStatusAction(user)}
                                                leftIcon={busyId === user.id ? undefined : user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                            >
                                                {user.status === 'active' ? 'Disable' : 'Activate'}
                                            </Button>
                                            <div className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs text-light-text-secondary dark:border-slate-700 dark:text-dark-text-secondary">
                                                <Shield className="mr-2 h-3.5 w-3.5" />
                                                {user.permissions.length || 0} permissions
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="py-8 text-center text-light-text-secondary dark:text-dark-text-secondary">No users matched the current filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => !createLoading && setIsCreateOpen(false)}
                title="Add Loanify User"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={createLoading}>Cancel</Button>
                        <Button onClick={() => void handleCreateUser()} isLoading={createLoading}>Create User</Button>
                    </>
                }
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Full Name" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
                    <Input label="Email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Role</label>
                        <select value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as AdminRole }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-light-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-dark-surface dark:text-dark-text-primary">
                            <option value="customer">Customer</option>
                            <option value="officer">Officer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Status</label>
                        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as AdminUserStatus }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-light-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-dark-surface dark:text-dark-text-primary">
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    <Input label="Branch" value={formData.branch} onChange={(event) => setFormData((current) => ({ ...current, branch: event.target.value }))} />
                    <Input label="Department" value={formData.department} onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value }))} />
                </div>
            </Modal>
        </div>
    );
};
