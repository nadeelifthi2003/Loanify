import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, ArrowRight, UserCircle, Briefcase, ShieldCheck } from 'lucide-react';

type Role = 'customer' | 'officer' | 'admin' | 'manager';

export const Login = () => {
    // const navigate = useNavigate(); // Removed as we use login from context which handles navigation but actually context handles it. 
    // Wait, context handles navigation.
    const { login, loginWithGoogle, isLoading } = useAuth();
    const [selectedRole, setSelectedRole] = useState<Role>('customer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setError('');
                await loginWithGoogle(tokenResponse.access_token, selectedRole);
            } catch (err: any) {
                setError(err.message || 'Google sign-in failed');
            }
        },
        onError: () => setError('Google sign-in failed'),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(selectedRole, email, password);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const roles = [
        { id: 'customer', label: 'Customer', icon: UserCircle },
        { id: 'officer', label: 'Loan Officer', icon: Briefcase },
        { id: 'manager', label: 'Manager', icon: Briefcase },
        { id: 'admin', label: 'Administrator', icon: ShieldCheck },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Welcome back
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Select your role and enter credentials
                </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isSelected
                                ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'currentColor'}`} />
                            {role.label}
                        </button>
                    );
                })}
            </div>

            <Card className="border-none shadow-none bg-transparent p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@company.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                required
                                autoComplete="current-password"
                                containerClassName="w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                            <span className="text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Remember me</span>
                        </label>
                        <Link
                            to="/auth/forgot-password"
                            className="font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}>
                        Sign In as {roles.find(r => r.id === selectedRole)?.label}
                    </Button>

                    <Button type="button" variant="outline" className="w-full" onClick={() => googleLogin()} leftIcon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    }>
                        Sign in with Google
                    </Button>
                </form>
            </Card>

            <div className="text-center text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    Don't have an account?{' '}
                </span>
                <Link
                    to="/auth/register"
                    className="font-medium text-primary hover:text-primary-dark transition-colors"
                >
                    Create an account
                </Link>
            </div>
        </div>
    );
};
