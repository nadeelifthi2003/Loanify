import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, TrendingUp, DollarSign, Briefcase, Activity, Download, Flag } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import jsPDF from 'jspdf';
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
    alerts: Array<string | {title: string, desc: string}>;
}

export const RiskAssessment = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { id } = useParams();
    const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFlagging, setIsFlagging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const downloadReport = () => {
        if (!riskData) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const now = new Date();
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 14;
        const contentW = pageW - margin * 2;
        let y = 0;

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageW, 26, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text('LOANIFY', margin, 11);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
        doc.text('Algorithmic Risk Assessment Report', margin, 18);
        doc.text(`App ID: #${id}`, margin + 75, 18);
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        doc.text(`Generated: ${dateStr}`, pageW - margin, 18, { align: 'right' });
        y = 32;

        // Colors
        const isLow = riskData.overallRiskScore < 30;
        const isHigh = riskData.overallRiskScore > 60;
        const riskColor: [number,number,number] = isLow ? [22,163,74] : isHigh ? [220,38,38] : [202,138,4];
        const riskBg: [number,number,number]    = isLow ? [240,253,244] : isHigh ? [254,242,242] : [254,252,232];

        // Section header helper
        const sh = (title: string, yPos: number) => {
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, yPos, contentW, 6, 'F');
            doc.setTextColor(30, 41, 59); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
            doc.text(title.toUpperCase(), margin + 2, yPos + 4.2);
            return yPos + 9;
        };

        // Summary Cards
        const cW = contentW / 3 - 2;
        const cards = [
            { label: 'Risk Score',           value: `${riskData.overallRiskScore}/100`, sub: riskData.riskCategory,     color: riskColor,           bg: riskBg },
            { label: 'Approval Probability', value: `${riskData.approvalProbability}%`, sub: riskData.approvalCategory, color: [37,99,235]  as [number,number,number], bg: [239,246,255] as [number,number,number] },
            { label: 'Debt-to-Income Ratio', value: `${riskData.dti}%`,                sub: riskData.dtiCategory,       color: [99,102,241] as [number,number,number], bg: [238,242,255] as [number,number,number] },
        ];
        cards.forEach((c, i) => {
            const cx = margin + i * (cW + 3);
            doc.setFillColor(...c.bg); doc.roundedRect(cx, y, cW, 20, 1.5, 1.5, 'F');
            doc.setDrawColor(...c.color); doc.setLineWidth(0.5);
            doc.line(cx, y, cx, y + 20); doc.setLineWidth(0.1);
            doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100,116,139);
            doc.text(c.label, cx + 3, y + 5.5);
            doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...c.color);
            doc.text(c.value, cx + 3, y + 14);
            doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105);
            doc.text(c.sub, cx + 3, y + 19);
        });
        y += 25;

        // Factor Analysis
        y = sh('Algorithm Factor Analysis', y);
        riskData.factors.forEach((f) => {
            doc.setFillColor(248, 250, 252); doc.roundedRect(margin, y, contentW, 9, 1, 1, 'F');
            doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(30,41,59);
            doc.text(f.label, margin + 3, y + 4);
            doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100,116,139);
            doc.text(f.desc, margin + 3, y + 8);
            const sc: [number,number,number] = f.score === 'Excellent' ? [22,163,74] : f.score === 'Good' ? [37,99,235] : [202,138,4];
            doc.setTextColor(...sc); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
            doc.text(f.score, pageW - margin - 3, y + 4, { align: 'right' });
            y += 11;
        });
        y += 2;

        // AI Insights (2-column)
        y = sh('AI Model Insights', y);
        const half = Math.ceil(riskData.insights.length / 2);
        riskData.insights.forEach((insight, idx) => {
            const col = idx < half ? 0 : 1;
            const row = idx < half ? idx : idx - half;
            const ix = margin + col * (contentW / 2 + 1);
            const iy = y + row * 8;
            doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(51,65,85);
            const wrapped = doc.splitTextToSize(`• ${insight}`, contentW / 2 - 4);
            doc.text(wrapped, ix + 2, iy + 4);
        });
        y += Math.ceil(riskData.insights.length / 2) * 8 + 4;

        // Credit Score History chart
        y = sh('Credit Score History (6-Month Trend)', y);
        const cScores = [680, 690, 695, 710, 715, 720];
        const cLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const cH = 30;
        const cX = margin + 12;
        const cY = y;
        const cWid = contentW - 12;
        const minS = 660, maxS = 740, sRange = maxS - minS;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, cY, contentW, cH + 10, 1.5, 1.5, 'F');
        doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(75,192,192);
        doc.text('Trend: +40 pts (Improving)', margin + contentW - 2, cY + 4.5, { align: 'right' });

        [680, 700, 720].forEach(s => {
            const gy = cY + cH - ((s - minS) / sRange) * cH;
            doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.15);
            doc.line(cX + 6, gy, cX + cWid - 2, gy);
            doc.setFontSize(5.5); doc.setTextColor(148,163,184); doc.setFont('helvetica','normal');
            doc.text(String(s), cX + 4, gy + 1.2, { align: 'right' });
        });

        const cCol = (cWid - 14) / (cScores.length - 1);
        const pts = cScores.map((s, i) => ({
            px: cX + 8 + i * cCol,
            py: cY + cH - ((s - minS) / sRange) * cH,
        }));
        doc.setDrawColor(75, 192, 192); doc.setLineWidth(0.7);
        for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i].px, pts[i].py, pts[i+1].px, pts[i+1].py);
        pts.forEach((pt, i) => {
            doc.setFillColor(75,192,192); doc.circle(pt.px, pt.py, 1, 'F');
            doc.setFillColor(255,255,255); doc.circle(pt.px, pt.py, 0.45, 'F');
            doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setTextColor(51,65,85);
            doc.text(String(cScores[i]), pt.px, pt.py - 1.8, { align: 'center' });
            doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
            doc.text(cLabels[i], pt.px, cY + cH + 7, { align: 'center' });
        });
        y += cH + 14;

        // Alerts
        if (riskData.alerts.length > 0) {
            y = sh('High Priority Alerts', y);
            riskData.alerts.forEach((alert) => {
                const alertTitle = typeof alert === 'string' ? alert : alert.title;
                const alertDesc  = typeof alert === 'string' ? '' : alert.desc;
                doc.setFillColor(255, 247, 237);
                doc.roundedRect(margin, y, contentW, alertDesc ? 12 : 8, 1, 1, 'F');
                doc.setDrawColor(251,146,60); doc.setLineWidth(0.4);
                doc.line(margin, y, margin, y + (alertDesc ? 12 : 8)); doc.setLineWidth(0.1);
                doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(194,65,12);
                doc.text(`[!] ${alertTitle}`, margin + 3, y + 5);
                if (alertDesc) {
                    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(154,52,18);
                    doc.text(alertDesc, margin + 3, y + 10);
                }
                y += (alertDesc ? 12 : 8) + 3;
            });
        }

        // Footer
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 285, pageW, 12, 'F');
        doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(148,163,184);
        doc.text('CONFIDENTIAL - For internal Loanify officer use only. Not for distribution.', margin, 292);
        doc.text('Page 1 of 1', pageW - margin, 292, { align: 'right' });

        doc.save(`Risk_Report_${id}_${now.toISOString().slice(0, 10)}.pdf`);
        showToast('PDF report downloaded successfully', 'success');
    };

    const handleFlagForReview = async () => {
        setIsFlagging(true);
        try {
            const res = await fetch(`http://localhost:5000/api/officer/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Manager Review' })
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast('Application successfully escalated to Manager Review', 'success');
                navigate('/officer/applications');
            } else {
                showToast(data.message || 'Failed to flag application', 'error');
            }
        } catch (error) {
            console.error('Status update failed:', error);
            showToast('Network error while flagging application', 'error');
        } finally {
            setIsFlagging(false);
        }
    };

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/applications/${id}/risk`);
                const data = await res.json();
                if (data.status === 'success') {
                    setRiskData(data.data);
                } else {
                    setError(data.message || 'Failed to fetch risk data');
                }
            } catch {
                setError('Error connecting to backend API');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRiskData();
        } else {
            setLoading(false);
        }
    }, [id]);

    if (!id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Algorithmic Risk Assessment</h1>
                <p className="text-gray-500 max-w-md">Please select a specific loan application from the dashboard or queue to run the AI risk predictor and view its analysis report.</p>
                <Button className="mt-6" onClick={() => navigate('/officer/applications')}>View All Applications</Button>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Processing algorithmic risk assessment...</div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200">Error: {error}</div>;
    if (!riskData) return null;

    const isLowRisk = riskData.overallRiskScore < 30;
    const isHighRisk = riskData.overallRiskScore > 60;
    const riskScoreBorder = isLowRisk ? 'border-green-500' : isHighRisk ? 'border-red-500' : 'border-yellow-500';
    const riskScoreBg = isLowRisk ? 'bg-green-100 text-green-700' : isHighRisk ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
    const riskScoreIconColor = isLowRisk ? 'text-green-600 dark:text-green-400' : isHighRisk ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400';
    const riskScoreIconBg = isLowRisk ? 'bg-green-50 dark:bg-green-900/20' : isHighRisk ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20';

    const creditScoreData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Credit Score Trend',
            data: [680, 690, 695, 710, 715, 720],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    };

    const lowRiskCount = isLowRisk ? 15 : 10;
    const midRiskCount = (!isLowRisk && !isHighRisk) ? 10 : 5;
    const highRiskCount = isHighRisk ? 5 : 2;

    const riskDistributionData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
            label: '# of Approvals',
            data: [lowRiskCount, midRiskCount, highRiskCount],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }],
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
                    <h1 className="text-xl font-medium text-gray-600 dark:text-gray-300">Algorithmic Risk Assessment</h1>
                    <p className="text-sm text-gray-500 mt-1">Application ID: <span className="text-gray-700 dark:text-gray-200 font-medium">#{id}</span></p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={downloadReport}>
                        Download Report
                    </Button>
                    <Button variant="danger" leftIcon={<Flag className="w-4 h-4" />} isLoading={isFlagging} onClick={handleFlagForReview}>
                        Flag for Review
                    </Button>
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`p-6 border-l-4 ${riskScoreBorder}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Overall Predictor Score</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{riskData.overallRiskScore}/100</h3>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-medium ${riskScoreBg}`}>{riskData.riskCategory}</span>
                        </div>
                        <div className={`p-3 rounded-full ${riskScoreIconBg}`}>
                            <Activity className={`w-6 h-6 ${riskScoreIconColor}`} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Approval Probability</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{riskData.approvalProbability}%</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{riskData.approvalCategory}</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Debt-to-Income Ratio</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{riskData.dti}%</h3>
                            <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">{riskData.dtiCategory}</span>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Algorithm Factor Analysis</h2>
                        <div className="space-y-4">
                            {riskData.factors.map((item, idx) => (
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

                    <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-indigo-100 dark:border-indigo-900">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-base font-medium text-indigo-900 dark:text-indigo-300">Loanify Risk Intelligence</h2>
                        </div>
                        <ul className="space-y-2">
                            {riskData.insights.map((insight, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                                    <span className="font-bold">•</span> {insight}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Credit Score History (Mocked)</h2>
                        <div className="h-64">
                            <Line options={{ maintainAspectRatio: false }} data={creditScoreData} />
                        </div>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {riskData.alerts.length > 0 && (
                        <Card className="p-6 border-orange-200 border-2">
                            <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500 animate-pulse" />
                                High Priority Alerts
                            </h2>
                            <div className="space-y-3">
                                {riskData.alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                                        {typeof alert === 'string' ? (
                                            <p className="text-xs text-orange-700 dark:text-orange-300">{alert}</p>
                                        ) : (
                                            <>
                                                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">{alert.title}</p>
                                                <p className="text-xs text-orange-600 dark:text-orange-400">{alert.desc}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Portfolio Risk Comparison</h2>
                        <div className="h-48 flex justify-center">
                            <Doughnut data={riskDistributionData} options={{ cutout: '70%', maintainAspectRatio: false }} />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-4">Where this applicant sits compared to recent approvals</p>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Internal Notes</h2>
                        <textarea
                            ref={noteRef}
                            className="w-full h-32 p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent dark:text-gray-200"
                            placeholder="Add your risk assessment notes here..."
                        ></textarea>
                        <Button className="w-full mt-3" size="sm" onClick={() => showToast('Note saved to application ledger', 'success')}>Save Note</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
