import { useEffect, useState } from 'react';
import { AlertTriangle, BriefcaseBusiness, RefreshCw, ShieldAlert, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { fetchAdminOverview } from '@/features/admin/api';
import type { AdminOverview } from '@/features/admin/types';
import { formatNumber } from '@/utils/formatCurrency';

const COLORS = ['#0D9488', '#2563EB', '#F59E0B', '#DC2626'];

const toneClasses = [
    'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300',
];

const riskBadge = {
    Low: 'success',
    Medium: 'warning',
    High: 'error',
} as const;

function formatRelativeTime(value: string) {
    const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hr ago`;
    return `${Math.round(minutes / 1440)} day ago`;
}

export const AdminDashboard = () => {
    const { showToast } = useToast();
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadOverview = async (notify = false) => {
        try {
            if (overview) setRefreshing(true);
            const data = await fetchAdminOverview();
            setOverview(data);
            if (notify) showToast('Admin dashboard refreshed.', 'success');
        } catch (error) {
            console.error('Failed to load admin overview:', error);
            showToast('Unable to load admin dashboard data.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadOverview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && !overview) {
        return <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Loading admin dashboard...</div>;
    }

    if (!overview) {
        return (
            <Card className="p-8 text-center">
                <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-red-500" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Dashboard data is unavailable.</p>
                <div className="mt-4">
                    <Button onClick={() => void loadOverview(true)}>Retry</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{overview.hero.title}</h1>
                    <p className="mt-2 max-w-3xl text-light-text-secondary dark:text-dark-text-secondary">{overview.hero.subtitle}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => void loadOverview(true)}
                    isLoading={refreshing}
                    leftIcon={!refreshing ? <RefreshCw className="h-4 w-4" /> : undefined}
                >
                    Refresh Snapshot
                </Button>
            </div>

            <Card className="border-none bg-[linear-gradient(135deg,#0f172a_0%,#123c63_100%)] p-6 text-white">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-teal-200/80">Loanify command center</p>
                        <h2 className="mt-3 text-3xl font-semibold">Monitor lending flow, portfolio exposure, and admin actions in one place.</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Approval Rate</p>
                            <p className="mt-2 text-3xl font-semibold">{overview.hero.approvalRate}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-300">System Health</p>
                            <p className="mt-2 text-3xl font-semibold">{overview.hero.systemHealthScore}%</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overview.summaryCards.map((card, index) => (
                    <Card key={card.label} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{card.label}</p>
                                <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{card.value}</p>
                                <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">{card.helper}</p>
                            </div>
                            <div className={`rounded-2xl p-3 ${toneClasses[index % toneClasses.length]}`}>
                                {index % 2 === 0 ? <BriefcaseBusiness className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Application pipeline</h3>
                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">Loan requests and approvals over the last six months.</p>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overview.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="applications" fill="#0D9488" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="approved" fill="#2563EB" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Role distribution</h3>
                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">Admin, officer, and customer account balance.</p>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={overview.roleDistribution} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84}>
                                    {overview.roleDistribution.map((item, index) => (
                                        <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Borrower watchlist</h3>
                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">Higher-risk applications that may need closer admin oversight.</p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">
                                <tr>
                                    <th className="pb-3">Applicant</th>
                                    <th className="pb-3">Exposure</th>
                                    <th className="pb-3">Risk</th>
                                    <th className="pb-3">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-border dark:divide-dark-border">
                                {overview.watchlist.length > 0 ? overview.watchlist.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-4 font-medium text-light-text-primary dark:text-dark-text-primary">{item.applicant}</td>
                                        <td className="py-4 text-light-text-secondary dark:text-dark-text-secondary">LKR {formatNumber(item.amount)}</td>
                                        <td className="py-4"><Badge variant={riskBadge[item.riskLevel]}>{item.riskLevel}</Badge></td>
                                        <td className="py-4 text-light-text-secondary dark:text-dark-text-secondary">{item.reason}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-light-text-secondary dark:text-dark-text-secondary">No watchlist items right now.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Admin alerts</h3>
                        </div>
                        <div className="mt-4 space-y-3">
                            {overview.alerts.map((alert) => (
                                <div key={alert.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{alert.title}</p>
                                        <Badge variant={alert.level === 'warning' ? 'warning' : alert.level === 'success' ? 'success' : 'info'}>{alert.level}</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">{alert.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Recent activity</h3>
                        <div className="mt-4 space-y-4">
                            {overview.recentActivity.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                    <div>
                                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{item.title}</p>
                                        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">{item.description}</p>
                                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{formatRelativeTime(item.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
