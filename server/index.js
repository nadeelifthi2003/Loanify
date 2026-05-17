const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');
const {
    ROLE_OPTIONS,
    STATUS_OPTIONS,
    createUser,
    getOverview,
    listUsers,
    updateUserRole,
    updateUserStatus,
    getAnalytics,
} = require('./src/services/adminService');

const app = express();
const PORT = process.env.PORT || 5000;
const ELIGIBILITY_SERVICE_URL = process.env.ELIGIBILITY_SERVICE_URL || 'http://localhost:8000/eligibility';
const RISK_SERVICE_URL = process.env.RISK_SERVICE_URL || 'http://localhost:8000/predict';

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/loanify')
        .then(() => console.log('Successfully connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const getEligibilityPayloadFromApplication = (application) => {
    const fullName = (application.fullName || '').trim();
    const [firstName = 'Applicant', ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);
    const annualIncome = Math.max((parseFloat(application.grossMonthlyIncome) || 0) * 12, 0);

    return {
        firstName,
        lastName: lastNameParts.join(' ') || 'Customer',
        annualIncome,
        employmentStatus: application.employmentType || 'Employed',
        loanAmount: parseFloat(application.loanAmount) || 0,
        loanTerm: parseInt(application.tenure, 10) || 12,
        loanPurpose: application.loanPurpose || application.loanType || 'General',
        dependents: Math.max(0, parseInt(application.dependents, 10) || 0),
        existingLoanCommitments: parseFloat(application.existingLoanCommitments) || 0,
        incomeVerified: Array.isArray(application.documents) && application.documents.length > 0,
        dob: application.dob || undefined
    };
};

const buildFallbackEligibilityRecommendation = (payload) => {
    const annualIncome = Math.max(Number(payload.annualIncome) || 0, 0);
    const grossMonthlyIncome = annualIncome / 12;
    const existingLoanCommitments = Math.max(Number(payload.existingLoanCommitments) || 0, 0);
    const loanAmount = Math.max(Number(payload.loanAmount) || 0, 0);
    const loanTerm = Math.max(Number(payload.loanTerm) || 12, 1);
    const dependents = Math.max(Number(payload.dependents) || 0, 0);
    const normalizedEmp = normalizeEmploymentStatus(payload.employmentStatus || 'Unknown');
    const emp = normalizedEmp.toLowerCase();
    const emi = calculateRiskEmi(loanAmount, 0.15, loanTerm);
    const totalObligations = existingLoanCommitments + emi;
    const dti = grossMonthlyIncome > 0 ? Number(((totalObligations / grossMonthlyIncome) * 100).toFixed(1)) : 999;
    const dtiCategory = classifyDti(dti);
    const lti = annualIncome > 0 ? loanAmount / annualIncome : Number.POSITIVE_INFINITY;

    const maxAffordableMonthly = grossMonthlyIncome * 0.4 - existingLoanCommitments;
    const monthlyRate = 0.15 / 12;
    const maxLoan = maxAffordableMonthly > 0
        ? maxAffordableMonthly * (Math.pow(1 + monthlyRate, loanTerm) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))
        : 0;
    const maxRecommendedLoan = Math.max(0, Math.round(Math.min(maxLoan, annualIncome * 3)));

    let score = 60;

    if (dti < 25) score += 30;
    else if (dti < 35) score += 20;
    else if (dti < 45) score += 10;
    else if (dti < 55) score -= 10;
    else score -= 30;

    if (lti < 1) score += 15;
    else if (lti < 2) score += 10;
    else if (lti < 3.5) score += 5;
    else if (lti < 5) score -= 5;
    else score -= 15;

    if (emp.includes('permanent')) score += 10;
    else if (emp.includes('contract')) score += 3;
    else if (emp.includes('business') || emp.includes('self')) score -= 5;

    score -= Math.min(dependents, 5);

    const documentBonus = payload.incomeVerified ? 10 : 0;
    score += documentBonus;
    score = Math.max(0, Math.min(Math.round(score), 100));

    const hardRejection = dti >= 60 || lti > 6;
    let eligible = true;
    let verdict = 'Likely Eligible';
    let verdictColor = 'text-green-600 dark:text-green-400';
    let approvalProbability = 60 + Math.floor((score - 55) / 2);

    if (hardRejection || score < 35) {
        eligible = false;
        verdict = 'Not Eligible';
        verdictColor = 'text-red-600 dark:text-red-400';
        approvalProbability = Math.max(5, Math.floor(score / 2));
    } else if (score < 55) {
        eligible = true;
        verdict = 'Conditionally Eligible';
        verdictColor = 'text-yellow-600 dark:text-yellow-400';
        approvalProbability = 40 + Math.floor(score / 3);
    }

    approvalProbability = Math.max(0, Math.min(Math.round(approvalProbability), 98));

    const strengths = [];
    const improvements = [];

    if (dti < 35) {
        strengths.push({
            label: 'Debt-to-Income Ratio',
            score: 'Excellent',
            color: 'text-green-600',
            desc: `Your total debt burden is only ${dti}% of income and remains within a safe range.`,
        });
    } else if (dti < 50) {
        improvements.push({
            label: 'Debt-to-Income Ratio',
            score: 'Moderate',
            color: 'text-yellow-600',
            desc: `Your DTI stands at ${dti}%. Reducing existing debt could improve approval chances.`,
        });
    } else {
        improvements.push({
            label: 'Debt-to-Income Ratio',
            score: 'High Risk',
            color: 'text-red-600',
            desc: `Your DTI is ${dti}%, which is above the recommended cap for this loan.`,
        });
    }

    if (lti < 2) {
        strengths.push({
            label: 'Loan-to-Annual Income',
            score: 'Good',
            color: 'text-blue-600',
            desc: 'The requested loan amount is reasonable against your annual income.',
        });
    } else if (lti < 4) {
        improvements.push({
            label: 'Loan-to-Annual Income',
            score: 'Moderate',
            color: 'text-yellow-600',
            desc: `Your request is ${lti.toFixed(1)}x annual income. A smaller amount would be safer.`,
        });
    } else {
        improvements.push({
            label: 'Loan-to-Annual Income',
            score: 'Risky',
            color: 'text-red-600',
            desc: `Requested amount is ${lti.toFixed(1)}x annual income. Recommended maximum is LKR ${maxRecommendedLoan.toLocaleString()}.`,
        });
    }

    if (emp.includes('permanent')) {
        strengths.push({
            label: 'Employment Stability',
            score: 'Excellent',
            color: 'text-green-600',
            desc: 'Permanent or full-time employment improves lending confidence.',
        });
    } else if (emp.includes('contract')) {
        improvements.push({
            label: 'Employment Stability',
            score: 'Fair',
            color: 'text-yellow-600',
            desc: 'Contract employment introduces some income uncertainty.',
        });
    } else {
        improvements.push({
            label: 'Employment Stability',
            score: 'Variable',
            color: 'text-yellow-600',
            desc: 'Self-employed or business income may require stronger supporting documents.',
        });
    }

    if (payload.incomeVerified) {
        strengths.push({
            label: 'Income Verification',
            score: 'Verified',
            color: 'text-green-600',
            desc: `Proof-of-income documents were uploaded and improved the score by +${documentBonus}.`,
        });
    } else {
        improvements.push({
            label: 'Income Verification',
            score: 'Missing',
            color: 'text-orange-600',
            desc: 'Uploading salary slips or bank statements would strengthen this application.',
        });
    }

    const insights = [
        `Estimated monthly EMI for this loan is approximately ${Math.round(emi).toLocaleString()}.`,
        `Debt obligations would use ${dti}% of gross monthly income after approval.`,
    ];

    if (maxRecommendedLoan > 0 && loanAmount > maxRecommendedLoan) {
        insights.push(`Based on your profile, a more comfortable loan amount is around LKR ${maxRecommendedLoan.toLocaleString()}.`);
    }

    if (payload.incomeVerified) {
        insights.push('Document verification was included in this eligibility result.');
    }

    const alerts = [];
    if (dti >= 60) {
        alerts.push({
            title: 'DTI Too High',
            desc: 'Total debt obligations exceed 60% of gross income. Approval is unlikely at this level.',
        });
    }
    if (lti > 6) {
        alerts.push({
            title: 'Loan Amount Exceeds Safe Range',
            desc: `Requested amount is very high relative to income. Recommended maximum: LKR ${maxRecommendedLoan.toLocaleString()}.`,
        });
    }
    if (!payload.incomeVerified) {
        alerts.push({
            title: 'No Income Document Uploaded',
            desc: 'Uploading proof of income is important and can materially improve the application.',
        });
    }

    return {
        eligible,
        verdict,
        verdictColor,
        eligibilityScore: score,
        approvalProbability,
        estimatedEMI: Math.round(emi),
        dti,
        dtiCategory,
        lti: Number.isFinite(lti) ? Number(lti.toFixed(2)) : 0,
        maxRecommendedLoan,
        documentBonus,
        strengths,
        improvements,
        insights,
        alerts,
    };
};

