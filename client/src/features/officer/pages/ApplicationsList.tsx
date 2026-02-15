import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ChevronRight } from 'lucide-react';

const applications = [
    { id: 'L-1001', name: 'Alice Smith', type: 'Personal', amount: 5000, date: '2023-10-25', status: 'pending', risk: 'low' },
    { id: 'L-1002', name: 'Bob Jones', type: 'Home', amount: 250000, date: '2023-10-24', status: 'review', risk: 'medium' },
    { id: 'L-1003', name: 'Charlie Brown', type: 'Auto', amount: 15000, date: '2023-10-23', status: 'approved', risk: 'low' },
    { id: 'L-1004', name: 'David Wilson', type: 'Personal', amount: 8000, date: '2023-10-22', status: 'rejected', risk: 'high' },
];

export const ApplicationsList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'review': return 'warning';
            default: return 'info';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Loan Applications
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
                    <Button>Export</Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="mb-4">
                    <Input
                        placeholder="Search by name or ID..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Application ID</th>
                                <th className="px-4 py-3">Applicant</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Rate</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-light-text-primary dark:text-dark-text-primary">{app.id}</td>
                                    <td className="px-4 py-3 text-light-text-primary dark:text-dark-text-primary">{app.name}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">{app.type}</td>
                                    <td className="px-4 py-3 font-medium text-light-text-primary dark:text-dark-text-primary">${app.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">{app.date}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={app.risk === 'high' ? 'error' : app.risk === 'medium' ? 'warning' : 'success'} size="sm">
                                            {app.risk.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getStatusBadge(app.status)} size="sm" className="capitalize">
                                            {app.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            rightIcon={<ChevronRight className="w-4 h-4" />}
                                            onClick={() => navigate(`/officer/application/${app.id}`)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
