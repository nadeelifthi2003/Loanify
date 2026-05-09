import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { fetchAdminAnalytics } from '@/features/admin/api';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatNumber } from '@/utils/formatCurrency';

const COLORS = ['#0D9488', '#2563EB', '#DC2626', '#F59E0B', '#8B5CF6'];

export const AdminAnalytics = () => {
    const { showToast } = useToast();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnalytics = async (notify = false) => {
        try {
            if (analytics) setRefreshing(true);
            const data = await fetchAdminAnalytics();
            setAnalytics(data);
            if (notify) showToast('Analytics refreshed.', 'success');
        } catch (error) {
            console.error('Failed to load analytics:', error);
            showToast('Unable to load analytics data.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadAnalytics();
    }, []);

    if (loading && !analytics) {
        return <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Loading analytics...</div>;
    }

    if (!analytics) {
        return (
            <Card className="p-8 text-center">
                <Activity className="mx-auto mb-3 h-8 w-8 text-red-500" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Analytics data is unavailable.</p>
                <div className="mt-4">
                    <Button onClick={() => void loadAnalytics(true)}>Retry</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">System Analytics</h1>
                    <p className="mt-2 max-w-3xl text-light-text-secondary dark:text-dark-text-secondary">Comprehensive reports on revenue, performance, and demographics.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => void loadAnalytics(true)}
                    isLoading={refreshing}
                    leftIcon={!refreshing ? <RefreshCw className="h-4 w-4" /> : undefined}
                >
                    Refresh Data
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-5 flex items-start gap-4">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-600 dark:text-blue-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Revenue</p>
                        <p className="text-2xl font-bold mt-1">LKR {formatNumber(analytics.keyMetrics.totalRevenue)}</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-start gap-4">
                    <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Revenue Growth</p>
                        <p className="text-2xl font-bold mt-1">+{analytics.keyMetrics.revenueGrowth}%</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-start gap-4">
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-red-600 dark:text-red-400">
                        <TrendingDown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Default Rate</p>
                        <p className="text-2xl font-bold mt-1">{analytics.keyMetrics.defaultRate}%</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-start gap-4">
                    <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 text-purple-600 dark:text-purple-400">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Loans</p>
                        <p className="text-2xl font-bold mt-1">{formatNumber(analytics.keyMetrics.activeLoansCount)}</p>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-1">Revenue Projections vs Actual</h3>
                    <p className="text-sm text-slate-500 mb-6">Tracking monthly financial targets.</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueData}>
                                <defs>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `LKR ${value/1000}k`} />
                                <Tooltip formatter={(value: any) => [`LKR ${formatNumber(value)}`, '']} />
                                <Legend />
                                <Area type="monotone" dataKey="projected" name="Projected" stroke="#2563EB" fillOpacity={1} fill="url(#colorProjected)" />
                                <Area type="monotone" dataKey="actual" name="Actual" stroke="#0D9488" fillOpacity={1} fill="url(#colorActual)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-1">Loan Performance</h3>
                    <p className="text-sm text-slate-500 mb-6">Distribution of loan health status.</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={analytics.loanPerformance} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                                    {analytics.loanPerformance.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-1">Customer Demographics</h3>
                    <p className="text-sm text-slate-500 mb-6">Active borrower base separated by age groups.</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.demographicsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="ageGroup" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Number of Customers" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                                    {analytics.demographicsData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