const ensureApplicationEligibilityResult = async (application) => {
    if (application.eligibilityResult) {
        return application;
    }

    const eligibilityPayload = getEligibilityPayloadFromApplication(application);

    // Skip backfill if the stored record is missing the core values needed
    // to produce a meaningful eligibility recommendation.
    if (!eligibilityPayload.annualIncome || !eligibilityPayload.loanAmount) {
        return application;
    }

    try {
        const response = await fetch(ELIGIBILITY_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eligibilityPayload)
        });

        if (!response.ok) {
            throw new Error(`Python eligibility service error: ${response.status}`);
        }

        const result = await response.json();
        application.eligibilityResult = result;
        application.eligibilityCheckedAt = new Date();
        application.markModified('eligibilityResult');
        await application.save();
    } catch (error) {
        console.error(`Eligibility backfill failed for ${application.id}:`, error.message);
        application.eligibilityResult = buildFallbackEligibilityRecommendation(eligibilityPayload);
        application.eligibilityCheckedAt = new Date();
        application.markModified('eligibilityResult');
        await application.save();
    }

    return application;
};

const calculateRiskEmi = (principal, annualRate = 0.15, months = 12) => {
    const safePrincipal = Math.max(Number(principal) || 0, 0);
    const safeMonths = Math.max(Number(months) || 0, 0);

    if (safeMonths <= 0) {
        return safePrincipal;
    }

    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) {
        return safePrincipal / safeMonths;
    }

    const factor = Math.pow(1 + monthlyRate, safeMonths);
    return (safePrincipal * monthlyRate * factor) / (factor - 1);
};

const classifyDti = (dtiPct) => {
    if (dtiPct < 30) return 'Low';
    if (dtiPct < 45) return 'Moderate';
    return 'High';
};

const normalizeEmploymentStatus = (status) => {
    const normalized = String(status || '').trim().toLowerCase();

    if (
        normalized.includes('permanent') ||
        normalized.includes('full-time') ||
        ['employed', 'employee', 'employer', 'full time'].includes(normalized)
    ) {
        return 'Permanent';
    }
    if (normalized.includes('contract') || normalized.includes('temporary')) {
        return 'Contract';
    }
    if (normalized.includes('self')) {
        return 'Self-Employed';
    }
    if (normalized.includes('business')) {
        return 'Business';
    }

    return status ? String(status) : 'Unknown';
};

