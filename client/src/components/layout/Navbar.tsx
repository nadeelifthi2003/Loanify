import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, Bell, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    toggleSidebar?: () => void;
    showSidebarToggle?: boolean;
}

export const Navbar = ({ toggleSidebar, showSidebarToggle = false }: NavbarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

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

                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-9 h-9 p-0 relative"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface"></span>
                </Button>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <button className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary leading-none">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5 capitalize">
                            {user?.role || 'Guest'}
                        </p>
                    </div>
                </button>
            </div>
        </nav>
    );
};
