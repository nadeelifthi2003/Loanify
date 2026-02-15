import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';

export const EMICalculator = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Input States
    const [amount, setAmount] = useState<string>('10000');
    const [rate, setRate] = useState<string>('8.5');
    const [tenure, setTenure] = useState<string>('24');
    const [currency, setCurrency] = useState<string>('LKR');

    // Result States
    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalPayment, setTotalPayment] = useState<number>(0);
    const [isCalculated, setIsCalculated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCalculate = async () => {
        const p = parseFloat(amount);
        const r = parseFloat(rate); // Rate is needed for validation
        const n = parseFloat(tenure);

        if (!amount || isNaN(p) || p <= 0) {
            showToast("Please enter a valid loan amount.", "error");
            return;
        }
        if (!tenure || isNaN(n) || n <= 0) {
            showToast("Please enter a valid loan term in months.", "error");
            return;
        }
        if (!rate || isNaN(r) || r <= 0) {
            showToast("Please enter a valid interest rate.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/calculate-emi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: p, rate: r, tenure: n })
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMonthlyPayment(data.emi);
                setTotalPayment(data.totalPayment);
                setTotalInterest(data.totalInterest);
                setIsCalculated(true);
                showToast("Calculation successful!", "success");
            } else {
                showToast(data.message || "Calculation failed.", "error");
            }
        } catch (error) {
            console.error('Calculation error:', error);
            showToast("Failed to connect to server.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setAmount('');
        setRate('');
        setTenure('');
        setCurrency('LKR');
        setMonthlyPayment(0);
        setTotalPayment(0);
        setTotalInterest(0);
        setIsCalculated(false);
    };

    // Data for Pie Chart
    const data = [
        { name: 'Principal Amount', value: parseFloat(amount) || 0 },
        { name: 'Total Interest', value: totalInterest },
    ];

    const COLORS = ['#0D47A1', '#00B9A7'];
    const DARK_COLORS = ['#3ED6C4', '#F472B6'];

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    EMI Calculator
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Plan your loan repayment with our interactive calculator.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <Card className="p-8 shadow-lg border-t-4 border-t-primary h-fit">
                    <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary mb-6">
                        Loan Details
                    </h3>

                    <div className="space-y-6">
                        {/* Loan Amount */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Loan Amount ({currency})
                            </label>
                            <div className="flex rounded-md shadow-sm">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary sm:text-sm"
                                />
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 sm:text-sm focus:ring-primary focus:border-primary"
                                >
                                    <option value="LKR">LKR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Loan Term */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Loan Term
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        value={tenure}
                                        onChange={(e) => setTenure(e.target.value)}
                                        placeholder="Months"
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 sm:text-sm">
                                        Months
                                    </span>
                                </div>
                            </div>

                            {/* Interest Rate */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Interest Rate
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                        placeholder="Rate"
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 sm:text-sm">
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleCalculate}
                                isLoading={isLoading}
                            >
                                Calculate
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Chart & Results */}
                <Card className="p-6 flex flex-col justify-center items-center relative min-h-[400px]">
                    {!isCalculated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 rounded-lg">
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                                Enter details and click Calculate
                            </p>
                        </div>
                    )}

                    <div className="w-full h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={theme === 'dark' ? DARK_COLORS[index % COLORS.length] : COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | string | Array<number | string> | undefined) => `${currency} ${(value as number)?.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Monthly EMI</p>
                            <p className="font-bold text-primary text-lg">
                                {currency} {monthlyPayment.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Interest</p>
                            <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">
                                {currency} {totalInterest.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Amount</p>
                            <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">
                                {currency} {totalPayment.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