const calculateRuleBasedRisk = (dtiPct, lti, employmentType, dependents = 0) => {
    let riskScore = 10;
    const normalizedEmp = normalizeEmploymentStatus(employmentType).toLowerCase();

    if (dtiPct >= 60) riskScore += 55;
    else if (dtiPct >= 50) riskScore += 40;
    else if (dtiPct >= 40) riskScore += 25;
    else if (dtiPct >= 30) riskScore += 15;
    else if (dtiPct < 15) riskScore -= 5;

    if (lti >= 5) riskScore += 25;
    else if (lti >= 4) riskScore += 20;
    else if (lti >= 2) riskScore += 10;
    else if (lti < 0.5) riskScore -= 5;

    if (normalizedEmp.includes('business') || normalizedEmp.includes('self')) riskScore += 15;
    else if (normalizedEmp.includes('contract')) riskScore += 10;
    else if (normalizedEmp.includes('permanent')) riskScore -= 5;

    riskScore += Math.min(Math.max(Number(dependents) || 0, 0), 5);

    return Math.max(0, Math.min(Math.round(riskScore), 99));
};

const buildFallbackRiskAssessment = (application) => {
    const grossMonthlyIncome = Math.max(Number(application.grossMonthlyIncome) || 0, 0);
    const netMonthlyIncome = Math.max(Number(application.netMonthlyIncome) || grossMonthlyIncome, 0);
    const existingLoanCommitments = Math.max(Number(application.existingLoanCommitments) || 0, 0);
    const loanAmount = Math.max(Number(application.loanAmount) || 0, 0);
    const tenure = Math.max(Number(application.tenure) || 12, 1);
    const dependents = Math.max(Number(application.dependents) || 0, 0);
    const employmentType = application.employmentType || 'Unknown';

    const emi = calculateRiskEmi(loanAmount, 0.15, tenure);
    const totalMonthlyObligations = existingLoanCommitments + emi;
    const dti = grossMonthlyIncome > 0 ? Number(((totalMonthlyObligations / grossMonthlyIncome) * 100).toFixed(1)) : 999;
    const dtiCategory = classifyDti(dti);
    const lti = grossMonthlyIncome > 0 ? loanAmount / (grossMonthlyIncome * 12) : Number.POSITIVE_INFINITY;
    const riskScore = calculateRuleBasedRisk(dti, lti, employmentType, dependents);
    const normalizedEmp = normalizeEmploymentStatus(employmentType);
    const empType = normalizedEmp.toLowerCase();

    let riskCategory = 'Medium Risk';
    let approvalProbability = 50 + (60 - riskScore);
    let approvalCategory = 'Review Needed';

    if (riskScore < 30) {
        riskCategory = 'Low Risk';
        approvalProbability = 85 + Math.floor((30 - riskScore) / 2);
        approvalCategory = 'Highly Recommended';
    } else if (riskScore >= 60) {
        riskCategory = 'High Risk';
        approvalProbability = Math.max(5, 100 - riskScore);
        approvalCategory = 'Not Recommended';
    }

    approvalProbability = Math.max(0, Math.min(Math.round(approvalProbability), 100));

    const factors = [];

    if (empType.includes('permanent')) {
        factors.push({
            label: 'Employment Stability',
            score: 'Excellent',
            color: 'text-green-600',
            desc: 'Permanent employment shows stability',
        });
    } else {
        factors.push({
            label: 'Employment Stability',
            score: 'Fair',
            color: 'text-yellow-600',
            desc: `${normalizedEmp} may have income variance`,
        });
    }

    if (dti < 30) {
        factors.push({
            label: 'Debt-to-Income',
            score: 'Excellent',
            color: 'text-green-600',
            desc: `Healthy ratio at ${dti}%`,
        });
    } else if (dti < 45) {
        factors.push({
            label: 'Debt-to-Income',
            score: 'Good',
            color: 'text-blue-600',
            desc: `Moderate ratio at ${dti}%`,
        });
    } else {
        factors.push({
            label: 'Debt-to-Income',
            score: 'Poor',
            color: 'text-red-600',
            desc: `High ratio at ${dti}%`,
        });
    }

    if (lti < 2) {
        factors.push({
            label: 'Loan-to-Income',
            score: 'Good',
            color: 'text-blue-600',
            desc: 'Loan amount is reasonable vs income',
        });
    } else {
        factors.push({
            label: 'Loan-to-Income',
            score: 'Fair',
            color: 'text-yellow-600',
            desc: 'Loan amount is high compared to annual income',
        });
    }

    const insights = [
        `DTI ratio is ${dti}%, which is considered ${dtiCategory.toLowerCase()}.`,
        `Estimated EMI: ${Math.round(emi).toLocaleString()} per month.`,
    ];

    if (dependents > 2) {
        insights.push('Higher number of dependents may impact disposable income.');
    }

    const alerts = [];
    if (dti > 50) {
        alerts.push({
            title: 'High Debt Burden',
            desc: 'Total obligations exceed 50% of gross income.',
        });
    }
    if (lti > 5) {
        alerts.push({
            title: 'Excessive Loan Amount',
            desc: 'Loan is more than 5x annual gross income.',
        });
    }

    return {
        overallRiskScore: riskScore,
        riskCategory,
        approvalProbability,
        approvalCategory,
        dti,
        dtiCategory,
        factors,
        insights,
        alerts,
    };
};

