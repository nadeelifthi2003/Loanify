import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/utils/formatCurrency';
import { useAuth } from '@/contexts/AuthContext';


export const ManagerApplicationVerification = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { user } = useAuth();
    
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const appRes = await fetch(`http://localhost:5000/api/officer/applications/${id}`);
                if (appRes.ok) {
                    setApp(await appRes.json());
                } else {
                    showToast('Application not found', 'error');
                }
            } catch (err) {
                console.error("Error fetching application:", err);
                showToast('Failed to load application', 'error');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchApp();
        }
    }, [id, showToast]);

    const handleStatusUpdate = async (status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/officer/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, role: user?.role }) // Send role to bypass API manager check
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast(`Application successfully updated. Final status: ${data.application.status}`, 'success');
                setApp(data.application);
                setTimeout(() => navigate('/officer/manager-reviews'), 1500);
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

    const handleDownload = (doc: any) => {
        try {
            const dataParts = doc.data.split(',');
            const base64Data = dataParts.length > 1 ? dataParts[1] : dataParts[0];
            const binaryData = atob(base64Data);
            const arrayBuffer = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                arrayBuffer[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: doc.fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Successfully downloaded: ${doc.fileName}`, 'success');
        } catch (e) {
            showToast('Failed to download document', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Loading application...</div>;
    if (!app) return <div className="p-8 text-center text-red-500">Failed to retrieve application.</div>;

    const statusColors: Record<string, string> = {
        'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Manager Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Needs Info': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Manager Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'Pending': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
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
                    <h1 className="text-xl font-medium text-gray-600 dark:text-gray-300">Manager Final Review</h1>
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
                                <p className="text-sm font-medium">LKR {formatNumber(app.grossMonthlyIncome)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Net Monthly Income</p>
                                <p className="text-sm font-medium">LKR {formatNumber(app.netMonthlyIncome)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Existing Loan Commitments</p>
                                <p className="text-sm font-medium">LKR {formatNumber(app.existingLoanCommitments) || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Service Period</p>
                                <p className="text-sm font-medium">{app.servicePeriod || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Requested Loan Details */}
                    <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-900/10">
                        <h2 className="text-base font-medium text-amber-700 dark:text-amber-500 mb-6">Manager Overview Context</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">{app.loanType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Requested Amount</p>
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">LKR {formatNumber(app.loanAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">{app.tenure} months</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loan Purpose</p>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">{app.loanPurpose}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Uploaded Documents */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Verification Completed By Officer</h2>
                        <div className="space-y-3">
                            {app.documents && app.documents.length > 0 ? app.documents.map((doc: any) => (
                                <div key={doc._id} className="flex flex-col gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={doc.fileName}>{doc.fileName}</span>
                                            {doc.status === 'Invalid' ? (
                                                <span className="px-3 py-1 flex items-center gap-1 rounded bg-red-500 text-white text-xs font-bold shadow-sm ring-2 ring-red-500 ring-offset-1"><XCircle className="w-4 h-4" /> Invalid by System</span>
                                            ) : doc.status === 'Valid' ? (
                                                <span className="px-3 py-1 flex items-center gap-1 rounded bg-green-100 text-green-700 text-xs font-bold"><CheckCircle className="w-4 h-4"/> Valid by System</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">{doc.status}</span>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(doc)}>
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">No documents uploaded.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Decision */}
                    <Card className="p-6 border-2 border-purple-100 dark:border-purple-900/50">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Manager Final Decision</h2>
                        </div>
                        {app.status === 'Manager Approved' && (
                            <p className="text-xs text-green-600 bg-green-50 rounded px-2 py-1 mb-4">Application has been fully approved by Manager.</p>
                        )}
                        {app.status === 'Manager Rejected' && (
                            <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-4">Application has been rejected by Manager.</p>
                        )}
                        <div className="space-y-3 mt-4">
                            {/* Approve */}
                            {(() => {
                                const isActive = app.status === 'Manager Approved';
                                return (
                                    <button
                                        disabled={actionLoading || isActive}
                                        onClick={() => handleStatusUpdate('Manager Approved')}
                                        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-md transition-all text-sm font-medium border-2 ${
                                            isActive
                                                ? 'bg-green-600 border-green-600 text-white ring-2 ring-green-400 ring-offset-2 cursor-default'
                                                : 'bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Final Approve
                                        </span>
                                        {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                                    </button>
                                );
                            })()}

                            {/* Reject */}
                            {(() => {
                                const isActive = app.status === 'Manager Rejected';
                                return (
                                    <button
                                        disabled={actionLoading || isActive}
                                        onClick={() => handleStatusUpdate('Manager Rejected')}
                                        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-md transition-all text-sm font-medium border-2 ${
                                            isActive
                                                ? 'bg-red-600 border-red-600 text-white ring-2 ring-red-400 ring-offset-2 cursor-default'
                                                : 'bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Reject Application
                                        </span>
                                        {isActive && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
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
                                    <p className="text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase">{app.status}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};
