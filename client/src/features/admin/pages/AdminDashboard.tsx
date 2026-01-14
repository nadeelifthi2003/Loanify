import { Card } from '@/components/ui/Card';
import { Users, Server, Activity, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export const AdminDashboard = () => {
    const { theme } = useTheme();

    const stats = [
        { label: 'Total Users', value: '2,543', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'System Health', value: '98.9%', icon: Server, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Active Sessions', value: '432', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        { label: 'Security Threats', value: '0', icon: Shield, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
    ];

    const trafficData = [
        { name: 'Mon', users: 1200 },
        { name: 'Tue', users: 1900 },
        { name: 'Wed', users: 1500 },
        { name: 'Thu', users: 2100 },
        { name: 'Fri', users: 2400 },
        { name: 'Sat', users: 1800 },
        { name: 'Sun', users: 1600 },
    ];

    const roleData = [
        { name: 'Customers', value: 2100 },
        { name: 'Officers', value: 343 },
        { name: 'Admins', value: 100 },
    ];

    const COLORS = ['#0D47A1', '#00B9A7', '#F472B6'];
    const DARK_COLORS = ['#3ED6C4', '#F472B6', '#818CF8'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    System Overview
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Monitor system performance and user statistics.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{stat.label}</p>
                                <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{stat.value}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Traffic Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trafficData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="users" fill={theme === 'dark' ? '#3ED6C4' : '#0D47A1'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">User Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={theme === 'dark' ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="ml-4 space-y-2">
                            {roleData.map((role, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme === 'dark' ? DARK_COLORS[i] : COLORS[i] }} />
                                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{role.name} ({role.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