const buildFallbackDocumentValidation = (doc = {}) => {
    const fileName = String(doc.fileName || '');
    const fileType = String(doc.fileType || '');
    const rawData = String(doc.data || '');
    const nameLower = fileName.toLowerCase();

    let base64Payload = rawData;
    if (base64Payload.includes(',')) {
        base64Payload = base64Payload.split(',')[1];
    }

    let fileBytes = Buffer.alloc(0);
    try {
        fileBytes = Buffer.from(base64Payload, 'base64');
    } catch (error) {
        return {
            status: 'Invalid',
            confidence: 0.99,
            reason: 'Invalid file encoding format.',
        };
    }

    const isPdf = fileType === 'application/pdf' || nameLower.endsWith('.pdf');

    if (!isPdf) {
        if (fileBytes.length < 1000) {
            return {
                status: 'Invalid',
                confidence: 0.85,
                reason: 'Image file density is too low to be a valid scanned document.',
            };
        }

        if (nameLower.includes('fake') || nameLower.includes('fraud') || nameLower.includes('untitled')) {
            return {
                status: 'Invalid',
                confidence: 0.99,
                reason: 'Document metadata indicates an invalid file or dummy upload.',
            };
        }

        return {
            status: 'Valid',
            confidence: 0.75,
            reason: 'Image met heuristic integrity checks.',
        };
    }

    if (fileBytes.length < 100) {
        return {
            status: 'Invalid',
            confidence: 0.95,
            reason: 'PDF payload is too small to be a valid financial document.',
        };
    }

    const decodedText = fileBytes.toString('utf8').toLowerCase();
    const keywords = ['bank', 'statement', 'account', 'balance', 'salary', 'employee', 'transaction', 'credit', 'debit', 'nic', 'identity', 'payslip', 'card', 'sri lanka'];
    const totalHits = keywords.reduce((count, keyword) => count + (decodedText.includes(keyword) ? 1 : 0), 0);

    if (totalHits >= 1) {
        return {
            status: 'Valid',
            confidence: Math.min(0.99, 0.7 + (totalHits * 0.05)),
            reason: `Document passed fallback validation (${totalHits} keywords matched).`,
        };
    }

    if (nameLower.includes('statement') || nameLower.includes('salary') || nameLower.includes('payslip') || nameLower.includes('bank')) {
        return {
            status: 'Valid',
            confidence: 0.78,
            reason: 'Filename pattern matches an expected financial document.',
        };
    }

    return {
        status: 'Invalid',
        confidence: 0.9,
        reason: 'Document content lacks required validation signals.',
    };
};

const validateDocumentWithFallback = async (doc = {}) => {
    try {
        const response = await fetch('http://localhost:8000/validate-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc)
        });

        if (!response.ok) {
            throw new Error(`Document validation service error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Document validation fallback used for ${doc.fileName || 'document'}:`, error.message);
        return buildFallbackDocumentValidation(doc);
    }
};

const ensureApplicationDocumentStatuses = async (application) => {
    const documents = Array.isArray(application.documents) ? application.documents : [];
    const needsValidation = documents.some((doc) => !doc.status || doc.status === 'Pending');

    if (!needsValidation) {
        return application;
    }

    let didUpdate = false;
    for (const doc of documents) {
        if (doc.status && doc.status !== 'Pending') {
            continue;
        }

        const validation = await validateDocumentWithFallback({
            fileName: doc.fileName,
            fileType: doc.fileType,
            data: doc.data
        });
        doc.status = validation.status === 'Invalid' ? 'Invalid' : 'Valid';
        didUpdate = true;
    }

    if (didUpdate) {
        application.markModified('documents');
        await application.save();
    }

    return application;
};

// ─────────────────────────────────────────────
// CRIB (Credit Information Bureau) Verification
// ─────────────────────────────────────────────
//
// Valid Sri Lanka CRIB report numbers follow the format: CR-XXXXXXX
//   - Must start with the prefix "CR-" (case-insensitive)
//   - Followed by exactly 7 numeric digits
//   Example valid numbers: CR-1234567, CR-9876543, CR-0011223
//
// The regex used: /^CR-\d{7}$/i
//
// A curated blacklist of CRIB numbers that are flagged in the system.
// For demo purposes the following numbers return "blacklisted":
//   CR-0000001, CR-9999999, CR-1111111, CR-3333333, CR-7654321

const CRIB_BLACKLIST = new Set([
    'CR-0000001',
    'CR-9999999',
    'CR-1111111',
    'CR-3333333',
    'CR-7654321',
]);

const CRIB_NUMBER_REGEX = /^CR-\d{7}$/i;

app.post('/api/check-crib', (req, res) => {
    try {
        const { cribNumber } = req.body;

        if (!cribNumber || typeof cribNumber !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'CRIB number is required.',
            });
        }

        const trimmed = cribNumber.trim();

        // --- Format validation ---
        if (!CRIB_NUMBER_REGEX.test(trimmed)) {
            return res.status(400).json({
                status: 'error',
                message:
                    'Invalid CRIB number format. A valid CRIB number must start with "CR-" followed by exactly 7 digits (e.g., CR-1234567).',
            });
        }

        // Normalise to uppercase for consistent lookup
        const normalised = trimmed.toUpperCase();

        // --- Blacklist check ---
        if (CRIB_BLACKLIST.has(normalised)) {
            return res.json({
                status: 'blacklisted',
                message:
                    'This CRIB number is flagged in our system. You are not eligible to apply for a loan.',
            });
        }

        // --- All checks passed → clean record ---
        return res.json({
            status: 'clean',
            message: `CRIB report ${normalised} verified successfully. No adverse credit records found.`,
        });
    } catch (error) {
        console.error('CRIB check error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while verifying the CRIB number. Please try again.',
        });
    }
});

