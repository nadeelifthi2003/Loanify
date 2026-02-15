
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, TrendingUp, DollarSign, Briefcase, Activity, Download, Flag } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export const RiskAssessment = () => {
    const navigate = useNavigate();
    const { id = 'System-Mock' } = useParams();

    // Mock Data for Charts
    const creditScoreData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Credit Score Trend',
                data: [680, 690, 695, 710, 715, 720],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const riskDistributionData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                label: '# of Votes',
                data: [15, 5, 2],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => navigate(`/officer/application/${id}`)}
                    >
                        Back
                    </Button>
                    <h1 className="text-xl font-medium text-gray-600 dark:text-gray-300">Risk Assessment Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">Application ID: <span className="text-gray-700 dark:text-gray-200 font-medium">#{id}</span></p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                        Download Report
                    </Button>
                    <Button variant="danger" leftIcon={<Flag className="w-4 h-4" />}>
                        Flag for Review
                    </Button>
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Overall Risk Score</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">15/100</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Low Risk</span>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                            <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Approval Probability</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">85%</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Highly Recommended</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Debt-to-Income Ratio</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">32%</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Moderate</span>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                            <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detailed Analysis - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Graph Section */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Credit Score History</h2>
                        <div className="h-64">
                            <Line options={{ maintainAspectRatio: false }} data={creditScoreData} />
                        </div>
                    </Card>

                    {/* Key Factors Breakdown */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Risk Factor Analysis</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Payment History', score: 'Excellent', color: 'text-green-600', desc: 'No missed payments in last 24 months' },
                                { label: 'Credit Utilization', score: 'Good', color: 'text-blue-600', desc: 'Using 25% of available credit limit' },
                                { label: 'Length of Credit History', score: 'Fair', color: 'text-yellow-600', desc: 'Average account age is 3 years' },
                                { label: 'Recent Inquiries', score: 'Good', color: 'text-blue-600', desc: '2 inquiries in last 6 months' },
                                { label: 'Credit Mix', score: 'Excellent', color: 'text-green-600', desc: 'Healthy mix of revolving and installment credit' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                    </div>
                                    <span className={`text-sm font-semibold ${item.color} bg-white dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600`}>
                                        {item.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* AI/ML Insights */}
                    <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-indigo-100 dark:border-indigo-900">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-base font-medium text-indigo-900 dark:text-indigo-300">System Generated Insights</h2>
                        </div>
                        <ul className="space-y-2">
                            <li className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                                <span className="font-bold">•</span> Applicant's income stability is rated primarily based on 2 years of consistent deposits.
                            </li>
                            <li className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                                <span className="font-bold">•</span> Spending patterns indicate a low propensity for discretionary spending spikes.
                            </li>
                            <li className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                                <span className="font-bold">•</span> No red flags detected in document authenticity verification.
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Risk Distribution Chart */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Portfolio Risk Comparison</h2>
                        <div className="h-48 flex justify-center">
                            <Doughnut data={riskDistributionData} options={{ cutout: '70%', maintainAspectRatio: false }} />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-4">Where this applicant sits compared to recent approvals</p>
                    </Card>

                    {/* Anomalies / Alerts */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Potential Alerts
                        </h2>
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Address Mismatch</p>
                                <p className="text-xs text-orange-600 dark:text-orange-400">Current address differs from last known bank record (2023).</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">High Inquiry Volume</p>
                                <p className="text-xs text-gray-500">3 credit inquiries in the last 30 days.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Internal Notes */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Internal Notes</h2>
                        <textarea
                            className="w-full h-32 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent dark:text-gray-200"
                            placeholder="Add your risk assessment notes here..."
                        ></textarea>
                        <Button className="w-full mt-3" size="sm">Save Note</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
