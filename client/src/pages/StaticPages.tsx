import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-6 py-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors mb-10">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">{title}</h1>
            <div className="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary space-y-4 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

export const AboutPage = () => (
    <PageWrapper title="About Us">
        <p>Loanify is a modern loan management platform built to empower individuals and businesses in Sri Lanka with fast, secure, and transparent financial solutions.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Our Mission</h2>
        <p>We believe every person deserves fair access to financial services. Our platform leverages cutting-edge machine learning to provide unbiased, data-driven loan decisions in real time.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Our Team</h2>
        <p>Founded by a team of fintech engineers and financial experts based in Colombo, Sri Lanka, Loanify combines local banking knowledge with global technology standards to deliver a world-class experience.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Regulated & Trusted</h2>
        <p>All operations follow guidelines set by the Central Bank of Sri Lanka (CBSL). We are committed to compliance, data protection, and ethical lending practices.</p>
    </PageWrapper>
);

export const FeaturesPage = () => (
    <PageWrapper title="Features">
        <p>Loanify offers a comprehensive suite of tools designed for customers, loan officers, and administrators.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">For Customers</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li>Instant online loan applications with real-time eligibility checks</li>
            <li>AI-powered risk assessment for faster approvals</li>
            <li>Online payment portal with full payment history ledger</li>
            <li>Downloadable PDF account statements</li>
            <li>EMI calculator to plan your repayments</li>
            <li>Staggered due dates across multiple loans to ease financial burden</li>
        </ul>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">For Loan Officers</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li>Centralized application management dashboard</li>
            <li>ML-powered risk scoring with detailed breakdown reports</li>
            <li>One-click approval and rejection with notifications</li>
            <li>Downloadable PDF risk assessment reports</li>
            <li>Customer management and history view</li>
        </ul>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">For Administrators</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li>Full user management with role-based access control</li>
            <li>System-wide settings and configuration</li>
            <li>Audit logs and activity monitoring</li>
        </ul>
    </PageWrapper>
);

export const PricingPage = () => (
    <PageWrapper title="Pricing">
        <p>Loanify operates on a transparent, no-hidden-fees model. All loan rates are determined individually based on your credit profile, income, and risk assessment.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Loan Interest Rates</h2>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-4">
                <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="text-left px-4 py-3 font-semibold text-light-text-primary dark:text-dark-text-primary">Loan Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-light-text-primary dark:text-dark-text-primary">Rate (p.a.)</th>
                        <th className="text-left px-4 py-3 font-semibold text-light-text-primary dark:text-dark-text-primary">Max Tenure</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {[
                        ['Personal Loan', '9% – 18%', '60 months'],
                        ['Home Loan', '7% – 12%', '300 months'],
                        ['Car Loan', '8% – 15%', '84 months'],
                        ['Business Loan', '10% – 20%', '120 months'],
                        ['Education Loan', '6% – 10%', '84 months'],
                    ].map(([type, rate, tenure]) => (
                        <tr key={type} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">{type}</td>
                            <td className="px-4 py-3">{rate}</td>
                            <td className="px-4 py-3">{tenure}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <p className="text-xs mt-4 italic">* Rates are indicative and subject to approval. Final rates are determined at the time of loan disbursement.</p>
    </PageWrapper>
);

export const ContactPage = () => (
    <PageWrapper title="Contact Us">
        <p>Our support team is available Monday to Friday, 9:00 AM – 5:00 PM (Sri Lanka Standard Time).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {[
                { label: 'General Inquiries', value: 'info@loanify.lk' },
                { label: 'Customer Support', value: 'support@loanify.lk' },
                { label: 'Phone', value: '+94 11 234 5678' },
                { label: 'Head Office', value: '42 Galle Road, Colombo 03, Sri Lanka' },
            ].map(({ label, value }) => (
                <div key={label} className="p-5 rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{label}</p>
                    <p className="text-light-text-primary dark:text-dark-text-primary font-medium">{value}</p>
                </div>
            ))}
        </div>
    </PageWrapper>
);

export const PrivacyPage = () => (
    <PageWrapper title="Privacy Policy">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Loanify ("we", "our", "us") is committed to protecting your privacy. This policy explains what information we collect and how we use it.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Information We Collect</h2>
        <p>We collect personal information you provide during registration and loan application, including name, NIC, contact details, employment information, and financial data. We also collect usage data to improve our platform.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">How We Use Your Information</h2>
        <p>Your information is used exclusively for loan assessment, account management, and regulatory compliance as required by the Central Bank of Sri Lanka. We do not sell your data to third parties.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Data Security</h2>
        <p>All data is encrypted in transit and at rest. We follow industry best practices and comply with applicable Sri Lankan data protection regulations.</p>
    </PageWrapper>
);

export const TermsPage = () => (
    <PageWrapper title="Terms of Service">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>By accessing or using Loanify, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Eligibility</h2>
        <p>You must be at least 18 years of age and a resident of Sri Lanka to apply for a loan through Loanify. All applications are subject to credit assessment and approval.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">User Responsibilities</h2>
        <p>You agree to provide accurate and complete information in your application. Providing false information is grounds for immediate rejection and may result in legal action.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Limitation of Liability</h2>
        <p>Loanify provides loan facilitation services. Final lending decisions are made by licensed financial entities. Loanify is not liable for any loss resulting from rejected applications or market fluctuations in interest rates.</p>
    </PageWrapper>
);

export const CookiesPage = () => (
    <PageWrapper title="Cookie Policy">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Loanify uses cookies and similar tracking technologies to enhance your experience on our platform.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device by your browser. They help us remember your preferences, keep you logged in, and understand how you use our platform.</p>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the platform to function (e.g. authentication sessions).</li>
            <li><strong>Analytics Cookies:</strong> Help us understand usage patterns to improve the service.</li>
            <li><strong>Preference Cookies:</strong> Remember your settings such as dark mode.</li>
        </ul>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-8 mb-3">Managing Cookies</h2>
        <p>You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect your ability to log in or use certain features.</p>
    </PageWrapper>
);