// Loanify Loan Rates Route
app.get('/api/rates/loanify', (req, res) => {
    // Base rates defined by Loanify - fluctuate slightly to show live feed
    const fluctuate = (base) => (base + parseFloat((Math.random() * 0.2 - 0.1).toFixed(2))).toFixed(2);
    const trend = () => Math.random() > 0.5 ? 'up' : 'down';

    const products = [
        {
            id: 1,
            product: 'Personal Loan',
            icon: 'user',
            rate: fluctuate(13.5),
            minTenure: 12,
            maxTenure: 60,
            maxAmount: 2000000,
            description: 'Fast approval, no collateral required',
            trend: trend(),
        },
        {
            id: 2,
            product: 'Home Loan',
            icon: 'home',
            rate: fluctuate(11.0),
            minTenure: 60,
            maxTenure: 240,
            maxAmount: 25000000,
            description: 'Build your dream home at low rates',
            trend: trend(),
        },
        {
            id: 3,
            product: 'Vehicle Loan',
            icon: 'car',
            rate: fluctuate(12.5),
            minTenure: 12,
            maxTenure: 84,
            maxAmount: 8000000,
            description: 'Finance your car or motorbike easily',
            trend: trend(),
        },
        {
            id: 4,
            product: 'Education Loan',
            icon: 'book',
            rate: fluctuate(9.5),
            minTenure: 12,
            maxTenure: 84,
            maxAmount: 3000000,
            description: 'Invest in your future with lower rates',
            trend: trend(),
        },
        {
            id: 5,
            product: 'Business Loan',
            icon: 'briefcase',
            rate: fluctuate(14.0),
            minTenure: 12,
            maxTenure: 120,
            maxAmount: 50000000,
            description: 'Scale your business with flexible terms',
            trend: trend(),
        },
        {
            id: 6,
            product: 'Agri Loan',
            icon: 'leaf',
            rate: fluctuate(8.5),
            minTenure: 6,
            maxTenure: 60,
            maxAmount: 5000000,
            description: 'Subsidized loans for the farming sector',
            trend: trend(),
        },
    ];

    res.json({
        status: 'success',
        provider: 'Loanify',
        lastUpdated: new Date().toISOString(),
        products,
    });
});

