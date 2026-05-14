import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, CheckCircle, FileText, Heart, Info, ShieldCheck, TrendingUp, XCircle } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '@/utils/formatCurrency';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskFactor {
    label: string;
    score: string;
    color: string;
    desc: string;
}

interface RiskAssessmentData {
    overallRiskScore: number;
    riskCategory: string;
    approvalProbability: number;
    approvalCategory: string;
    dti: number;
    dtiCategory: string;
    factors: RiskFactor[];
    insights: string[];
    alerts: Array<{ title: string; desc: string }>;
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

interface ApplicationRecord {
    id: string;
    status: string;
    loanAmount: string | number;
    loanPurpose: string;
    eligibilityResult?: EligibilityResult;
    eligibilityCheckedAt?: string;
    documents?: Array<{ _id?: string; fileName: string; fileType: string; status: string }>;
}

const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => (
    (status === 'Approved' || status === 'Manager Approved')
        ? 'success'
        : (status === 'Rejected' || status === 'Manager Rejected')
            ? 'error'
            : status === 'Needs Info'
                ? 'warning'
                : 'info'
);

const getVerdictVariant = (verdict?: string): 'default' | 'success' | 'warning' | 'error' => {
    if (!verdict) return 'default';
    if (verdict === 'Likely Eligible') return 'success';
    if (verdict === 'Conditionally Eligible') return 'warning';
    return 'error';
};

export const RiskResult = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
    const [application, setApplication] = useState<ApplicationRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const [riskRes, applicationsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/applications/${id}/risk`),
                    fetch('http://localhost:5000/api/applications/my-applications')
                ]);

                const riskPayload = await riskRes.json();
                if (riskPayload.status === 'success') {
                    setRiskData(riskPayload.data);
                } else {
                    setError(riskPayload.message || 'Failed to fetch assessment');
                }

                if (applicationsRes.ok) {
                    const applications = await applicationsRes.json();
                    const currentApplication = applications.find((entry: ApplicationRecord) => entry.id === id);
                    setApplication(currentApplication || null);
                }
            } catch {
                setError('Error connecting to Risk Engine');
            } finally {
                setLoading(false);
            }
        };

        if (id && id !== 'System-Mock') {
            void fetchRiskData();
        } else {
            setTimeout(() => {
                setRiskData({
                    overallRiskScore: 15,
                    riskCategory: 'Low Risk',
                    approvalProbability: 85,
                    approvalCategory: 'Highly Recommended',
                    dti: 28,
                    dtiCategory: 'Low',
                    factors: [
                        { label: 'Payment History', score: 'Excellent', color: 'text-green-600', desc: 'No missed payments' },
                        { label: 'Debt-to-Income', score: 'Excellent', color: 'text-green-600', desc: 'Healthy balance of income to debts' }
                    ],
                    insights: ['Applicant income stability is good.'],
                    alerts: []
                });
                setLoading(false);
            }, 800);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Analyzing your loan application...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200">
                <Info className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="font-semibold">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/customer/loans')}>Return to My Loans</Button>
            </div>
        );
    }

    if (!riskData) return null;

    const isGood = riskData.approvalProbability >= 70;
    const isModerate = riskData.approvalProbability >= 40 && riskData.approvalProbability < 70;

    const statusColor = isGood ? 'text-green-600 dark:text-green-400' : isModerate ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
    const bgStatusColor = isGood ? 'bg-green-100 dark:bg-green-900/30' : isModerate ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30';

    const probabilityData = {
        labels: ['Approval Probability', 'Remaining'],
        datasets: [{
            data: [riskData.approvalProbability, 100 - riskData.approvalProbability],
            backgroundColor: [isGood ? '#10b981' : isModerate ? '#f59e0b' : '#ef4444', 'rgba(200, 200, 200, 0.2)'],
            borderWidth: 0,
            circumference: 270,
            rotation: 225,
        }]
    };

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => navigate('/customer/loans')}
                    >
                        Back to My Loans
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Application Result - {id}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Detailed risk analysis and uploaded document validation for your application.</p>
                </div>
            </div>

            {application && (
                <>
                    {application.documents && application.documents.length > 0 && (
                        <Card className="p-5">
                            <h3 className="text-base font-semibold mb-4">Uploaded Documents</h3>
                            <div className="space-y-3">
                                {application.documents.map((doc, idx) => (
                                    <div key={doc._id || `${doc.fileName}-${idx}`} className="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{doc.fileName}</p>
                                                <p className="text-xs text-slate-500">{doc.fileType}</p>
                                            </div>
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

                    {application.eligibilityResult ? (
                        <>
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900">
                                <div>
                                    <p className="text-sm text-slate-500">Loan Purpose</p>
                                    <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                        {application.loanPurpose}
                                    </h2>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge variant={getStatusVariant(application.status)}>{application.status}</Badge>
                                        <Badge variant={getVerdictVariant(application.eligibilityResult.verdict)}>
                                            {application.eligibilityResult.verdict}
                                        </Badge>
                                    </div>
                                    {application.eligibilityCheckedAt && (
                                        <p className="text-xs text-slate-500 mt-3">
                                            Eligibility checked on {new Date(application.eligibilityCheckedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-sm text-slate-500">Requested Amount</p>
                                    <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                        LKR {formatNumber(Number(application.loanAmount))}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Eligibility Score</p>
                                    <p className="mt-2 text-2xl font-bold">{application.eligibilityResult.eligibilityScore}/100</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Approval Probability</p>
                                    <p className="mt-2 text-2xl font-bold">{application.eligibilityResult.approvalProbability}%</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Estimated EMI</p>
                                    <p className="mt-2 text-2xl font-bold">LKR {formatNumber(application.eligibilityResult.estimatedEMI)}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Debt-to-Income</p>
                                    <p className="mt-2 text-2xl font-bold">{application.eligibilityResult.dti}%</p>
                                    <p className="text-xs text-slate-500 mt-1">{application.eligibilityResult.dtiCategory}</p>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <Card className="p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                This application does not have a stored eligibility result yet, but the risk analysis below is available.
                            </p>
                        </Card>
                    )}
                </>
            )}

            <Card className="overflow-hidden border-0 shadow-lg bg-linear-to-br from-white to-gray-50 dark:from-dark-bg-secondary dark:to-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-8 items-center">
                    <div className="space-y-6">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bgStatusColor} ${statusColor} mb-4`}>
                                {isGood ? 'Looks Great!' : isModerate ? 'Needs Attention' : 'Action Required'}
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                Your application has a {riskData.approvalProbability}% chance of approval.
                            </h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                This estimate is based on our AI engine analyzing your profile, debt-to-income ratio, and requested loan amount.
                                {isGood ? ' You are in a fantastic position to secure this loan!' : ' Read the tips below to see how you can improve your chances.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Debt-to-Income</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{riskData.dti}%</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Risk Tier</p>
                                <p className={`text-xl font-bold mt-1 ${statusColor}`}>{riskData.riskCategory.replace(' Risk', '')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-64 flex justify-center items-center">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                            <span className={`text-4xl font-extrabold ${statusColor}`}>{riskData.approvalProbability}%</span>
                            <span className="text-sm text-gray-500 font-medium">Match</span>
                        </div>
                        <Doughnut data={probabilityData} options={{ maintainAspectRatio: false, cutout: '80%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }} />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Profile Strengths</h3>
                    </div>

                    <ul className="space-y-4">
                        {riskData.factors.filter((factor) => factor.color.includes('green') || factor.color.includes('blue')).length > 0 ? (
                            riskData.factors
                                .filter((factor) => factor.color.includes('green') || factor.color.includes('blue'))
                                .map((factor, i) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{factor.label}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{factor.desc}</p>
                                        </div>
                                    </li>
                                ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No significant strengths identified yet. Keep building your profile!</p>
                        )}
                    </ul>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tips for Improvement</h3>
                    </div>

                    <ul className="space-y-4">
                        {riskData.factors.filter((factor) => factor.color.includes('yellow') || factor.color.includes('red')).length > 0 ? (
                            riskData.factors
                                .filter((factor) => factor.color.includes('yellow') || factor.color.includes('red'))
                                .map((factor, i) => (
                                    <li key={i} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{factor.label}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{factor.desc}</p>
                                        </div>
                                    </li>
                                ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Your profile is in top shape! No major red flags detected.</p>
                            </div>
                        )}
                    </ul>
                </Card>
            </div>

            <div className="text-center pt-4">
                <Button size="lg" className="px-12" onClick={() => navigate('/customer/loans')}>
                    Understood, Return to Loans
                </Button>
            </div>
        </div>
    );
};
