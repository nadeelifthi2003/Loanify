import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import {
    LayoutDashboard,
    CreditCard,
    FileText,
    PieChart,
    Settings,
    Users,
    ClipboardList,
    ShieldAlert,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    role?: 'customer' | 'officer' | 'admin' | 'manager';
}

export const Sidebar = ({ isOpen, onClose, role = 'customer' }: SidebarProps) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const customerLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/customer' },
        { icon: CreditCard, label: 'My Loans', path: '/customer/loans' },
        { icon: FileText, label: 'Apply for Loan', path: '/customer/apply' },
        { icon: PieChart, label: 'EMI Calculator', path: '/customer/calculator' },
        { icon: Settings, label: 'Settings', path: '/customer/settings' },
    ];

    const officerLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/officer' },
        { icon: ClipboardList, label: 'Applications', path: '/officer/applications' },
        ...(user?.role === 'manager' ? [{ icon: ClipboardList, label: 'Manager Reviews', path: '/officer/manager-reviews' }] : []),
        { icon: ShieldAlert, label: 'Risk Assessment', path: '/officer/risk' },
        { icon: Users, label: 'Customers', path: '/officer/customers' },
        { icon: Settings, label: 'Settings', path: '/officer/settings' },
    ];

    const adminLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: PieChart, label: 'Analytics & Reports', path: '/admin/analytics' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: Settings, label: 'System Settings', path: '/admin/settings' },
    ];

    const getLinks = () => {
        switch (role) {
            case 'officer': return officerLinks;
            case 'admin': return adminLinks;
            default: return customerLinks;
        }
    };

    const links = getLinks();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border transform transition-transform duration-300 ease-in-out md:transform-none flex flex-col',
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                <div className="h-20 flex items-center px-6 border-b border-light-border dark:border-dark-border md:hidden gap-3">
                    <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded object-contain" />
                    <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Loanify
                    </span>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                )}
                            >
                                <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')} />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-light-border dark:border-dark-border">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};
