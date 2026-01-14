import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export const EMICalculator = () => {
    const { theme } = useTheme();
    const [amount, setAmount] = useState<number>(10000);
    const [rate, setRate] = useState<number>(8.5);
    const [tenure, setTenure] = useState<number>(24);

    const [bmi, setBmi] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalPayment, setTotalPayment] = useState<number>(0);

    useEffect(() => {
        const r = rate / 12 / 100;
        const t = tenure;
        const emi = (amount * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);

        const totalPay = emi * t;
        const totInt = totalPay - amount;

        setBmi(Math.round(emi));
        setTotalPayment(Math.round(totalPay));
        setTotalInterest(Math.round(totInt));
    }, [amount, rate, tenure]);

    const data = [
        { name: 'Principal Amount', value: amount },
        { name: 'Total Interest', value: totalInterest },
    ];

    const COLORS = ['#0D47A1', '#00B9A7'];
    const DARK_COLORS = ['#3ED6C4', '#F472B6'];

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    EMI Calculator
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Plan your loan repayment with our interactive calculator.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 space-y-6">
                    <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">
                        Loan Details
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Loan Amount: ${amount.toLocaleString()}
                            </label>
                            <input
                                type="range"
                                min="1000" max="100000" step="500"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="mt-2">
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    leftIcon={<span className="text-slate-500">$</span>}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Interest Rate: {rate}%
                            </label>
                            <input
                                type="range"
                                min="1" max="20" step="0.1"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Tenure: {tenure} Months
                            </label>
                            <input
                                type="range"
                                min="6" max="60" step="6"
                                value={tenure}
                                onChange={(e) => setTenure(Number(e.target.value))}
                                className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center items-center">
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
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Monthly EMI</p>
                            <p className="font-bold text-primary text-lg">${bmi.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Interest</p>
                            <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">${totalInterest.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Amount</p>
                            <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">${totalPayment.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
