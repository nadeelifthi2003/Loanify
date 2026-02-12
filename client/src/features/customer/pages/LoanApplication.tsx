import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronRight, Check, AlertCircle, ArrowLeft } from 'lucide-react';

const steps = ['Personal Info', 'Loan Details', 'Documents', 'Review'];

export const LoanApplication = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const nextStep = () => setCurrentStep((p: number) => Math.min(p + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((p: number) => Math.max(p - 1, 0));

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Apply for a Loan
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Complete the following steps to submit your loan application.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full -z-10" />
                <div className="flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 bg-light-bg dark:bg-dark-bg px-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-primary border-primary text-white'
                                        : isCurrent
                                            ? 'bg-white dark:bg-dark-surface border-primary text-primary'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card className="p-8">
                {currentStep === 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="Jane" />
                            <Input label="Last Name" placeholder="Doe" />
                            <Input label="Date of Birth" type="date" />
                            <Input label="SSN / ID Number" placeholder="XXX-XX-XXXX" />
                            <Input label="Employment Status" placeholder="Employed" containerClassName="md:col-span-2" />
                            <Input label="Annual Income" placeholder="$60,000" containerClassName="md:col-span-2" />
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Loan Details</h3>
                        <Input label="Loan Amount" placeholder="$10,000" type="number" />
                        <Input label="Purpose" placeholder="Home Renovation, Business, etc." />
                        <Input label="Term (Months)" type="number" placeholder="24" />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Document Upload</h3>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                <Check className="w-6 h-6" /> {/* Placeholder icon */}
                            </div>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Click to upload ID Proof
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                PDF, JPG or PNG (Max 5MB)
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Review Application</h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>Please review all information carefully before submitting. Once submitted, you cannot change the details.</p>
                        </div>
                        <div className="space-y-2 mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            <p><strong>Name:</strong> Jane Doe</p>
                            <p><strong>Loan Amount:</strong> $10,000</p>
                            <p><strong>Term:</strong> 24 Months</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-light-border dark:border-dark-border">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                        Back
                    </Button>
                    <Button onClick={nextStep} rightIcon={currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}>
                        {currentStep === steps.length - 1 ? 'Submit Application' : 'Next Step'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