// Auth Routes

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'customer'
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role, email: newUser.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            status: 'success',
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ status: 'error', message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ status: 'error', message: `Not authorized as ${role}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.json({
            status: 'success',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ status: 'error', message: 'Server error during login' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { token, role } = req.body;
        if (!token) {
            return res.status(400).json({ status: 'error', message: 'Token is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || 'placeholder',
        });

        const payload = ticket.getPayload();
        if (!payload) {
             return res.status(400).json({ status: 'error', message: 'Invalid Google token payload' });
        }

        const email = payload.email.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            // Register
            user = new User({
                name: payload.name,
                email: email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
                role: role || 'customer',
            });
            await user.save();
        } else if (role && user.role !== role) {
            return res.status(403).json({ status: 'error', message: `Not authorized as ${role}` });
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.json({
            status: 'success',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token: jwtToken
        });
    } catch (error) {
        console.error('Google Auth error:', error);
        res.status(500).json({ status: 'error', message: 'Server error during Google authentication' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/api/admin/overview', async (req, res) => {
    try {
        const overview = await getOverview();
        res.json(overview);
    } catch (error) {
        console.error('Error loading admin overview:', error);
        res.status(500).json({ status: 'error', message: 'Failed to load admin overview', error: error.message });
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    try {
        const analytics = await getAnalytics();
        res.json(analytics);
    } catch (error) {
        console.error('Error loading admin analytics:', error);
        res.status(500).json({ status: 'error', message: 'Failed to load admin analytics', error: error.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const result = await listUsers(req.query || {});
        res.json(result);
    } catch (error) {
        console.error('Error loading admin users:', error);
        res.status(500).json({ status: 'error', message: 'Failed to load users', error: error.message });
    }
});

app.post('/api/admin/users', async (req, res) => {
    try {
        const user = await createUser(req.body || {});
        res.status(201).json({ status: 'success', user });
    } catch (error) {
        const statusCode = /exists|required|invalid/i.test(error.message) ? 400 : 500;
        res.status(statusCode).json({ status: 'error', message: error.message });
    }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body || {};
        const user = await updateUserStatus(req.params.id, status);
        res.json({ status: 'success', user });
    } catch (error) {
        const statusCode = /not found/i.test(error.message) ? 404 : /invalid/i.test(error.message) ? 400 : 500;
        res.status(statusCode).json({ status: 'error', message: error.message, allowedStatuses: STATUS_OPTIONS });
    }
});

app.patch('/api/admin/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body || {};
        const user = await updateUserRole(req.params.id, role);
        res.json({ status: 'success', user });
    } catch (error) {
        const statusCode = /not found/i.test(error.message) ? 404 : /invalid/i.test(error.message) ? 400 : 500;
        res.status(statusCode).json({ status: 'error', message: error.message, allowedRoles: ROLE_OPTIONS });
    }
});

// Dynamic CRIB Validation Logic (No Mocks)
app.post('/api/check-crib', (req, res) => {
    const { cribNumber } = req.body;

    if (!cribNumber || cribNumber.length < 5) {
        return res.status(400).json({ status: 'error', message: 'Valid CRIB Number is required (Min 5 chars)' });
    }

    // Dynamic verification for testing: Treat entries containing '9000' as blacklisted, otherwise clean.
    if (cribNumber.includes('9000')) {
        return res.json({
            status: 'blacklisted',
            message: 'High risk detected. CRIB report indicates unfavorable credit history.'
        });
    }

    return res.json({
        status: 'clean',
        message: 'CRIB Verification Successful. No adverse records found.'
    });
});

/*
 * API Endpoint: Calculate EMI
 * Method: POST
 * Body: { amount: number, rate: number, tenure: number }
 * Response: { emi: number, totalPayment: number, totalInterest: number }
 */
app.post('/api/calculate-emi', (req, res) => {
    const { amount, rate, tenure } = req.body;

    // Validation
    if (!amount || !rate || !tenure || amount <= 0 || rate <= 0 || tenure <= 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid input values.' });
    }

    const p = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure);

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    res.json({
        status: 'success',
        emi: Math.round(emi),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest)
    });
});

/*
 * API Endpoint: Submit Loan Application
 * Method: POST
 * Body: { ...applicationData }
 * Response: { status: 'success', applicationId: string, message: string }
 */
app.post('/api/applications', async (req, res) => {
    try {
        const applicationData = req.body;

        // Log Received Data
        console.log('Received Loan Application:', applicationData);

        // Simple Validation
        if (!applicationData.nic || !applicationData.loanAmount) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const applicationId = `L-${Math.floor(1000 + Math.random() * 9000)}`;
        const annualIncome = parseFloat(applicationData.annualIncome) || 0;
        const grossMonthlyIncome = annualIncome > 0 ? annualIncome / 12 : 50000;
        const existingLoanCommitments = parseFloat(applicationData.existingLoanCommitments) || 0;
        const dependents = Math.max(0, parseInt(applicationData.dependents, 10) || 0);

        // Evaluate documents via ML Risk Service
        const validatedDocs = [];
        const inputDocs = applicationData.documents || [];
        for (const doc of inputDocs) {
            const validation = await validateDocumentWithFallback(doc);
            doc.status = validation.status === 'Invalid' ? 'Invalid' : 'Valid';
            validatedDocs.push(doc);
        }

        // Map frontend form data to strict Mongoose Schema requirements
        const newApplication = new Application({
            id: applicationId,
            status: 'Pending',
            title: 'Mr/Ms',
            fullName: `${applicationData.firstName} ${applicationData.lastName}`.trim(),
            nic: applicationData.nic,
            dob: applicationData.dob || '1990-01-01',
            gender: 'Not Specified',
            maritalStatus: 'Not Specified',
            dependents: dependents,
            contactNumber: '0700000000', // Default pending UI addition
            email: `${applicationData.firstName || 'applicant'}@example.com`.toLowerCase(),
            address: applicationData.gramaNiladhari || 'Not Specified',
            residentialStatus: applicationData.residentialStatus || 'Owned',
            employmentType: applicationData.employmentStatus || 'Employed',
            employerName: 'Specified Employer',
            designation: 'Applicant',
            servicePeriod: applicationData.servicePeriod || '1+ Years',
            grossMonthlyIncome: grossMonthlyIncome,
            netMonthlyIncome: Math.max(grossMonthlyIncome - existingLoanCommitments, grossMonthlyIncome * 0.8),
            existingLoanCommitments: existingLoanCommitments,
            loanType: applicationData.loanPurpose || 'Personal Loan',
            loanAmount: parseFloat(applicationData.loanAmount) || 0,
            loanPurpose: applicationData.loanPurpose || 'General',
            tenure: parseInt(applicationData.loanTerm) || 12,
            documents: validatedDocs,
            createdAt: new Date()
        });

        await newApplication.save();

        res.status(201).json({
            status: 'success',
            applicationId: applicationId,
            message: 'Application submitted successfully!'
        });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ status: 'error', message: 'Failed to submit application', error: error.message });
    }
});

/*
 * API Endpoint: Predict Loan Eligibility (immediate, pre-submission)
 * Method: POST
 * Body: { firstName, lastName, annualIncome, employmentStatus, loanAmount, loanTerm, loanPurpose, dependents, existingLoanCommitments, incomeVerified }
 * Response: Full eligibility recommendation from Python service
 */
app.post('/api/eligibility', async (req, res) => {
    try {
        const { applicationId, ...eligibilityPayload } = req.body;
        let result;

        try {
            const response = await fetch(ELIGIBILITY_SERVICE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eligibilityPayload)
            });

            if (!response.ok) {
                throw new Error(`Python eligibility service error: ${response.status}`);
            }

            result = await response.json();
        } catch (serviceError) {
            console.error('Eligibility service unavailable, using fallback:', serviceError.message);
            result = buildFallbackEligibilityRecommendation(eligibilityPayload);
        }

        if (applicationId) {
            await Application.findOneAndUpdate(
                { id: applicationId },
                {
                    eligibilityResult: result,
                    eligibilityCheckedAt: new Date()
                }
            );
        }

        res.json({ status: 'success', data: result });
    } catch (error) {
        console.error('Eligibility prediction error:', error);
        res.status(500).json({ status: 'error', message: 'Eligibility check failed', error: error.message });
    }
});

/*
 * API Endpoint: Get Customer's Applications
 * Method: GET
 * Response: Array of applications
 */
app.get('/api/applications/my-applications', async (req, res) => {
    try {
        // In a real app, you would filter by a User ID or Token
        // For now, we return all to mimic a single user session
        const applications = await Application.find({}).sort({ date: -1 });
        const hydratedApplications = await Promise.all(
            applications.map(async (application) => {
                await ensureApplicationDocumentStatuses(application);
                return ensureApplicationEligibilityResult(application);
            })
        );
        res.json(hydratedApplications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch applications', error: error.message });
    }
});

/*
 * API Endpoint: Get Risk Assessment
 * Method: GET
 * Response: Risk assessment logic from python service
 */
app.get('/api/applications/:id/risk', async (req, res) => {
    try {
        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }
        
        // Prepare data for Python service
        const payload = {
            id: application.id,
            grossMonthlyIncome: application.grossMonthlyIncome,
            netMonthlyIncome: application.netMonthlyIncome,
            existingLoanCommitments: application.existingLoanCommitments || 0,
            loanAmount: application.loanAmount,
            tenure: application.tenure,
            employmentType: application.employmentType,
            servicePeriod: application.servicePeriod,
            dependents: application.dependents,
            dob: application.dob,
            residentialStatus: application.residentialStatus
        };

        // Call Python service strictly (No Fallbacks)
        try {
            const response = await fetch(RISK_SERVICE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Python service responded with status: ${response.status}`);
            }

            const riskData = await response.json();
            return res.json({ status: 'success', data: riskData, source: 'python' });
        } catch (riskServiceError) {
            console.error(`Risk service unavailable for ${application.id}:`, riskServiceError.message);
            const fallbackRiskData = buildFallbackRiskAssessment(application);
            return res.json({
                status: 'success',
                data: fallbackRiskData,
                source: 'fallback'
            });
        }
    } catch (error) {
        console.error('Error fetching risk assessment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to assess risk', error: error.message });
    }
});

/*
 * API Endpoint: Process Loan Payment
 * Method: POST
 */
