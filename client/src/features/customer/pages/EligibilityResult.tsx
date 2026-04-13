import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, AlertTriangle, Info, TrendingUp, Home, FileText } from 'lucide-react';
import { formatNumber } from '@/utils/formatCurrency';

interface RiskFactor {
    label: string;
    score: string;
    color: string;
    desc: string;
}

interface EligibilityData {
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

export const EligibilityResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { result, applicationId, applicantName } = (location.state || {}) as {
        result: EligibilityData;
        applicationId: string;
        applicantName: string;
    };

    // Guard: if navigated directly without state
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Info className="w-10 h-10 text-gray-400" />
                <p className="text-gray-500">No eligibility data found. Please submit a loan application first.</p>
                <Button onClick={() => navigate('/customer/apply')}>Apply for a Loan</Button>
            </div>
        );
    }

    const isEligible = result.eligible;
    const isConditional = result.verdict === 'Conditionally Eligible';

    const headerBg = isEligible
        ? isConditional
            ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800'
            : 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800'
        : 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-red-200 dark:border-red-800';

    const VerdictIcon = isEligible
        ? isConditional ? AlertTriangle : CheckCircle
        : XCircle;

    const verdictIconColor = isEligible
        ? isConditional ? 'text-yellow-500' : 'text-green-500'
        : 'text-red-500';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

            {/* Hero verdict banner */}
            <Card className={`p-8 bg-linear-to-br border-2 ${headerBg}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className={`p-4 rounded-full bg-white dark:bg-gray-900 shadow-sm flex-shrink-0 self-start`}>
                        <VerdictIcon className={`w-10 h-10 ${verdictIconColor}`} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Loan Eligibility Result · Ref #{applicationId}
                        </p>
                        <h1 className={`text-3xl font-extrabold ${result.verdictColor}`}>
                            {result.verdict}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Hi <strong>{applicantName}</strong>! Based on your income, loan details, and submitted documents, our AI engine has assessed your loan eligibility.
                        </p>
                    </div>
                    <div className="text-center md:text-right flex-shrink-0">
                        <div className="text-5xl font-black text-gray-800 dark:text-white">{result.approvalProbability}%</div>
                        <div className="text-sm text-gray-500 mt-1">Approval Probability</div>
                    </div>
                </div>
            </Card>

            {/* Key metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Eligibility Score', value: `${result.eligibilityScore}/100`, sub: 'Composite' },
                    { label: 'Estimated EMI', value: `LKR ${formatNumber(result.estimatedEMI)}`, sub: 'per month' },
                    { label: 'Debt-to-Income', value: `${result.dti}%`, sub: result.dtiCategory },
                    { label: 'Doc Bonus', value: result.documentBonus > 0 ? `+${result.documentBonus} pts` : '0 pts', sub: result.documentBonus > 0 ? 'Income Verified' : 'Upload docs for bonus' },
                ].map((m, i) => (
                    <Card key={i} className="p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{m.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{m.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="p-6">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> What's working in your favour
                    </h2>
                    {result.strengths.length > 0 ? (
                        <ul className="space-y-4">
                            {result.strengths.map((f, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            {f.label}
                                            <span className={`text-xs font-normal ${f.color}`}>{f.score}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No strong positives detected yet.</p>
                    )}
                </Card>

                {/* Improvements */}
                <Card className="p-6">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-yellow-500" /> How to improve your chances
                    </h2>
                    {result.improvements.length > 0 ? (
                        <ul className="space-y-4">
                            {result.improvements.map((f, i) => (
                                <li key={i} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            {f.label}
                                            <span className={`text-xs font-normal ${f.color}`}>{f.score}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">No improvement areas — you're in great shape!</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Alerts */}
            {result.alerts.length > 0 && (
                <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                    <h2 className="text-base font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Issues Requiring Attention
                    </h2>
                    <div className="space-y-3">
                        {result.alerts.map((a, i) => (
                            <div key={i} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-sm font-bold text-red-700 dark:text-red-300">{a.title}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Insights */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-900">
                <h2 className="text-base font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> AI Engine Insights
                </h2>
                <ul className="space-y-2">
                    {result.insights.map((ins, i) => (
                        <li key={i} className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                            <span className="font-bold flex-shrink-0">•</span> {ins}
                        </li>
                    ))}
                </ul>
                {result.maxRecommendedLoan > 0 && (
                    <div className="mt-4 p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Maximum Recommended Loan</p>
                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mt-0.5">
                            LKR {formatNumber(result.maxRecommendedLoan)}
                        </p>
                    </div>
                )}
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-6">
                <Button variant="outline" leftIcon={<Home className="w-4 h-4" />} onClick={() => navigate('/customer')}>
                    Back to Dashboard
                </Button>
                <Button leftIcon={<FileText className="w-4 h-4" />} onClick={() => navigate('/customer/loans')}>
                    View My Applications
                </Button>
            </div>
        </div>
    );
};
