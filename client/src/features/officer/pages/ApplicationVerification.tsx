import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface RiskSummary {
    overallRiskScore: number;
    riskCategory: string;
    approvalProbability: number;
    approvalCategory: string;
    dti: number;
    dtiCategory: string;
}

export const ApplicationVerification = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    
    const [app, setApp] = useState<any>(null);
    const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchAppAndRisk = async () => {
            try {
                const [appRes, riskRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/officer/applications/${id}`),
                    fetch(`http://localhost:5000/api/applications/${id}/risk`)
                ]);

                if (appRes.ok) {
                    setApp(await appRes.json());
                } else {
                    showToast('Application not found', 'error');
                }

                if (riskRes.ok) {
                    const riskPayload = await riskRes.json();
                    if (riskPayload.status === 'success') {
                        setRiskSummary(riskPayload.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching application:", err);
                showToast('Failed to load application', 'error');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchAppAndRisk();
        }
    }, [id, showToast]);

    const handleStatusUpdate = async (status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/officer/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast(`Application successfully updated to ${status}`, 'success');
                setApp(data.application); // Update local state to reflect new status
            } else {
                showToast(data.message || 'Failed to update application', 'error');
            }
        } catch (error) {
            console.error('Status update failed:', error);
            showToast('Network error while updating status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = (docName: string) => {
        const textContext = `This is a securely retrieved file from Loanify systems for: ${docName}\nApplicant: ${app.fullName}\n\n[FILE CONTENTS BLOCKED BY DEMO MODE]`;
        const blob = new Blob([textContext], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = docName.replace('.pdf', '') + '_secure.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Successfully downloaded: ${docName}`, 'success');
    };

    if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Loading application...</div>;
    if (!app) return <div className="p-8 text-center text-red-500">Failed to retrieve application.</div>;

    const statusColors: Record<string, string> = {
        'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Needs Info': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Pending': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };

    const riskColors: Record<string, string> = {
        'Low Risk': 'text-green-500',
        'Medium Risk': 'text-yellow-500',
        'High Risk': 'text-red-500'
    };

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                    <h1 className="text-xl font-medium text-gray-600 dark:text-gray-300">Review Loan Application</h1>
                    <p className="text-sm text-gray-500 mt-1">Application ID: <span className="text-gray-700 dark:text-gray-200 font-medium">#{app.id}</span></p>
                </div>
                <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || statusColors['Pending']}`}>
                        {app.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Applicant Information */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Applicant Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                <p className="text-sm font-medium">{app.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">NIC / Passport</p>
                                <p className="text-sm font-medium">{app.nic}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-medium">{app.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                <p className="text-sm font-medium">{app.contactNumber}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                <p className="text-sm font-medium">{app.address}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Employment Status</p>
                                <p className="text-sm font-medium">{app.employmentType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Employer</p>
                                <p className="text-sm font-medium">{app.employerName}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Financial Information */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Financial Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Gross Monthly Income</p>
                                <p className="text-sm font-medium">LKR {app.grossMonthlyIncome?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Net Monthly Income</p>
                                <p className="text-sm font-medium">LKR {app.netMonthlyIncome?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Existing Loan Commitments</p>
                                <p className="text-sm font-medium">LKR {app.existingLoanCommitments?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Service Period</p>
                                <p className="text-sm font-medium">{app.servicePeriod || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Requested Loan Details */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Requested Loan Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                                <p className="text-sm font-medium">{app.loanType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Requested Amount</p>
                                <p className="text-sm font-medium">LKR {app.loanAmount?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-sm font-medium">{app.tenure} months</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loan Purpose</p>
                                <p className="text-sm font-medium">{app.loanPurpose}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Uploaded Documents */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Uploaded Documents</h2>
                        <div className="space-y-3">
                            {['Bank Statement - Last 6 Months.pdf', 'Employment Letter.pdf', 'Identity Proof.pdf', 'Address Proof.pdf'].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                                    </div>
                                    <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(doc)}>
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Risk Assessment */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">Risk Assessment</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => navigate(`/officer/application/${id}/risk`)}
                            >
                                Detailed Analysis
                            </Button>
                        </div>

                        <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-md text-center mb-6">
                            <p className="text-sm text-gray-500 mb-1">Expected Risk Check</p>
                            {riskSummary ? (
                                <>
                                    <p className={`text-lg font-medium mb-1 font-bold ${riskColors[riskSummary.riskCategory] || 'text-gray-600'}`}>
                                        {riskSummary.riskCategory.replace(' Risk', '').toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Score {riskSummary.overallRiskScore}/100 · Approval {riskSummary.approvalProbability}%
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">Risk analysis unavailable</p>
                            )}
                        </div>
                    </Card>

                    {/* Decision */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">Decision</h2>
                            {app.status !== 'Pending' && (
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleStatusUpdate('Pending')}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline disabled:opacity-40 transition-colors"
                                >
                                    Reset to Pending
                                </button>
                            )}
                        </div>
                        {app.status !== 'Pending' && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 mb-4">
                                ⚠ A decision has been recorded. Other options are locked.
                            </p>
                        )}
                        <div className="space-y-3">
                            {/* Approve */}
                            {(() => {
                                const isActive = app.status === 'Approved';
                                const isLocked = app.status !== 'Pending' && !isActive;
                                return (
                                    <button
                                        disabled={actionLoading || isActive || isLocked}
                                        onClick={() => handleStatusUpdate('Approved')}
                                        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-md transition-all text-sm font-medium border-2 ${
                                            isActive
                                                ? 'bg-green-600 border-green-600 text-white ring-2 ring-green-400 ring-offset-2 cursor-default'
                                                : isLocked
                                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Approve Application
                                        </span>
                                        {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                                        {isLocked && <span className="text-xs">🔒</span>}
                                    </button>
                                );
                            })()}

                            {/* Reject */}
                            {(() => {
                                const isActive = app.status === 'Rejected';
                                const isLocked = app.status !== 'Pending' && !isActive;
                                return (
                                    <button
                                        disabled={actionLoading || isActive || isLocked}
                                        onClick={() => handleStatusUpdate('Rejected')}
                                        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-md transition-all text-sm font-medium border-2 ${
                                            isActive
                                                ? 'bg-red-600 border-red-600 text-white ring-2 ring-red-400 ring-offset-2 cursor-default'
                                                : isLocked
                                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Reject Application
                                        </span>
                                        {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                                        {isLocked && <span className="text-xs">🔒</span>}
                                    </button>
                                );
                            })()}

                            {/* Needs Info */}
                            {(() => {
                                const isActive = app.status === 'Needs Info';
                                const isLocked = app.status !== 'Pending' && !isActive;
                                return (
                                    <button
                                        disabled={actionLoading || isActive || isLocked}
                                        onClick={() => handleStatusUpdate('Needs Info')}
                                        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-md transition-all text-sm font-medium border-2 ${
                                            isActive
                                                ? 'bg-yellow-500 border-yellow-500 text-white ring-2 ring-yellow-400 ring-offset-2 cursor-default'
                                                : isLocked
                                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Request More Info
                                        </span>
                                        {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                                        {isLocked && <span className="text-xs">🔒</span>}
                                    </button>
                                );
                            })()}
                        </div>
                    </Card>


                    {/* Timeline */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Timeline</h2>
                        <div className="relative pl-4 border-l border-gray-200 dark:border-gray-700 space-y-6">
                            <div className="relative">
                                <div className="mb-1">
                                    <p className="text-xs text-gray-500">{new Date(app.createdAt || app.date).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Submitted</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="mb-1">
                                    <p className="text-xs text-gray-500 text-primary">Current Status</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{app.status}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};
