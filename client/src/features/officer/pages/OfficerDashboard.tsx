import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Users, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OfficerDashboard = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<any[]>([]);
    const [customersCount, setCustomersCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appsRes, custRes] = await Promise.all([
                    fetch('http://localhost:5000/api/officer/applications'),
                    fetch('http://localhost:5000/api/officer/customers')
                ]);
                if (appsRes.ok) {
                    setApplications(await appsRes.json());
                }
                if (custRes.ok) {
                    const custData = await custRes.json();
                    setCustomersCount(custData.length);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const pendingCount = applications.filter(a => a.status === 'Pending').length;
    // Approvals checking date string to just simulate a today's count
    const approvedToday = applications.filter(a => a.status === 'Approved').length; // Kept simple
    // Mock high risk indicator by loanAmount > 100000 simply for visuals on pending items
    const riskFlagged = applications.filter(a => a.status === 'Pending' && a.loanAmount > 100000).length;
    const recentApplications = applications.slice(0, 4);

    const pendingTasks = applications
        .filter(a => a.status === 'Pending')
        .slice(0, 3)
        .map(app => {
            if (app.loanAmount > 100000) {
                return { title: 'High Risk Review', desc: `Review application #${app.id} for ${app.fullName} flagged for high amount.`, link: `/officer/application/${app.id}/risk`, color: 'bg-red-500' };
            }
            return { title: 'Standard Verification', desc: `Verify documents for ${app.fullName} application #${app.id}.`, link: `/officer/application/${app.id}`, color: 'bg-amber-500' };
        });

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            <div>
                <h1 className="text-2xl font-bold">
                    Officer Overview
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Review applications and assess risk.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Pending Reviews</p>
                        <p className="text-xl font-bold">{pendingCount}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Approved</p>
                        <p className="text-xl font-bold">{approvedToday}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Risk Flagged</p>
                        <p className="text-xl font-bold">{riskFlagged}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Customers</p>
                        <p className="text-xl font-bold">{customersCount}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applications Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Applications</h2>
                        <Link to="/officer/applications" className="text-sm text-primary hover:underline">View Queue</Link>
                    </div>
                    <Card className="divide-y divide-light-border dark:divide-dark-border">
                        {recentApplications.map((app) => (
                            <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-medium text-slate-500">
                                        {app.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{app.fullName}</p>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {app.loanType} • ${app.loanAmount?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : app.status === 'Needs Info' ? 'warning' : 'info'} size="sm">
                                        {app.status}
                                    </Badge>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        rightIcon={<ChevronRight className="w-4 h-4" />}
                                        onClick={() => navigate(`/officer/application/${app.id}`)}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {recentApplications.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No recent applications.</div>
                        )}
                    </Card>
                </div>

                {/* Tasks / Notices */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Pending Tasks</h2>
                    <Card className="p-4 space-y-2">
                        {pendingTasks.map((task, idx) => (
                            <div key={idx} className="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-md transition-colors" onClick={() => navigate(task.link)}>
                                <div className={`w-2 h-2 rounded-full ${task.color} mt-2 shrink-0`} />
                                <div>
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        {task.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="text-sm text-gray-500 text-center py-4">No pending tasks at the moment.</div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