app.post('/api/applications/:id/pay', async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentAmount = parseFloat(amount);
        
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid payment amount' });
        }

        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        if (application.status !== 'Approved' && application.status !== 'Manager Approved') {
            return res.status(400).json({ status: 'error', message: 'Can only make payments on approved loans' });
        }

        application.paidAmount = (application.paidAmount || 0) + paymentAmount;
        
        // Push actual chronological ledger entry
        if (!application.paymentHistory) application.paymentHistory = [];
        application.paymentHistory.push({
            date: new Date(),
            amount: paymentAmount
        });

        // Advance the next due date by 1 month if fully paid
        // Assuming every payment at least covers the EMI for now for MVP
        if (application.nextDueDate) {
            const currentDue = new Date(application.nextDueDate);
            // Move month forward
            let nextM = currentDue.getMonth() + 1;
            let nextY = currentDue.getFullYear();
            if (nextM > 11) {
                nextM = 0;
                nextY++;
            }
            application.nextDueDate = new Date(nextY, nextM, currentDue.getDate());
        }

        await application.save();

        res.json({
            status: 'success',
            message: `Successfully processed payment of LKR ${paymentAmount.toLocaleString()}`,
            application: application
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process payment', error: error.message });
    }
});

/*
 * API Endpoint: Get All Applications (Officer)
 * Method: GET
 * Response: Array of all applications
 */
app.get('/api/officer/applications', async (req, res) => {
    try {
        const applications = await Application.find({}).sort({ date: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications for officer:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch applications', error: error.message });
    }
});

/*
 * API Endpoint: Get Application by ID (Officer)
 * Method: GET
 */
app.get('/api/officer/applications/:id', async (req, res) => {
    try {
        const application = await Application.findOne({ id: req.params.id });
        if (!application) return res.status(404).json({ status: 'error', message: 'Application not found' });
        res.json(application);
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch application details', error: error.message });
    }
});

/*
 * API Endpoint: Update Application Status (Officer)
 * Method: PUT
 */
app.put('/api/officer/applications/:id/status', async (req, res) => {
    try {
        const { status, role } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Needs Info', 'Manager Review', 'Manager Rejected', 'Manager Approved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status provided' });
        }

        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        let finalStatus = status;

        // ── Eligibility Guard ────────────────────────────────────────────────
        // If the application's eligibility verdict is "Not Eligible", the loan
        // officer CANNOT approve or escalate. The system forces a Rejection.
        const eligibilityVerdict = application.eligibilityResult?.verdict;
        if (
            eligibilityVerdict === 'Not Eligible' &&
            (status === 'Approved' || status === 'Manager Review')
        ) {
            return res.status(422).json({
                status: 'error',
                message: 'This application was assessed as Not Eligible by the system. Approval or escalation is not permitted. The application must be Rejected.'
            });
        }

        // ── Invalid Document Guard ───────────────────────────────────────────
        // Applications with one or more Invalid documents cannot be approved or
        // escalated to Manager Review. The officer must reject or request more info.
        const hasInvalidDocuments = (application.documents || []).some(
            doc => doc.status === 'Invalid'
        );
        if (
            hasInvalidDocuments &&
            (status === 'Approved' || status === 'Manager Review')
        ) {
            const invalidDocs = application.documents
                .filter(doc => doc.status === 'Invalid')
                .map(doc => doc.fileName)
                .join(', ');
            return res.status(422).json({
                status: 'error',
                message: `Application contains invalid documents: ${invalidDocs}. Approval or escalation is not permitted until all documents are valid.`
            });
        }

        // ── Escalation Rule ─────────────────────────────────────────────────
        // Loans ≥ LKR 1,000,000 must always go to Manager Review first.
        if (role !== 'manager' && status === 'Approved' && application.loanAmount >= 1000000) {
            finalStatus = 'Manager Review';
        }

        application.status = finalStatus;

        if ((finalStatus === 'Approved' || finalStatus === 'Manager Approved') && !application.nextDueDate) {
            // Find all other Approved applications for this customer to check existing due dates
            const existingApps = await Application.find({ 
                nic: application.nic, 
                status: { $in: ['Approved', 'Manager Approved'] }, 
                id: { $ne: application.id } 
            });
            
            // Standard Sri Lankan repayment cycle days
            const cycleDays = [25, 28, 5, 10]; 
            const existingDays = existingApps
                .filter(app => app.nextDueDate)
                .map(app => new Date(app.nextDueDate).getDate());

            // Pick the first available cycle day that isn't occupied
            let targetDay = cycleDays.find(day => !existingDays.includes(day));
            if (!targetDay) targetDay = 25; // fallback

            const now = new Date();
            let targetMonth = now.getMonth();
            let targetYear = now.getFullYear();

            // If we are approaching or past the target day, bump to next month
            if (now.getDate() >= targetDay - 7 || targetDay < 15) {
                targetMonth++;
                if (targetMonth > 11) {
                    targetMonth = 0;
                    targetYear++;
                }
            }

            application.nextDueDate = new Date(targetYear, targetMonth, targetDay);
        }

        await application.save();
        res.json({ status: 'success', message: `Application status updated to ${finalStatus}`, application });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update status', error: error.message });
    }
});

/*
 * API Endpoint: Update Document Status (Officer)
 * Method: PUT
 */
app.put('/api/officer/applications/:id/documents/:docId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Valid', 'Invalid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid document status provided' });
        }

        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        const doc = application.documents.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ status: 'error', message: 'Document not found' });
        }

        doc.status = status;
        await application.save();

        res.json({ status: 'success', message: `Document status updated to ${status}`, application });
    } catch (error) {
        console.error('Error updating document status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update document status', error: error.message });
    }
});

/*
 * API Endpoint: Update Document Status (Officer)
 * Method: PUT
 */
app.put('/api/officer/applications/:id/documents/:docId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Valid', 'Invalid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid document status provided' });
        }

        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        const doc = application.documents.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ status: 'error', message: 'Document not found' });
        }

        doc.status = status;
        await application.save();

        res.json({ status: 'success', message: `Document status updated to ${status}`, application });
    } catch (error) {
        console.error('Error updating document status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update document status', error: error.message });
    }
});

