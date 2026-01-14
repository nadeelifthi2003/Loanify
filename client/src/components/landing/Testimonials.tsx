import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Small Business Owner',
        content: "Loanify made getting a business loan incredibly simple. The process was transparent, and I got approved in record time.",
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        rating: 5
    },
    {
        name: 'Michael Chen',
        role: 'Loan Officer at MetroBank',
        content: "As a loan officer, this platform saves me hours every day. The automated risk assessment is a game-changer for our team.",
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        rating: 5
    },
    {
        name: 'Emily Davis',
        role: 'Freelancer',
        content: "I love the dashboard! It's so easy to track my payments and see exactly how much I owe. The interface is beautiful.",
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        rating: 4
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-light-surface dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Trusted by thousands
                    </h2>
                    <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                        Don't just take our word for it. Here's what our users have to say about Loanify.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="h-full border-none shadow-md dark:bg-dark-surface">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-10 h-10 rounded-full bg-slate-100"
                                />
                                <div>
                                    <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
