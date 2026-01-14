import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Hero = () => {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent rounded-l-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-gradient-to-tr from-teal/10 to-transparent rounded-tr-full blur-3xl opacity-50" />

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm animate-fade-up" style={{ animationDelay: '0ms' }}>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            New: AI-Powered Risk Assessment
                            <ChevronRight className="w-4 h-4" />
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-light-text-primary dark:text-dark-text-primary animate-fade-up" style={{ animationDelay: '100ms' }}>
                            Smart Loan Management <br />
                            <span className="bg-gradient-primary bg-clip-text text-transparent">Made Simple</span>
                        </h1>

                        <p className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
                            Experience the future of lending with Loanify. Streamlined applications, real-time tracking, and automated risk analysis for modern financial institutions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                            <Link to="/auth/register">
                                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Get Started
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-800">
                                View Demo
                            </Button>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 pt-4 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary animate-fade-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal" />
                                <span>Instant Approval</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal" />
                                <span>Secure & Encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual/Image */}
                    <div className="flex-1 relative w-full max-w-lg lg:max-w-none animate-fade-up" style={{ animationDelay: '300ms' }}>
                        <div className="relative z-10 animate-float">
                            <div className="relative bg-white/50 dark:bg-dark-surface/50 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/20 dark:border-white/10">
                                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
                                    {/* Central Logo */}
                                    <div className="relative z-10 p-8 bg-white dark:bg-dark-surface rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500">
                                        <img src="/logo.jpg" alt="Loanify Logo" className="w-32 h-32 object-contain drop-shadow-2xl" />
                                    </div>

                                    {/* Floating Badges */}
                                    <div className="absolute top-8 left-8 bg-white dark:bg-dark-surface p-3 rounded-xl shadow-lg border border-light-border dark:border-dark-border animate-float" style={{ animationDelay: '1s' }}>
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-12 right-12 bg-white dark:bg-dark-surface px-4 py-3 rounded-xl shadow-lg border border-light-border dark:border-dark-border animate-float" style={{ animationDelay: '2s' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-dark-surface" />
                                                ))}
                                            </div>
                                            <div className="text-sm font-semibold">
                                                <span className="text-primary">1k+</span> Users
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Blobs */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-brand opacity-20 blur-3xl rounded-full"></div>
                    </div>

                </div>
            </div>
        </section>
    );
};
