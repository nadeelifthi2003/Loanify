import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft } from 'lucide-react';

export const ApplicationVerification = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            {/* Header */}
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
                <p className="text-sm text-gray-500 mt-1">Application ID: <span className="text-gray-700 dark:text-gray-200 font-medium">#PL-2025-00234</span></p>
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
                                <p className="text-sm font-medium">Sarah Johnson</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">NIC / Passport</p>
                                <p className="text-sm font-medium">987654321V</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-medium">sarah.johnson@email.com</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                <p className="text-sm font-medium">+1 234 567 8901</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                <p className="text-sm font-medium">456 Oak Avenue, Los Angeles, CA 90001</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Employment Status</p>
                                <p className="text-sm font-medium">Full-time Employed</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Employer</p>
                                <p className="text-sm font-medium">Tech Corp Inc.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Financial Information */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Financial Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
                                <p className="text-sm font-medium">$5,500</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Existing Loans</p>
                                <p className="text-sm font-medium">1 (Auto Loan)</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Current EMI</p>
                                <p className="text-sm font-medium">$450/month</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Credit Score</p>
                                <p className="text-sm font-medium">720</p>
                            </div>
                        </div>
                    </Card>

                    {/* Requested Loan Details */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Requested Loan Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                                <p className="text-sm font-medium">Personal Loan</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Requested Amount</p>
                                <p className="text-sm font-medium">$15,000</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-sm font-medium">36 months</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                                <p className="text-sm font-medium">8.5%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Calculated EMI</p>
                                <p className="text-sm font-medium">$475/month</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Payable</p>
                                <p className="text-sm font-medium">$17,100</p>
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
                                    <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
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
                                View Detailed Analysis
                            </Button>
                        </div>

                        <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-md text-center mb-6">
                            <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">LOW</p>
                            <p className="text-sm text-gray-500">15%</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-3">Key Factors:</p>
                            <div className="space-y-3">
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-surface">
                                    Good Credit Score
                                </div>
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-surface">
                                    Stable Employment
                                </div>
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-surface">
                                    Low Debt-to-Income
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Decision */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Decision</h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Approve Application
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Reject Application
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-4 rounded-md transition-colors text-sm font-medium">
                                Request More Info
                            </button>
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">Timeline</h2>
                        <div className="relative pl-4 border-l border-gray-200 dark:border-gray-700 space-y-6">
                            <div className="relative">
                                {/* Dot for current item could be filled, but design implies a clean look */}
                                <div className="mb-1">
                                    <p className="text-xs text-gray-500">Nov 22, 2025</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Submitted</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="mb-1">
                                    <p className="text-xs text-gray-500">Nov 22, 2025</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Documents Verified</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="mb-1">
                                    <p className="text-xs text-gray-500">Nov 23, 2025</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Under Review</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};
