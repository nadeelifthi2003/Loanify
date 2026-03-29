import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export const ApplicationVerification = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/officer/applications/${id}`);
                if (res.ok) {
                    setApp(await res.json());
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
                                <p className="text-sm font-medium">${app.grossMonthlyIncome?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Net Monthly Income</p>
                                <p className="text-sm font-medium">${app.netMonthlyIncome?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Existing Loan Commitments</p>
                                <p className="text-sm font-medium">${app.existingLoanCommitments?.toLocaleString() || 0}</p>
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
                                <p className="text-sm font-medium">${app.loanAmount?.toLocaleString()}</p>
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
                            <p className="text-lg font-medium mb-1 font-bold">
                                {app.loanAmount > 100000 ? <span className="text-red-500">HIGH</span> : app.loanAmount > 50000 ? <span className="text-yellow-500">MEDIUM</span> : <span className="text-green-500">LOW</span>}
                            </p>
                        </div>
                    </Card>

                    {/* Decision */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Decision</h2>
                        <div className="space-y-3">
                            <button 
                                disabled={actionLoading || app.status === 'Approved'}
                                onClick={() => handleStatusUpdate('Approved')}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Approve Application
                            </button>
                            <button 
                                disabled={actionLoading || app.status === 'Rejected'}
                                onClick={() => handleStatusUpdate('Rejected')}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Reject Application
                            </button>
                            <button 
                                disabled={actionLoading || app.status === 'Needs Info'}
                                onClick={() => handleStatusUpdate('Needs Info')}
                                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                <Info className="w-4 h-4" />
                                Request More Info
                            </button>
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
