import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Search, Filter, Download, Users, UserPlus, Phone, Mail,
    Loader2, X, Eye, FileText, ChevronRight, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/utils/formatCurrency';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    activeLoans: number;
    totalDebt: number;
    status: string;
    nic: string;
    applications?: any[];
}

export const CustomersList = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerApps, setCustomerApps] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/officer/customers');
                if (res.ok) setCustomers(await res.json());
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const openCustomerPanel = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setLoadingApps(true);
        try {
            const res = await fetch(`http://localhost:5000/api/officer/customers/${customer.nic}/applications`);
            if (res.ok) {
                setCustomerApps(await res.json());
            } else {
                setCustomerApps([]);
            }
        } catch {
            setCustomerApps([]);
        } finally {
            setLoadingApps(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'info';
            case 'blocked': return 'error';
            default: return 'info';
        }
    };

    const getAppStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'needs info': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const exportToCSV = () => {
        if (filteredCustomers.length === 0) { showToast('No data to export', 'warning'); return; }
        const headers = ['Customer ID,Name,Email,Phone,Joined Date,Active Loans,Total Debt,Status'];
        const csvData = headers.concat(
            filteredCustomers.map(c =>
                `${c.id},"${c.name}",${c.email},${c.phone},${new Date(c.joinDate).toLocaleDateString()},${c.activeLoans},${c.totalDebt},${c.status}`
            )
        ).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customers_list.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Customers exported successfully', 'success');
    };

    if (loading) return (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin w-5 h-5" /> Fetching customers data...
        </div>
    );

    const totalCustomers = customers.length;
    const activeBorrowers = customers.filter(c => c.activeLoans > 0).length;
    const totalPortfolioDebt = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Customer Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage bank aggregated customers</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={exportToCSV}>Export</Button>
                    <Button
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        onClick={() => showToast('Customers are auto-created when they submit a loan application', 'info')}
                    >
                        How Customers Are Added
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Unique Profiles</p>
                        <p className="text-2xl font-bold">{totalCustomers}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Active Borrowers</p>
                        <p className="text-2xl font-bold">{activeBorrowers}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Portfolio Debt</p>
                        <p className="text-2xl font-bold">LKR {formatNumber(totalPortfolioDebt)}</p>
                    </div>
                </Card>
            </div>

            <Card className="p-4">
                {/* Toolbox */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search customers by name, email or ID..."
                            leftIcon={<Search className="w-4 h-4" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-sm focus:ring-primary focus:border-primary dark:text-gray-200"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                        </select>
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} onClick={() => showToast('More filters coming soon', 'info')}>More Filters</Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Customer</th>
                                <th className="px-4 py-3">Contact Info</th>
                                <th className="px-4 py-3">Joined Date</th>
                                <th className="px-4 py-3 text-center">Active Loans</th>
                                <th className="px-4 py-3">Total Debt</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                                {customer.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                                <p className="text-xs text-gray-400">{customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="w-3 h-3" />{customer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="w-3 h-3" />{customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {new Date(customer.joinDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-center">{customer.activeLoans}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                        LKR {formatNumber(customer.totalDebt) || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getStatusBadge(customer.status)} size="sm" className="capitalize">
                                            {customer.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            rightIcon={<ChevronRight className="w-4 h-4" />}
                                            onClick={() => openCustomerPanel(customer)}
                                        >
                                            View Profile
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No linked customer profiles match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Customer Detail Slide-Over Panel */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedCustomer(null)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">

                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {selectedCustomer.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
                                    <p className="text-xs text-gray-500">{selectedCustomer.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">

                            {/* Contact Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    {selectedCustomer.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    {selectedCustomer.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    Joined {new Date(selectedCustomer.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Financial Snapshot */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                                    <p className="text-xs text-blue-500 mb-1">Active Loans</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{selectedCustomer.activeLoans}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                                    <p className="text-xs text-purple-500 mb-1">Total Debt</p>
                                    <p className="text-xl font-bold text-purple-700 dark:text-purple-300">LKR {formatNumber(selectedCustomer.totalDebt) || 0}</p>
                                </div>
                            </div>

                            {/* Loan Applications */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Loan Applications</h3>
                                {loadingApps ? (
                                    <div className="flex justify-center items-center py-6 gap-2 text-gray-500">
                                        <Loader2 className="animate-spin w-4 h-4" /> Loading applications...
                                    </div>
                                ) : customerApps.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm">No loan applications found.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {customerApps.map((app: any) => (
                                            <div
                                                key={app.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-sm text-gray-800 dark:text-gray-200">#{app.id}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getAppStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <p><span className="font-medium">Amount:</span> LKR {formatNumber(app.loanAmount)}</p>
                                                    <p><span className="font-medium">Purpose:</span> {app.loanPurpose}</p>
                                                    <p><span className="font-medium">Date:</span> {new Date(app.date || app.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full mt-3 text-xs"
                                                    rightIcon={<Eye className="w-3 h-3" />}
                                                    onClick={() => {
                                                        setSelectedCustomer(null);
                                                        navigate(`/officer/application/${app.id}`);
                                                    }}
                                                >
                                                    Open Application
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Panel Footer */}
                        <div className="p-4 border-t dark:border-gray-700">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => setSelectedCustomer(null)}
                            >
                                Close Panel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
