import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const AuthLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Branding & Visual */}
            <div className="hidden lg:flex flex-col bg-slate-900 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 animate-in fade-in duration-1000"></div>

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl group-hover:bg-white/20 transition-all duration-300">
                            <img src="/logo.jpg" alt="Loanify Logo" className="w-16 h-16 object-contain drop-shadow-md" />
                        </div>
                        <span className="text-4xl font-bold tracking-tight drop-shadow-md">Loanify</span>
                    </Link>

                    <div className="max-w-md space-y-6">
                        <h2 className="text-4xl font-bold leading-tight">
                            Manage your finances with confidence
                        </h2>
                        <p className="text-lg text-slate-200">
                            Join thousands of businesses and individuals who trust Loanify for secure, transparent, and efficient loan management.
                        </p>
                    </div>

                    <div className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Loanify Platform. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right: Content Area */}
            <div className="flex flex-col bg-light-bg dark:bg-dark-bg transition-colors duration-200">
                <div className="flex justify-end p-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full w-9 h-9 p-0"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5 text-slate-600" />
                        ) : (
                            <Sun className="w-5 h-5 text-yellow-400" />
                        )}
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};
