import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DollarSign, CreditCard, Calendar, ArrowUpRight, TrendingUp, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatNumber } from '@/utils/formatCurrency';

import { useState, useEffect } from 'react';

interface RiskFactor {
    label: string;
    score: string;
    color: string;
    desc: string;
}

interface EligibilityResult {
    eligible: boolean;
    verdict: string;
    verdictColor: string;
    eligibilityScore: number;
    approvalProbability: number;
    estimatedEMI: number;
    dti: number;
    dtiCategory: string;
    lti: number;
    maxRecommendedLoan: number;
    documentBonus: number;
    strengths: RiskFactor[];
    improvements: RiskFactor[];
    insights: string[];
    alerts: Array<{ title: string; desc: string }>;
}

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
    createdAt?: string;
    eligibilityResult?: EligibilityResult;
    eligibilityCheckedAt?: string;
    documents?: Array<{ _id: string; fileName: string; fileType: string; status: string }>;
}

export const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/applications/my-applications');
            const data = await response.json();
            setRecentApplications(data);
            return data as Application[];
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    };

    useEffect(() => {
        void fetchApplications();
    }, []);

    const openApplicationResult = async (applicationId: string) => {
        const applications = await fetchApplications();
        const latestApplication = applications.find((entry) => entry.id === applicationId);
        setSelectedApplication(latestApplication || recentApplications.find((entry) => entry.id === applicationId) || null);
    };

    const activeLoans = recentApplications.filter(app => app.status === 'Approved' || app.status === 'Manager Approved');
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

    const getStatusVariant = (status: string) => (
        (status === 'Approved' || status === 'Manager Approved')
            ? 'success'
            : (status === 'Rejected' || status === 'Manager Rejected')
                ? 'error'
                : status === 'Needs Info'
                    ? 'warning'
                    : 'info'
    );

    const getVerdictVariant = (verdict?: string) => {
        if (!verdict) return 'default';
        if (verdict === 'Likely Eligible') return 'success';
        if (verdict === 'Conditionally Eligible') return 'warning';
        return 'error';
    };

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
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">LKR {formatNumber(totalActiveBalance)}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-4 border-l-4 border-l-teal">
                    <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Next Payment</p>
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">LKR {formatNumber(totalNextPayment)}</p>
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
                                <button
                                    key={app.id}
                                    type="button"
                                    onClick={() => void openApplicationResult(app.id)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{app.loanPurpose}</p>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Application #{app.id}</p>
                                            <p className="text-[11px] text-primary mt-1">
                                                {app.eligibilityResult ? 'Click to view eligibility result' : 'Click to view application details'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-light-text-primary dark:text-dark-text-primary">
                                            <span className="text-xs font-semibold text-primary mr-1">LKR</span>
                                            {formatNumber(Number(app.loanAmount))}
                                        </p>
                                        <div className="mt-1 flex flex-col items-end gap-1">
                                            <Badge variant={getStatusVariant(app.status)} size="sm">
                                                {app.status}
                                            </Badge>
                                            {app.eligibilityResult && !['Approved', 'Manager Approved', 'Rejected', 'Manager Rejected'].includes(app.status) && (
                                                <Badge variant={getVerdictVariant(app.eligibilityResult.verdict)} size="sm">
                                                    {app.eligibilityResult.verdict}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </Card>
                </div>

                {/* Quick Actions / Notices */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Notifications</h2>
                    <Card className="p-4 space-y-4">
                        {totalNextPayment > 0 && (
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Payment Due Soon</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Your total EMI of LKR {formatNumber(totalNextPayment)} is due soon.
                                    </p>
                                    <Link to="/customer/loans">
                                        <Button size="sm" variant="outline" className="mt-2 w-full">Pay Now</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                        
                        {totalNextPayment > 0 && activeLoans.length > 0 && (
                            <div className="h-px bg-light-border dark:bg-dark-border" />
                        )}

                        {activeLoans.length > 0 && (
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Loan Approved</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        Your application for {activeLoans[0]?.loanPurpose || 'Loan'} has been approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        {totalNextPayment === 0 && activeLoans.length === 0 && (
                            <div className="py-6 text-center">
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No new notifications at this time.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={Boolean(selectedApplication)}
                onClose={() => setSelectedApplication(null)}
                title={selectedApplication ? `Application Result - ${selectedApplication.id}` : 'Application Result'}
                size="xl"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setSelectedApplication(null)}>Close</Button>
                        {selectedApplication && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const targetId = selectedApplication.id;
                                    setSelectedApplication(null);
                                    navigate(`/customer/application/${targetId}/risk`);
                                }}
                            >
                                View Risk Analysis
                            </Button>
                        )}
                        <Link to="/customer/loans">
                            <Button>View My Applications</Button>
                        </Link>
                    </>
                }
            >
                {selectedApplication ? (
                    <div className="space-y-6">
                        {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                            <Card className="p-5">
                                <h4 className="text-base font-semibold mb-4">Uploaded Documents</h4>
                                <div className="space-y-3">
                                    {selectedApplication.documents.map((doc, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-slate-400" />
                                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{doc.fileName}</p>
                                            </div>
                                            {doc.status === 'Invalid' ? (
                                                <Badge variant="error" className="bg-red-500 text-white font-bold px-3 py-1 flex items-center gap-1 shadow-sm ring-2 ring-red-500 ring-offset-1">
                                                    <XCircle className="w-4 h-4" /> Invalid by System
                                                </Badge>
                                            ) : doc.status === 'Valid' ? (
                                                <Badge variant="success" className="bg-green-100 text-green-700 font-bold px-3 py-1 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Valid by System
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning">{doc.status}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                        {!selectedApplication.eligibilityResult ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    This application does not have a stored eligibility result yet.
                                </p>
                            </div>
                        ) : (
                                <><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900">
                            <div>
                                <p className="text-sm text-slate-500">Loan Purpose</p>
                                <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {selectedApplication.loanPurpose}
                                </h3>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Badge variant={getStatusVariant(selectedApplication.status)}>{selectedApplication.status}</Badge>
                                    <Badge variant={getVerdictVariant(selectedApplication.eligibilityResult.verdict)}>
                                        {selectedApplication.eligibilityResult.verdict}
                                    </Badge>
                                </div>
                                {selectedApplication.eligibilityCheckedAt && (
                                    <p className="text-xs text-slate-500 mt-3">
                                        Eligibility checked on {new Date(selectedApplication.eligibilityCheckedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-sm text-slate-500">Requested Amount</p>
                                <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                    LKR {formatNumber(Number(selectedApplication.loanAmount))}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Eligibility Score</p>
                                <p className="mt-2 text-2xl font-bold">{selectedApplication.eligibilityResult.eligibilityScore}/100</p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Approval Probability</p>
                                <p className="mt-2 text-2xl font-bold">{selectedApplication.eligibilityResult.approvalProbability}%</p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Estimated EMI</p>
                                <p className="mt-2 text-2xl font-bold">LKR {formatNumber(selectedApplication.eligibilityResult.estimatedEMI)}</p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Debt-to-Income</p>
                                <p className="mt-2 text-2xl font-bold">{selectedApplication.eligibilityResult.dti}%</p>
                                <p className="text-xs text-slate-500 mt-1">{selectedApplication.eligibilityResult.dtiCategory}</p>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-5">
                                <h4 className="text-base font-semibold mb-4">Strengths</h4>
                                {selectedApplication.eligibilityResult.strengths.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedApplication.eligibilityResult.strengths.map((factor, index) => (
                                            <div key={`${factor.label}-${index}`} className="rounded-lg border border-green-100 dark:border-green-900/30 bg-green-50/70 dark:bg-green-900/10 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-medium">{factor.label}</p>
                                                    <span className={`text-xs font-semibold ${factor.color}`}>{factor.score}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{factor.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No strong positives recorded for this application yet.</p>
                                )}
                            </Card>
                            <Card className="p-5">
                                <h4 className="text-base font-semibold mb-4">Improvement Areas</h4>
                                {selectedApplication.eligibilityResult.improvements.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedApplication.eligibilityResult.improvements.map((factor, index) => (
                                            <div key={`${factor.label}-${index}`} className="rounded-lg border border-amber-100 dark:border-amber-900/30 bg-amber-50/70 dark:bg-amber-900/10 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-medium">{factor.label}</p>
                                                    <span className={`text-xs font-semibold ${factor.color}`}>{factor.score}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{factor.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No major improvement items were flagged for this result.</p>
                                )}
                            </Card>
                        </div>

                        <Card className="p-5">
                            <h4 className="text-base font-semibold mb-4">AI Insights</h4>
                            <div className="space-y-2">
                                {selectedApplication.eligibilityResult.insights.map((insight, index) => (
                                    <p key={`${insight}-${index}`} className="text-sm text-slate-700 dark:text-slate-300">
                                        {index + 1}. {insight}
                                    </p>
                                ))}
                            </div>
                            {selectedApplication.eligibilityResult.maxRecommendedLoan > 0 && (
                                <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Maximum Recommended Loan</p>
                                    <p className="mt-1 text-lg font-semibold">
                                        LKR {formatNumber(selectedApplication.eligibilityResult.maxRecommendedLoan)}
                                    </p>
                                </div>
                            )}
                        </Card>

                        {selectedApplication.eligibilityResult.alerts.length > 0 && (
                            <Card className="p-5 border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/10">
                                <h4 className="text-base font-semibold text-red-700 dark:text-red-300 mb-4">Alerts</h4>
                                <div className="space-y-3">
                                    {selectedApplication.eligibilityResult.alerts.map((alert, index) => (
                                        <div key={`${alert.title}-${index}`} className="rounded-lg bg-white/70 dark:bg-slate-900/60 border border-red-200 dark:border-red-800 p-3">
                                            <p className="font-medium text-red-700 dark:text-red-300">{alert.title}</p>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{alert.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                        </>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};
