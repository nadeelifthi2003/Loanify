import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MoreVertical, Shield, UserPlus } from 'lucide-react';

const users = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'customer', status: 'active', lastActive: '2 mins ago' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'officer', status: 'active', lastActive: '1 hr ago' },
    { id: 3, name: 'Admin User', email: 'admin@loanify.com', role: 'admin', status: 'active', lastActive: 'Now' },
    { id: 4, name: 'Charlie Days', email: 'charlie@example.com', role: 'customer', status: 'inactive', lastActive: '5 days ago' },
];

export const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        User Management
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Manage system users and access roles.
                    </p>
                </div>
                <Button leftIcon={<UserPlus className="w-4 h-4" />}>Add User</Button>
            </div>

            <Card className="p-4">
                <div className="mb-4">
                    <Input
                        placeholder="Search users..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Active</th>
                                <th className="px-4 py-3 rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{user.name}</p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="w-3 h-3 text-slate-400" />
                                            <span className="capitalize text-light-text-primary dark:text-dark-text-primary">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={user.status === 'active' ? 'success' : 'default'} size="sm" className="capitalize">
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {user.lastActive}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
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
