import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Clock, ChevronDown, ChevronUp, ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { formatNumber } from '@/utils/formatCurrency';

interface PaymentRecord {
    date: string;
    amount: number;
}

interface Loan {
    id: string;
    type: string;
    amount: number;
    balance: number;
    paid: number;
    nextPayment: number;
    dueDate: string;
    status: string;
    progress: number;
    paymentHistory: PaymentRecord[];
}

export const MyLoans = () => {
    const navigate = useNavigate();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
    
    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchLoans = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/applications/my-applications');
            const data = await res.json();
            
            const activeLoans: Loan[] = data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((app: any) => app.status === 'Approved' || app.status === 'Manager Approved')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((app: any) => {
                    const paid = app.paidAmount || 0;
                    const amount = app.loanAmount;
                    const balance = Math.max(0, amount - paid);
                    const progress = amount > 0 ? Math.round((paid / amount) * 100) : 0;
                    const nextPayment = Math.min(balance, Math.round(amount / app.tenure));
                    
                    return {
                        id: app.id,
                        type: app.loanType || app.loanPurpose || 'Personal Loan',
                        amount: amount,
                        balance: balance,
                        paid: paid,
                        nextPayment: nextPayment,
                        dueDate: app.nextDueDate ? new Date(app.nextDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Update Pending', 
                        status: balance <= 0 ? 'closed' : 'active',
                        progress: balance <= 0 ? 100 : progress,
                        paymentHistory: app.paymentHistory || []
                    };
                });
                
            setLoans(activeLoans);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handlePayNow = (loan: Loan) => {
        setSelectedLoan(loan);
        setPaymentAmount(loan.nextPayment.toString());
        setPaymentModalOpen(true);
    };

    const submitPayment = async () => {
        if (!selectedLoan || !paymentAmount) return;
        setIsProcessing(true);
        
        try {
            const res = await fetch(`http://localhost:5000/api/applications/${selectedLoan.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(paymentAmount) })
            });
            
            if (res.ok) {
                setPaymentModalOpen(false);
                setSelectedLoan(null);
                setPaymentAmount('');
                await fetchLoans();
            } else {
                alert('Payment processing failed');
            }
        } catch (error) {
            console.error('Payment error', error);
            alert('Payment processing failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleDetails = (loanId: string) => {
        if (expandedLoanId === loanId) {
            setExpandedLoanId(null);
        } else {
            setExpandedLoanId(loanId);
        }
    };

    const downloadStatement = () => {
        if (loans.length === 0) return;
        
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const now = new Date();
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 14;
        let y = 0;

        // Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageW, 26, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text('LOANIFY', margin, 11);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
        doc.text('Customer Payment Statement', margin, 18);
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        doc.text(`Date: ${dateStr}`, pageW - margin, 18, { align: 'right' });
        
        y = 35;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text('Loan Account Summary', margin, y);
        y += 8;

        loans.forEach((loan) => {
            // Check page break before printing a new loan
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            // Loan Header
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, y, pageW - margin*2, 8, 'F');
            doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(`${loan.type} (ID: ${loan.id}) - Status: ${loan.status.toUpperCase()}`, margin + 2, y + 5);
            y += 12;

            // Details
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(`Original Amount: LKR ${formatNumber(loan.amount)}`, margin, y);
            doc.text(`Total Paid: LKR ${formatNumber(loan.paid)}`, margin + 60, y);
            doc.text(`Remaining Balance: LKR ${formatNumber(loan.balance)}`, margin + 120, y);
            y += 8;

            // Payment Table
            doc.setFontSize(8); doc.setFont('helvetica', 'bold');
            doc.text('Payment History', margin, y);
            y += 5;

            if (loan.paymentHistory && loan.paymentHistory.length > 0) {
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, y, pageW - margin, y);
                y += 5;
                doc.setFontSize(7); doc.setFont('helvetica', 'bold');
                doc.text('Date', margin, y);
                doc.text('Amount Paid', margin + 40, y);
                doc.text('Status', margin + 80, y);
                y += 3;
                doc.line(margin, y, pageW - margin, y);
                y += 5;

                doc.setFont('helvetica', 'normal');
                loan.paymentHistory.forEach(pmt => {
                    const pDate = new Date(pmt.date).toLocaleDateString('en-US');
                    doc.text(pDate, margin, y);
                    doc.text(`LKR ${formatNumber(pmt.amount)}`, margin + 40, y);
                    doc.text('Completed', margin + 80, y);
                    y += 5;
                    // Check page break during rows
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                });
            } else {
                doc.setFont('helvetica', 'italic');
                doc.text('No transactions recorded yet.', margin, y);
                y += 5;
            }
            y += 10;
        });

        // Footer
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 285, pageW, 12, 'F');
        doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(148,163,184);
        doc.text('This is a computer generated statement and does not require a signature.', margin, 292);
        
        doc.save(`Loanify_Statement_${now.toISOString().slice(0, 10)}.pdf`);
    };

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        My Loans
                    </h1>
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={downloadStatement}>
                        Download Statement
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading your loans...</div>
            ) : loans.length === 0 ? (
                <Card className="p-8 text-center text-slate-500">
                    You do not have any active approved loans yet.
                </Card>
            ) : (
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
                                        LKR {formatNumber(loan.amount)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Repayment Progress</span>
                                        <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{loan.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${loan.status === 'closed' ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${loan.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-light-text-muted dark:text-dark-text-muted">
                                        <span>LKR {formatNumber(loan.paid)} paid</span>
                                        <span>LKR {formatNumber(loan.balance)} remaining</span>
                                    </div>
                                </div>

                                {loan.status === 'active' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-light-border dark:border-dark-border">
                                        <div>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Next Payment</p>
                                            <p className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                LKR {formatNumber(loan.nextPayment)}
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
                                            <Button size="sm" className="w-full md:w-auto" onClick={() => handlePayNow(loan)}>Pay Now</Button>
                                        </div>
                                    </div>
                                )}

                                {loan.status === 'closed' && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                            This loan has been fully repaid.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex justify-end">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    rightIcon={expandedLoanId === loan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    onClick={() => toggleDetails(loan.id)}
                                >
                                    {expandedLoanId === loan.id ? 'Hide Details' : 'View Details'}
                                </Button>
                            </div>

                            {/* Expanded Details Section - Payment History */}
                            {expandedLoanId === loan.id && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-fade-in border border-light-border dark:border-dark-border">
                                    <h4 className="text-sm font-semibold mb-3">Transaction History</h4>
                                    {loan.paymentHistory.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No payments recorded yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {loan.paymentHistory.map((pmt, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                                                    <div>
                                                        <p className="font-medium">Payment Received</p>
                                                        <p className="text-xs text-slate-500">{new Date(pmt.date).toLocaleDateString()} at {new Date(pmt.date).toLocaleTimeString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-green-600 dark:text-green-400">+ LKR {formatNumber(pmt.amount)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </Card>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900">
                        <h2 className="text-xl font-bold mb-4">Make a Payment</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Loan</p>
                                <p className="font-medium">{selectedLoan.type} ({selectedLoan.id})</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Remaining Balance</p>
                                <p className="font-medium">LKR {formatNumber(selectedLoan.balance)}</p>
                            </div>
                            <div>
                                <Input 
                                    label="Payment Amount (LKR)" 
                                    type="number" 
                                    value={paymentAmount} 
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    max={selectedLoan.balance}
                                />
                            </div>
                            
                            {/* Dummy Credit Card Info */}
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium mb-2">Payment Details (Mock)</p>
                                <Input label="Card Number" placeholder="**** **** **** 4242" defaultValue="4242 4242 4242 4242" />
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
                                <Button onClick={submitPayment} disabled={isProcessing || !paymentAmount || parseFloat(paymentAmount) <= 0}>
                                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
