import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { FileText, Clock, ChevronRight, ArrowLeft } from 'lucide-react';

const loans = [
    {
        id: 'L-8321',
        type: 'Personal Loan',
        amount: 15000,
        balance: 12450,
        paid: 2550,
        nextPayment: 850,
        dueDate: 'Sep 25, 2024',
        status: 'active',
        progress: 17
    },
    {
        id: 'L-9942',
        type: 'Car Loan',
        amount: 35000,
        balance: 0,
        paid: 35000,
        nextPayment: 0,
        dueDate: '-',
        status: 'closed',
        progress: 100
    }
];

export const MyLoans = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <Button
                    variant="ghost"
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        My Loans
                    </h1>
                    <Button variant="outline">Download Statement</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loans.map((loan) => (
                    <Card key={loan.id} className="p-6 transition-all hover:shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${loan.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                                        {loan.type}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        <span>ID: {loan.id}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Badge variant={loan.status === 'active' ? 'success' : 'default'} size="sm" className="capitalize">
                                                {loan.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left md:text-right">
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Original Amount</p>
                                <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                    ${loan.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Repayment Progress</span>
                                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{loan.progress}%</span>
                                </div>
                                {/* Simple Progress Bar Implementation inline until component is made */}
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${loan.status === 'closed' ? 'bg-green-500' : 'bg-primary'}`}
                                        style={{ width: `${loan.progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-light-text-muted dark:text-dark-text-muted">
                                    <span>${loan.paid.toLocaleString()} paid</span>
                                    <span>${loan.balance.toLocaleString()} remaining</span>
                                </div>
                            </div>

                            {loan.status === 'active' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-light-border dark:border-dark-border">
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Next Payment</p>
                                        <p className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                                            ${loan.nextPayment}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Due Date</p>
                                        <div className="flex items-center gap-1.5 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            {loan.dueDate}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button size="sm" className="w-full md:w-auto">Pay Now</Button>
                                    </div>
                                </div>
                            )}

                            {loan.status === 'closed' && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        This loan has been fully repaid on Dec 15, 2023.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex justify-end">
                            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                View Details
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
