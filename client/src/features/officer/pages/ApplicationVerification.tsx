import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, DollarSign, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';


export const ApplicationVerification = () => {
    // Mock status for now
    // const [status] = useState('pending');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            Application #L-1002
                        </h1>
                        <Badge variant="warning">Review Required</Badge>
                    </div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Submitted on Oct 24, 2023 by Bob Jones
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="danger" leftIcon={<XCircle className="w-4 h-4" />}>Reject</Button>
                    <Button variant="outline" leftIcon={<AlertTriangle className="w-4 h-4" />}>Flag Risk</Button>
                    <Button variant="primary" leftIcon={<CheckCircle className="w-4 h-4" />}>Approve</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Applicant Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Applicant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <User className="w-5 h-5 text-slate-500" />
                                <div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Full Name</p>
                                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Bob Jones</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-slate-500" />
                                <div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Annual Income</p>
                                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">$85,000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <FileText className="w-5 h-5 text-slate-500" />
                                <div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Employment</p>
                                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Software Engineer (3 Years)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Credit Score</p>
                                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">680 (Classic FICO)</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Loan Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Loan Request</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Amount</p>
                                <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">$250,000</p>
                            </div>
                            <div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Purpose</p>
                                <p className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">Home Purchase</p>
                            </div>
                            <div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Term</p>
                                <p className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary">360 Months</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Risk & Documents */}
                <div className="space-y-6">
                    <Card className="p-6 border-l-4 border-l-amber-500">
                        <h3 className="text-lg font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">Risk Assessment</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Debt-to-Income Ratio</span>
                                    <span className="font-medium text-amber-600">42%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[42%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Credit Utilization</span>
                                    <span className="font-medium text-green-600">25%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[25%]" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                DTI is slightly higher than recommended (40%). Review other debt obligations carefully.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Documents</h3>
                        <div className="space-y-3">
                            {['ID Proof.pdf', 'Income Statement.pdf', 'Bank Returns (3 months).pdf'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border border-light-border dark:border-dark-border rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{doc}</span>
                                    </div>
                                    <Button variant="ghost" size="sm">View</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
