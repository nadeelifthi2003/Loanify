import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Moon, Sun, Bell, Menu, User, CheckCircle, Info, AlertTriangle, XCircle, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatRelativeTime(value: string | Date) {
    if (!value) return 'just now';
    const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hr ago`;
    return `${Math.round(minutes / 1440)} day ago`;
}

interface NavbarProps {
    toggleSidebar?: () => void;
    showSidebarToggle?: boolean;
}

export const Navbar = ({ toggleSidebar, showSidebarToggle = false }: NavbarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const res = await fetch(`http://localhost:5000/api/notifications?role=${user.role}&email=${user.email || ''}`);
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };
        fetchNotifications();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="h-16 px-4 md:px-6 flex items-center justify-between bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-30 transition-colors duration-200">
            <div className="flex items-center gap-3">
                {showSidebarToggle && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 md:hidden text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.jpg" alt="Loanify Logo" className="w-10 h-10 rounded-lg object-contain transition-transform group-hover:scale-105" />
                    <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
                        Loanify
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-9 h-9 p-0"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <Moon className="w-5 h-5 text-slate-600" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    )}
                </Button>

                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full w-9 h-9 p-0 relative"
                        aria-label="Notifications"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface"></span>
                        )}
                    </Button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                                <Badge variant="info" size="sm">{notifications.length} New</Badge>
                            </div>
                            <div className="max-h-80 overflow-y-auto w-full">
                                {notifications.length > 0 ? notifications.map((notif) => (
                                    <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full cursor-default flex gap-3">
                                        <div className="mt-0.5 shrink-0">
                                            {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            {notif.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                            {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1 w-full flex flex-col">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{notif.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words leading-relaxed whitespace-pre-wrap">{notif.description}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">{formatRelativeTime(notif.time)}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                            <Bell className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
                                    </div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                                    <button className="text-xs text-primary hover:underline font-medium p-1 w-full" onClick={() => {setNotifications([]); setIsDropdownOpen(false);}}>Clear all</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 pr-2 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-blue-800">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="hidden md:flex flex-col items-start text-left">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize font-medium">
                                {user?.role || 'Guest'}
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                            </div>
                            
                            <div className="p-2">
                                <Link 
                                    to={`/${user?.role === 'admin' ? 'admin' : user?.role === 'officer' || user?.role === 'manager' ? 'officer' : 'customer'}/settings`}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    My Profile
                                </Link>
                                <Link 
                                    to={`/${user?.role === 'admin' ? 'admin' : user?.role === 'officer' || user?.role === 'manager' ? 'officer' : 'customer'}/settings`}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Account Settings
                                </Link>
                            </div>
                            
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800/50">
                                <button 
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
