import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    if (isSent) {
        return (
            <div className="space-y-6 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Check your email
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-sm mx-auto">
                    We've sent password reset instructions to your email address.
                </p>
                <div className="pt-4">
                    <Link to="/auth/login">
                        <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Login
                        </Button>
                    </Link>
                </div>
                <p className="text-sm text-slate-500">
                    Didn't receive the email? <button className="text-primary hover:underline">Click to resend</button>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Reset password
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Enter your email and we'll send you instructions to reset your password
                </p>
            </div>

            <Card className="border-none shadow-none bg-transparent p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@company.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        required
                        autoComplete="email"
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}>
                        Send Instructions
                    </Button>

                    <Link to="/auth/login" className="block">
                        <Button type="button" variant="ghost" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Login
                        </Button>
                    </Link>
                </form>
            </Card>
        </div>
    );
};
