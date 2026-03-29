import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronRight, Check, AlertCircle, ArrowLeft, X, Upload, FileText } from 'lucide-react';

const steps = ['Personal Info', 'Loan Details', 'Documents', 'Review'];

import { useToast } from '@/components/ui/Toast';

export const LoanApplication = () => {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const [cribStatus, setCribStatus] = useState<'clean' | 'blacklisted' | 'error' | null>(null);
    const [cribLoading, setCribLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cribMessage, setCribMessage] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        nic: '',
        gramaNiladhari: '',
        employmentStatus: '',
        annualIncome: '',
        incomeCurrency: 'LKR',
        cribNumber: '',
        loanAmount: '',
        loanCurrency: 'LKR',
        loanPurpose: '',
        loanTerm: ''
    });
    const [documents, setDocuments] = useState<{
        proofOfIncome: File[];
        idProof: File[];
        proofOfAddress: File | null;
    }>({
        proofOfIncome: [],
        idProof: [],
        proofOfAddress: null
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const checkCribStatus = async () => {
        if (!formData.cribNumber) return;
        setCribLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/check-crib', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cribNumber: formData.cribNumber })
            });
            const data = await response.json();
            setCribStatus(data.status);
            setCribMessage(data.message);
        } catch (error) {
            console.error('Error checking CRIB status:', error);
            setCribMessage('Error connecting to CRIB service. Please try again.');
        } finally {
            setCribLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Reset CRIB status if CRIB number changes
        if (name === 'cribNumber') {
            setCribStatus(null);
            setCribMessage('');
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!formData.firstName) newErrors.firstName = 'First Name is required';
            if (!formData.lastName) newErrors.lastName = 'Last Name is required';
            if (!formData.dob) newErrors.dob = 'Date of Birth is required';
            if (!formData.nic) newErrors.nic = 'NIC is required';
            if (!formData.gramaNiladhari) newErrors.gramaNiladhari = 'Division is required';
            if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment Status is required';
            if (!formData.annualIncome) newErrors.annualIncome = 'Annual Income is required';
            if (cribStatus !== 'clean') {
                // The alert in nextStep handles the blocking, but we can also add visual error if needed.
                // For now, nextStep alert is sufficient for CRIB.
            }
        }

        if (step === 1) {
            if (!formData.loanAmount || Number(formData.loanAmount) <= 0) newErrors.loanAmount = 'Valid Loan Amount is required';
            if (!formData.loanPurpose) newErrors.loanPurpose = 'Purpose is required';
            if (!formData.loanTerm || Number(formData.loanTerm) <= 0) newErrors.loanTerm = 'Valid Term is required';
        }

        if (step === 2) {
            if (documents.proofOfIncome.length === 0) {
                newErrors.proofOfIncome = 'At least one Proof of Income document is required (pay slips / bank statements)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (currentStep === 0 && cribStatus !== 'clean') {
            showToast("Please complete the CRIB check to ensure a clean status before proceeding.", "warning");
            return;
        }

        if (validateStep(currentStep)) {
            setCurrentStep((p: number) => Math.min(p + 1, steps.length - 1));
        }
    };
    const prevStep = () => setCurrentStep((p: number) => Math.max(p - 1, 0));

    const submitApplication = async () => {
        setIsSubmitting(true);
        try {
            // 1. Submit application to MongoDB (existing flow)
            const appResponse = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const appData = await appResponse.json();

            if (appData.status !== 'success') {
                showToast('Submission Failed: ' + appData.message, 'error');
                return;
            }

            // 2. Call Python eligibility engine with form data + document flag
            const eligibilityPayload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                annualIncome: parseFloat(formData.annualIncome) || 0,
                employmentStatus: formData.employmentStatus,
                loanAmount: parseFloat(formData.loanAmount) || 0,
                loanTerm: parseInt(formData.loanTerm) || 12,
                loanPurpose: formData.loanPurpose,
                dependents: 0,
                existingLoanCommitments: 0,
                incomeVerified: documents.proofOfIncome.length > 0   // true if proof-of-income uploaded
            };

            const eligResponse = await fetch('http://localhost:5000/api/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eligibilityPayload)
            });
            const eligData = await eligResponse.json();

            showToast(`Application Submitted! ID: ${appData.applicationId}`, 'success');

            // 3. Navigate to the eligibility result page, passing the result via state
            if (eligData.status === 'success') {
                navigate('/customer/eligibility-result', {
                    state: {
                        result: eligData.data,
                        applicationId: appData.applicationId,
                        applicantName: `${formData.firstName} ${formData.lastName}`
                    }
                });
            } else {
                navigate('/customer');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            showToast('Error submitting application. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <Input
                                label="First Name"
                                placeholder="Jane"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                error={errors.firstName}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                error={errors.lastName}
                            />
                            <Input
                                label="Date of Birth"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                error={errors.dob}
                            />
                            <Input
                                label="NIC Number"
                                placeholder="199012345678"
                                name="nic"
                                value={formData.nic}
                                onChange={handleInputChange}
                                error={errors.nic}
                            />
                            <Input
                                label="Employment Status"
                                placeholder="Employed"
                                containerClassName="md:col-span-2"
                                name="employmentStatus"
                                value={formData.employmentStatus}
                                onChange={handleInputChange}
                                error={errors.employmentStatus}
                            />
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Annual Income</label>
                                <div className="flex gap-2">
                                    <div className="w-1/4">
                                        <select
                                            name="incomeCurrency"
                                            value={formData.incomeCurrency}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        >
                                            <option value="LKR">LKR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            placeholder="60,000"
                                            name="annualIncome"
                                            value={formData.annualIncome}
                                            onChange={handleInputChange}
                                            error={errors.annualIncome}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Input
                                label="Local Administrative Division"
                                placeholder="Division Name/No."
                                name="gramaNiladhari"
                                value={formData.gramaNiladhari}
                                onChange={handleInputChange}
                            />
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CRIB Report Number</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter CRIB Number (e.g., CR-12345)"
                                        containerClassName="flex-1"
                                        name="cribNumber"
                                        value={formData.cribNumber}
                                        onChange={handleInputChange}
                                    />
                                    <Button
                                        type="button"
                                        onClick={checkCribStatus}
                                        disabled={cribLoading || !formData.cribNumber}
                                        variant={cribStatus === 'clean' ? 'success' : (cribStatus === 'blacklisted' || cribStatus === 'error') ? 'danger' : 'primary'}
                                    >
                                        {cribLoading ? 'Checking...' : cribStatus === 'clean' ? 'Verified' : 'Check Status'}
                                    </Button>
                                </div>
                                {cribMessage && (
                                    <p className={`text-sm ${cribStatus === 'clean' ? 'text-green-600' : 'text-red-600'}`}>
                                        {cribMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Loan Details</h3>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Loan Amount</label>
                            <div className="flex gap-2">
                                <div className="w-1/4">
                                    <select
                                        name="loanCurrency"
                                        value={formData.loanCurrency}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                    >
                                        <option value="LKR">LKR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        placeholder="10,000"
                                        type="number"
                                        name="loanAmount"
                                        value={formData.loanAmount}
                                        onChange={handleInputChange}
                                        error={errors.loanAmount}
                                    />
                                </div>
                            </div>
                        </div>
                        <Input
                            label="Purpose"
                            placeholder="Home Renovation, Business, etc."
                            name="loanPurpose"
                            value={formData.loanPurpose}
                            onChange={handleInputChange}
                            error={errors.loanPurpose}
                        />
                        <Input
                            label="Term (Months)"
                            type="number"
                            placeholder="24"
                            name="loanTerm"
                            value={formData.loanTerm}
                            onChange={handleInputChange}
                            error={errors.loanTerm}
                        />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Document Upload</h3>
                            <p className="text-sm text-gray-500 mt-1">Upload the necessary documents. Our AI Risk Engine uses your proof of income to verify your debt-to-income ratio.</p>
                        </div>

                        {/* Proof of Income - Mandatory, multi-file */}
                        <div className={`border-2 border-dashed rounded-lg transition-colors relative ${
                            errors.proofOfIncome
                                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                : documents.proofOfIncome.length > 0
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}>

                            {/* Dropzone header - always visible */}
                            <label className="flex flex-col items-center gap-2 p-5 cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    className="sr-only"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const picked = Array.from(e.target.files || []);
                                        // Merge new files, avoid exact-name duplicates
                                        setDocuments(d => ({
                                            ...d,
                                            proofOfIncome: [
                                                ...d.proofOfIncome,
                                                ...picked.filter(f => !d.proofOfIncome.some(ex => ex.name === f.name))
                                            ]
                                        }));
                                        e.target.value = ''; // reset so same file can be re-added after removal
                                    }}
                                />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    documents.proofOfIncome.length > 0 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                                }`}>
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                        <span className="text-red-500 font-semibold">* </span>
                                        {documents.proofOfIncome.length > 0 ? 'Add More Pay Slips / Statements' : 'Upload Proof of Income'}
                                    </p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                                        Pay Slips or Bank Statements &bull; PDF / JPG / PNG (max 5MB each) &bull; Multiple allowed
                                    </p>
                                </div>
                            </label>

                            {/* Uploaded file list */}
                            {documents.proofOfIncome.length > 0 && (
                                <div className="border-t border-green-200 dark:border-green-800 px-4 pb-4 pt-3 space-y-2">
                                    {documents.proofOfIncome.map((file, idx) => (
                                        <div key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded flex-shrink-0">
                                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-green-700 dark:text-green-300 truncate">{file.name}</p>
                                                <p className="text-xs text-green-600/60 dark:text-green-400/60">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDocuments(d => ({
                                                    ...d,
                                                    proofOfIncome: d.proofOfIncome.filter((_, i) => i !== idx)
                                                }))}
                                                className="p-1 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-500 transition-colors flex-shrink-0"
                                                title="Remove this file"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium pt-1">
                                        {documents.proofOfIncome.length} file{documents.proofOfIncome.length > 1 ? 's' : ''} attached
                                    </p>
                                </div>
                            )}

                            {errors.proofOfIncome && (
                                <p className="text-xs text-red-500 px-5 pb-3 font-medium">{errors.proofOfIncome}</p>
                            )}
                        </div>

                        {/* ID Proof - Optional, multi-file */}
                        <div className={`border-2 border-dashed rounded-lg transition-colors relative ${
                            documents.idProof.length > 0
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}>

                            {/* Dropzone header - always visible */}
                            <label className="flex flex-col items-center gap-2 p-5 cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    className="sr-only"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const picked = Array.from(e.target.files || []);
                                        setDocuments(d => ({
                                            ...d,
                                            idProof: [
                                                ...d.idProof,
                                                ...picked.filter(f => !d.idProof.some(ex => ex.name === f.name))
                                            ]
                                        }));
                                        e.target.value = '';
                                    }}
                                />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    documents.idProof.length > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                        {documents.idProof.length > 0 ? 'Add More ID Documents' : 'Upload ID Proof'}
                                        {' '}<span className="text-xs text-gray-400 font-normal">(Optional)</span>
                                    </p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                                        National ID or Passport &bull; PDF / JPG / PNG (max 5MB each) &bull; Multiple allowed
                                    </p>
                                </div>
                            </label>

                            {/* Uploaded file list */}
                            {documents.idProof.length > 0 && (
                                <div className="border-t border-green-200 dark:border-green-800 px-4 pb-4 pt-3 space-y-2">
                                    {documents.idProof.map((file, idx) => (
                                        <div key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded flex-shrink-0">
                                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-green-700 dark:text-green-300 truncate">{file.name}</p>
                                                <p className="text-xs text-green-600/60 dark:text-green-400/60">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDocuments(d => ({
                                                    ...d,
                                                    idProof: d.idProof.filter((_, i) => i !== idx)
                                                }))}
                                                className="p-1 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-500 transition-colors flex-shrink-0"
                                                title="Remove this file"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium pt-1">
                                        {documents.idProof.length} file{documents.idProof.length > 1 ? 's' : ''} attached
                                    </p>
                                </div>
                            )}
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
                            <div className="grid grid-cols-2 gap-2">
                                <p><strong>Full Name:</strong> {formData.firstName} {formData.lastName}</p>
                                <p><strong>NIC:</strong> {formData.nic}</p>
                                <p><strong>Loan Amount:</strong> {formData.loanCurrency} {formData.loanAmount}</p>
                                <p><strong>Term:</strong> {formData.loanTerm} Months</p>
                                <p><strong>Purpose:</strong> {formData.loanPurpose}</p>
                                <p><strong>Annual Income:</strong> {formData.incomeCurrency} {formData.annualIncome}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-light-border dark:border-dark-border">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                        Back
                    </Button>
                    {currentStep === steps.length - 1 ? (
                        <Button onClick={submitApplication} isLoading={isSubmitting}>
                            Submit Application
                        </Button>
                    ) : (
                        <Button onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                            Next Step
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};
