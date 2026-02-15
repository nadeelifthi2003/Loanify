import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Download, MoreVertical, Users, UserPlus, Phone, Mail } from 'lucide-react';

const customers = [
    { id: 'C-1001', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1 234 567 8901', joinDate: '2024-01-15', activeLoans: 1, totalDebt: 15000, status: 'active' },
    { id: 'C-1002', name: 'Michael Chen', email: 'm.chen@example.com', phone: '+1 234 567 8902', joinDate: '2023-11-20', activeLoans: 2, totalDebt: 450000, status: 'active' },
    { id: 'C-1003', name: 'Emma Wilson', email: 'emma.w@example.com', phone: '+1 234 567 8903', joinDate: '2024-02-01', activeLoans: 0, totalDebt: 0, status: 'inactive' },
    { id: 'C-1004', name: 'James Rodri', email: 'j.rodri@example.com', phone: '+1 234 567 8904', joinDate: '2023-08-10', activeLoans: 1, totalDebt: 25000, status: 'active' },
    { id: 'C-1005', name: 'Lisa Pat', email: 'lisa.p@example.com', phone: '+1 234 567 8905', joinDate: '2024-03-05', activeLoans: 0, totalDebt: 0, status: 'blocked' },
];

export const CustomersList = () => {
    // const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.id.toLowerCase().includes(searchTerm.toLowerCase());
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

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage bank customers</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
                    <Button leftIcon={<UserPlus className="w-4 h-4" />}>Add Customer</Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">1,204</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">New This Month</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">+45</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Active Borrowers</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">892</p>
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
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>More Filters</Button>
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
                                <th className="px-4 py-3">Active Loans</th>
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
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                                <p className="text-xs text-gray-500">{customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="w-3 h-3" />
                                                {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {new Date(customer.joinDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-center">
                                        {customer.activeLoans}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                        ${customer.totalDebt.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getStatusBadge(customer.status)} size="sm" className="capitalize">
                                            {customer.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
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
