import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, CreditCard, Calendar, ArrowUpRight, TrendingUp, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';

interface Application {
    id: string;
    status: string;
    date: string;
    loanAmount: string | number;
    loanCurrency: string;
    loanPurpose: string;
    paidAmount?: number;
    tenure?: number;
    nextDueDate?: string;
}

export const CustomerDashboard = () => {
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/applications/my-applications');
                const data = await response.json();
                setRecentApplications(data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        fetchApplications();
    }, []);

    const activeLoans = recentApplications.filter(app => app.status === 'Approved');
    const totalActiveLoans = activeLoans.length;
    
    let totalActiveBalance = 0;
    let totalNextPayment = 0;
    
    activeLoans.forEach(app => {
        const amount = Number(app.loanAmount) || 0;
        const paid = app.paidAmount || 0;
        const balance = Math.max(0, amount - paid);
        totalActiveBalance += balance;
        
        const nextPay = Math.min(balance, Math.round(amount / (app.tenure || 12)));
        if (balance > 0) totalNextPayment += nextPay;
    });

    const upcomingDates = activeLoans
        .map(a => new Date(a.nextDueDate || new Date()))
        .sort((a, b) => a.getTime() - b.getTime());
    
    const nearestDueDate = upcomingDates.length > 0 
        ? upcomingDates[0].toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Update Pending';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Dashboard Overview
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Welcome back, manage your finances here.
                    </p>
                </div>
                <Link to="/customer/apply">
                    <Button rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                        Apply for New Loan
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-primary">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Balance</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">LKR {totalActiveBalance.toLocaleString()}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-teal">
                    <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Next Payment</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">LKR {totalNextPayment.toLocaleString()}</p>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                            Due {nearestDueDate}
                        </p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Loans</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{totalActiveLoans}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-green-500">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Credit Score</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">720</p>
                        <Badge variant="success" size="sm" className="mt-1">Excellent</Badge>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Recent Applications</h2>
                        <Link to="/customer/loans" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <Card className="divide-y divide-light-border dark:divide-dark-border">
                        {recentApplications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No recent applications found.
                            </div>
                        ) : (
                            recentApplications.map((app) => (
                                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{app.loanPurpose}</p>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Application #{app.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-light-text-primary dark:text-dark-text-primary">
                                            <span className="text-xs font-semibold text-primary mr-1">LKR</span>
                                            {Number(app.loanAmount).toLocaleString()}
                                        </p>
                                        <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : app.status === 'Needs Info' ? 'warning' : 'info'} size="sm" className="mt-1">
                                            {app.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>

                {/* Quick Actions / Notices */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Notifications</h2>
                    <Card className="p-4 space-y-4">
                        <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Payment Due Soon</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Your total EMI of LKR {totalNextPayment.toLocaleString()} is due soon.
                                </p>
                                <Link to="/customer/loans">
                                    <Button size="sm" variant="outline" className="mt-2 w-full">Pay Now</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="h-px bg-light-border dark:bg-dark-border" />
                        <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Loan Approved</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Your application for Home Renovation Loan has been approved.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
