import { Zap, ShieldCheck, PieChart, Users, Smartphone, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
    {
        icon: Zap,
        title: 'Quick Applications',
        description: 'Streamlined application process that takes minutes, not days. Get instant decisions powered by AI.',
        color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
        icon: Clock,
        title: 'Real-time Tracking',
        description: 'Monitor your loan status, payments, and balance updates in real-time with our live dashboard.',
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    },
    {
        icon: PieChart,
        title: 'Smart EMI Calculator',
        description: 'Visualize your repayment plan with interactive charts and find the tenure that fits your budget.',
        color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
    },
    {
        icon: ShieldCheck,
        title: 'Bank-Grade Security',
        description: 'Your data is protected with 256-bit encryption and enterprise-level security protocols.',
        color: 'text-green-500 bg-green-50 dark:bg-green-900/20'
    },
    {
        icon: Users,
        title: 'Multi-user Management',
        description: 'Dedicated roles for Borrowers, Loan Officers, and Admins with custom permission levels.',
        color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
    },
    {
        icon: Smartphone,
        title: 'Mobile First Design',
        description: 'Manage your finances on the go with our fully responsive interface optimized for all devices.',
        color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20'
    }
];

export const Features = () => {
    return (
        <section className="py-24 bg-light-surface dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Everything you need to manage loans
                    </h2>
                    <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                        Powerful features designed to simplify the lending experience for both institutions and borrowers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow duration-300 border-none shadow-sm dark:bg-dark-surface"
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
