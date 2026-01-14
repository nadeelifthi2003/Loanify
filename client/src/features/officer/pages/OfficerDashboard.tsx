import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Users, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OfficerDashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
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
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">12</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Approved Today</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">5</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Risk Flagged</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">3</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Customers</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">1,204</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applications Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Recent Applications</h2>
                        <Link to="/officer/applications" className="text-sm text-primary hover:underline">View Queue</Link>
                    </div>
                    <Card className="divide-y divide-light-border dark:divide-dark-border">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-medium text-slate-500">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary">John Doe</p>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Personal Loan • $15,000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={i === 2 ? 'warning' : 'info'} size="sm">
                                        {i === 2 ? 'High Risk' : 'Pending'}
                                    </Badge>
                                    <Button size="sm" variant="ghost" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Tasks / Notices */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Pending Tasks</h2>
                    <Card className="p-4 space-y-4">
                        <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Verify Income Documents</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Application #L-9942 requires manual income verification.
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-light-border dark:bg-dark-border" />
                        <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Risk Assessment Review</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Review high-risk flag for Application #L-8831.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
