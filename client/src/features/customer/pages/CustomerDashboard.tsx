import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, CreditCard, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerDashboard = () => {
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
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">$12,450.00</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-teal">
                    <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Next Payment</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">$850.00</p>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Due Sep 25, 2024</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Loans</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">2</p>
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
                        <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Recent Transactions</h2>
                        <Link to="/customer/loans" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <Card className="divide-y divide-light-border dark:divide-dark-border">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Monthly EMI Payment</p>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Personal Loan #L-8321</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-light-text-primary dark:text-dark-text-primary">-$850.00</p>
                                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Aug 25, 2024</p>
                                </div>
                            </div>
                        ))}
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
                                    Your EMI of $850 for Personal Loan is due in 3 days.
                                </p>
                                <Button size="sm" variant="outline" className="mt-2 w-full">Pay Now</Button>
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
