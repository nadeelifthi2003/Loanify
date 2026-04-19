import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/utils/formatCurrency';

export const ManagerApplications = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/officer/applications');
                if (res.ok) {
                    const data = await res.json();
                    // Manager only sees applications pending manager review
                    setApplications(data.filter((app: any) => app.status === 'Manager Review'));
                }
            } catch (err) {
                console.error("Error fetching applications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.toLowerCase();
        return (
            app.fullName?.toLowerCase().includes(search) ||
            app.id?.toLowerCase().includes(search) ||
            app.nic?.toLowerCase().includes(search)
        );
    });

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Manager Reviews...</div>;

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Manager Approvals
                    </h1>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">High-value loans awaiting your final approval</p>
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
                                    <td className="px-4 py-3 font-bold text-amber-600">LKR {formatNumber(app.loanAmount)}</td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(app.date || app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="warning" size="sm" className="capitalize">
                                            {app.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            rightIcon={<ChevronRight className="w-4 h-4" />}
                                            onClick={() => navigate(`/officer/manager-reviews/${app.id}`)}
                                        >
                                            Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredApplications.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No applications pending manager review.
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
