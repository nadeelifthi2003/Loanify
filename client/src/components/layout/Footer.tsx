import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const Footer = () => {
    return (
        <footer className="bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.jpg" alt="Loanify Logo" className="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-105" />
                            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                Loanify
                            </span>
                        </Link>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed">
                            Empowering your financial journey with smart loan management solutions. Fast, secure, and transparent.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/features" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
                            Legal
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/privacy" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookies" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
                            Stay Updated
                        </h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                            Subscribe to our newsletter for the latest financial tips and updates.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                placeholder="Enter your email"
                                className="bg-white dark:bg-dark-surface"
                            />
                            <Button className="w-full" rightIcon={<Send className="w-4 h-4" />}>
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-light-border dark:border-dark-border text-center text-sm text-light-text-muted dark:text-dark-text-muted">
                    <p>&copy; {new Date().getFullYear()} Loanify. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
