import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/utils/formatCurrency';

export const ApplicationsList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/officer/applications');
                if (res.ok) {
                    setApplications(await res.json());
                }
            } catch (err) {
                console.error("Error fetching applications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'success';
            case 'manager approved': return 'success';
            case 'rejected': return 'error';
            case 'manager rejected': return 'error';
            case 'manager review': return 'warning';
            case 'needs info': return 'warning';
            case 'pending': return 'info';
            default: return 'info';
        }
    };

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.toLowerCase();
        return (
            app.fullName?.toLowerCase().includes(search) ||
            app.id?.toLowerCase().includes(search) ||
            app.nic?.toLowerCase().includes(search)
        );
    });

    const exportToCSV = () => {
        if (filteredApplications.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        const headers = ['Application ID,Applicant,Type,Amount,Date,Status'];
        const csvData = headers.concat(filteredApplications.map(app => 
            `${app.id},"${app.fullName}",${app.loanType},${app.loanAmount},${new Date(app.date || app.createdAt).toLocaleDateString()},${app.status}`
        )).join('\n');
        
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'loan_applications.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Export triggered successfully', 'success');
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading applications...</div>;

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">
                    Loan Applications
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} onClick={() => showToast('Advanced filtering coming soon!', 'info')}>Filter</Button>
                    <Button onClick={exportToCSV}>Export</Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="mb-4">
                    <Input
                        placeholder="Search by name, ID or NIC..."
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
                                <th className="px-4 py-3">Risk Level</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {filteredApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-light-text-primary dark:text-dark-text-primary">{app.id}</td>
                                    <td className="px-4 py-3">{app.fullName}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">{app.loanType}</td>
                                    <td className="px-4 py-3 font-medium">LKR {formatNumber(app.loanAmount)}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(app.date || app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={app.loanAmount > 100000 ? 'error' : app.loanAmount > 50000 ? 'warning' : 'success'} size="sm">
                                            {app.loanAmount > 100000 ? 'HIGH' : app.loanAmount > 50000 ? 'MEDIUM' : 'LOW'}
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
                            {filteredApplications.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        No applications match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

