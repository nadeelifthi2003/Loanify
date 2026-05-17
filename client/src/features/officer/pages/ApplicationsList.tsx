import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, ChevronRight, Download } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/utils/formatCurrency';

// All possible statuses shown in the filter bar
const STATUS_FILTERS = [
    { label: 'All',              value: 'all' },
    { label: 'Pending',          value: 'Pending' },
    { label: 'Manager Review',   value: 'Manager Review' },
    { label: 'Risk Flagged',     value: 'Risk Flagged' },
    { label: 'Needs Info',       value: 'Needs Info' },
    { label: 'Approved',         value: 'Approved' },
    { label: 'Manager Approved', value: 'Manager Approved' },
    { label: 'Rejected',         value: 'Rejected' },
    { label: 'Manager Rejected', value: 'Manager Rejected' },
];

export const ApplicationsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Default filter = Route state or Pending
    const [statusFilter, setStatusFilter] = useState(() => location.state?.filter || 'Pending');

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/officer/applications');
                if (res.ok) {
                    setApplications(await res.json());
                }
            } catch (err) {
                console.error('Error fetching applications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'manager approved':  return 'success';
            case 'rejected':
            case 'manager rejected':  return 'error';
            case 'manager review':
            case 'needs info':        return 'warning';
            case 'pending':           return 'info';
            default:                  return 'info';
        }
    };

    // Count per status for badge counters
    const countByStatus = (val: string) =>
        applications.filter((a) => {
            if (val === 'all') return true;
            if (val === 'Risk Flagged') return a.status === 'Pending' && a.loanAmount > 1000000;
            return a.status?.toLowerCase() === val.toLowerCase();
        }).length;

    // Combined filter: status pill + search text
    const filtered = applications.filter((app) => {
        let matchesStatus = false;
        if (statusFilter === 'all') {
            matchesStatus = true;
        } else if (statusFilter === 'Risk Flagged') {
            matchesStatus = app.status === 'Pending' && app.loanAmount > 1000000;
        } else {
            matchesStatus = app.status?.toLowerCase() === statusFilter.toLowerCase();
        }

        const search = searchTerm.toLowerCase();
        const matchesSearch =
            !search ||
            app.fullName?.toLowerCase().includes(search) ||
            app.id?.toLowerCase().includes(search) ||
            app.nic?.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
    });

    const exportToCSV = () => {
        if (filtered.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        const headers = ['Application ID,Applicant,Type,Amount,Date,Status'];
        const rows = filtered.map(
            (app) =>
                `${app.id},"${app.fullName}",${app.loanType},${app.loanAmount},` +
                `${new Date(app.date || app.createdAt).toLocaleDateString()},${app.status}`
        );
        const csv = [...headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `applications_${statusFilter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Export downloaded successfully', 'success');
    };

    if (loading)
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading applications...</div>;

    return (
        <div className="space-y-5 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Loan Applications</h1>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                        {filtered.length} application{filtered.length !== 1 ? 's' : ''} matching current filter
                    </p>
                </div>
                <Button onClick={exportToCSV} leftIcon={<Download className="w-4 h-4" />}>
                    Export CSV
                </Button>
            </div>

            <Card className="p-5 space-y-4">
                {/* Search */}
                <Input
                    placeholder="Search by name, ID or NIC..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Status filter pills */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map(({ label, value }) => {
                        const count = countByStatus(value);
                        const isActive = statusFilter === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    isActive
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
                                }`}
                            >
                                {label}
                                <span
                                    className={`min-w-[18px] text-center px-1 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                                        isActive
                                            ? 'bg-white/25 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
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
                            {filtered.map((app) => (
                                <tr
                                    key={app.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-light-text-primary dark:text-dark-text-primary">
                                        {app.id}
                                    </td>
                                    <td className="px-4 py-3">{app.fullName}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {app.loanType}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        LKR {formatNumber(app.loanAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(app.date || app.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                app.loanAmount > 1000000
                                                    ? 'error'
                                                    : app.loanAmount > 500000
                                                    ? 'warning'
                                                    : 'success'
                                            }
                                            size="sm"
                                        >
                                            {app.loanAmount > 1000000
                                                ? 'HIGH'
                                                : app.loanAmount > 500000
                                                ? 'MEDIUM'
                                                : 'LOW'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={getStatusVariant(app.status)}
                                            size="sm"
                                            className="capitalize"
                                        >
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
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                                        <p className="font-medium">No applications found</p>
                                        <p className="text-xs mt-1">
                                            {statusFilter !== 'all'
                                                ? `There are no "${statusFilter}" applications right now.`
                                                : 'Try adjusting your search.'}
                                        </p>
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