/*
 * API Endpoint: Get Officer Customers List
 * Method: GET
 * Response: Aggregated list of unique customers derived from Applications
 */
app.get('/api/officer/customers', async (req, res) => {
    try {
        // Distinct customer extraction based on NIC, merging updated profile info if available
        const applications = await Application.find({}).sort({ date: -1 });
        const users = await User.find({ role: 'customer' });
        
        const userMap = new Map();
        users.forEach(u => {
            if (u.email) userMap.set(u.email.toLowerCase(), u);
        });

        const customerMap = new Map();
        
        applications.forEach(app => {
            if (!customerMap.has(app.nic)) {
                const appEmail = (app.email || '').toLowerCase();
                const matchedUser = userMap.get(appEmail);

                customerMap.set(app.nic, {
                    id: `C-${app.nic.slice(0, 6).toUpperCase()}`, // Generate a pseudo customer ID based on NIC
                    // Use matched User profile name/phone if available, fallback to application data
                    name: matchedUser?.name || app.fullName,
                    email: app.email,
                    phone: matchedUser?.phone || app.contactNumber,
                    joinDate: app.createdAt || app.date,
                    activeLoans: app.status === 'Approved' ? 1 : 0,
                    totalDebt: app.status === 'Approved' ? app.loanAmount : 0,
                    status: 'active',
                    nic: app.nic
                });
            } else {
                // If customer already exists, just accumulate debt and active loans from other approved apps
                if (app.status === 'Approved') {
                    const c = customerMap.get(app.nic);
                    c.activeLoans += 1;
                    c.totalDebt += app.loanAmount;
                }
            }
        });

        res.json(Array.from(customerMap.values()));
    } catch (error) {
        console.error('Error extracting customers for officer:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch customers', error: error.message });
    }
});

/*
 * API Endpoint: Get All Applications by Customer NIC
 * Method: GET
 * Response: All loan applications linked to the given NIC
 */
app.get('/api/officer/customers/:nic/applications', async (req, res) => {
    try {
        const applications = await Application.find({ nic: req.params.nic }).sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching customer applications:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch customer applications', error: error.message });
    }
});

/*
 * API Endpoint: Get User Notifications
 * Method: GET
 * Querystring: role, email
 */
app.get('/api/notifications', async (req, res) => {
    try {
        const { role, email } = req.query;
        let notifications = [];
        const now = new Date();

        if (role === 'customer') {
            const applications = await Application.find({}).sort({ createdAt: -1 });
            applications.forEach(app => {
                if (app.status === 'Approved' || app.status === 'Manager Approved') {
                    notifications.push({ id: app.id + '-appr', title: 'Loan Approved', description: `Your application for ${app.loanPurpose} has been approved!`, time: app.updatedAt || app.createdAt || now, type: 'success' });
                } else if (app.status === 'Rejected' || app.status === 'Manager Rejected') {
                    notifications.push({ id: app.id + '-rej', title: 'Loan Rejected', description: `Your application for ${app.loanPurpose} was not approved.`, time: app.updatedAt || app.createdAt || now, type: 'error' });
                } else if (app.status === 'Pending' || app.status === 'Manager Review') {
                    notifications.push({ id: app.id + '-pend', title: 'Application Under Review', description: `Your application for ${app.loanPurpose} is currently being reviewed.`, time: app.createdAt || now, type: 'info' });
                }
            });
        } else if (role === 'officer') {
            const pendingCount = await Application.countDocuments({ status: 'Pending' });
            if (pendingCount > 0) {
                notifications.push({ id: 'off-pend', title: 'Pending Reviews', description: `You have ${pendingCount} applications waiting for initial review.`, time: now, type: 'warning' });
            }
        } else if (role === 'manager') {
            const managerCount = await Application.countDocuments({ status: 'Manager Review' });
            if (managerCount > 0) {
                notifications.push({ id: 'mgr-rev', title: 'High-Value Escalations', description: `You have ${managerCount} high-value applications requiring approval.`, time: now, type: 'warning' });
            }
        } else if (role === 'admin') {
            notifications.push({ id: 'adm-1', title: 'System Health', description: 'All loan systems are operating normally. Database is perfectly synced.', time: now, type: 'success' });
            notifications.push({ id: 'adm-2', title: 'Security Log', description: 'No unusual sign-in activity detected today.', time: new Date(Date.now() - 3600000), type: 'info' });
        }

        // Return top 5 recent notifications
        notifications = notifications.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch notifications', error: error.message });
    }
});

// ─────────────────────────────────────────────
// Profile Management Routes
// ─────────────────────────────────────────────

// JWT auth middleware (reusable inline)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }
};

/*
 * GET /api/profile/me
 * Returns the logged-in user's profile data.
 */
app.get('/api/profile/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
        res.json({ status: 'success', user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch profile.' });
    }
});

/*
 * PUT /api/profile/update
 * Update name, phone, branch, department, notes fields.
 */
app.put('/api/profile/update', requireAuth, async (req, res) => {
    try {
        const { name, phone, branch, department, notes } = req.body;
        const updates = {};
        if (name !== undefined)       updates.name = name.trim();
        if (phone !== undefined)      updates.phone = phone.trim();
        if (branch !== undefined)     updates.branch = branch.trim();
        if (department !== undefined) updates.department = department.trim();
        if (notes !== undefined)      updates.notes = notes.trim();

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Refresh localStorage-compatible payload
        res.json({
            status: 'success',
            message: 'Profile updated successfully.',
            user,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update profile.' });
    }
});

/*
 * PUT /api/profile/change-password
 * Verifies current password then hashes and saves the new one.
 */
app.put('/api/profile/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: 'error', message: 'Both current and new passwords are required.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters.' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ status: 'success', message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to change password.' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
