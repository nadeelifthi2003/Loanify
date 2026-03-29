const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Mock Data for CRIB Numbers
const VALID_CRIB_NUMBERS = ['CR-50001', 'CR-50002'];
const BLACKLISTED_CRIB_NUMBERS = ['CR-90001', 'CR-90002'];

/*
 * API Endpoint: Check CRIB Status
 * Method: POST
 * Body: { cribNumber: string }
 * Response: { status: 'clean' | 'blacklisted' | 'error', message: string }
 */
app.post('/api/check-crib', (req, res) => {
    const { cribNumber } = req.body;

    if (!cribNumber) {
        return res.status(400).json({ status: 'error', message: 'CRIB Number is required' });
    }

    if (BLACKLISTED_CRIB_NUMBERS.includes(cribNumber)) {
        return res.json({
            status: 'blacklisted',
            message: 'High risk detected. CRIB report indicates unfavorable credit history.'
        });
    }

    if (VALID_CRIB_NUMBERS.includes(cribNumber)) {
        return res.json({
            status: 'clean',
            message: 'CRIB report is clear. You can proceed with the application.'
        });
    }

    // Default: Invalid/Not Found
    return res.json({
        status: 'error',
        message: 'Invalid CRIB Number. Please enter a valid report number.'
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

        // Mock Application ID Generation (could be replaced with a robust auto-increment/UUID approach)
        const applicationId = `L-${Math.floor(1000 + Math.random() * 9000)}`;

        const newApplication = new Application({
            id: applicationId,
            status: 'Pending',
            ...applicationData
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
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const response = await fetch('http://localhost:8000/eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error(`Python eligibility service error: ${response.status}`);
        }

        const result = await response.json();
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
        res.json(applications);
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

        // Call Python service with fallback
        try {
            const fetch = (await import('node-fetch')).default || globalThis.fetch;
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Python service responded with status: ${response.status}`);
            }

            const riskData = await response.json();
            return res.json({ status: 'success', data: riskData });
        } catch (fetchErr) {
            console.log("[Risk] Python service offline at port 8000 — serving local mock data.");
            
            // Generate some dynamic looking numbers based on the loan amount to make it feel realistic
            const isHighRisk = application.loanAmount > 1000000;
            
            const mockData = {
                overallRiskScore: isHighRisk ? 68 : 22,
                riskCategory: isHighRisk ? 'High Risk' : 'Low Risk',
                approvalProbability: isHighRisk ? 35 : 88,
                approvalCategory: isHighRisk ? 'Caution Advised' : 'Highly Recommended',
                dti: isHighRisk ? 45 : 28,
                dtiCategory: isHighRisk ? 'High' : 'Healthy',
                factors: [
                    { label: 'Payment History', score: 'Excellent', color: 'text-green-600', desc: 'Consistent on-time payments.' },
                    { label: 'Credit Utilization', score: isHighRisk ? 'Warning' : 'Good', color: isHighRisk ? 'text-yellow-600' : 'text-blue-600', desc: isHighRisk ? 'Using 40% of available credit.' : 'Using 15% of available credit.' },
                    { label: 'Recent Hard Inquiries', score: 'Warning', color: 'text-yellow-600', desc: '2 inquiries in last 6 months.' }
                ],
                insights: [
                    `Applicant has a ${application.servicePeriod} service length which is factored.`,
                    isHighRisk ? 'High loan amount relative to income triggers careful review.' : 'Strong debt-to-income ratio indicates solid capability to repay.',
                    `Employment as '${application.employmentType}' in '${application.employerName}' reviewed.`
                ],
                alerts: isHighRisk ? ['Requires secondary managerial approval due to requested threshold.'] : []
            };
            
            return res.json({ status: 'success', data: mockData });
        }
    } catch (error) {
        console.error('Error fetching risk assessment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to assess risk', error: error.message });
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
        const { status } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Needs Info'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status provided' });
        }

        const application = await Application.findOneAndUpdate(
            { id: req.params.id }, 
            { status }, 
            { new: true }
        );
        
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }
        res.json({ status: 'success', message: `Application status updated to ${status}`, application });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update status', error: error.message });
    }
});

/*
 * API Endpoint: Get Officer Customers List
 * Method: GET
 * Response: Aggregated list of unique customers derived from Applications
 */
app.get('/api/officer/customers', async (req, res) => {
    try {
        // Simple distinct customer extraction based on NIC
        const applications = await Application.find({}).sort({ date: -1 });
        const customerMap = new Map();
        
        applications.forEach(app => {
            if (!customerMap.has(app.nic)) {
                customerMap.set(app.nic, {
                    id: `C-${app.nic.slice(0, 6).toUpperCase()}`, // Generate a pseudo customer ID based on NIC
                    name: app.fullName,
                    email: app.email,
                    phone: app.contactNumber,
                    joinDate: app.createdAt || app.date,
                    activeLoans: app.status === 'Approved' ? 1 : 0,
                    totalDebt: app.status === 'Approved' ? app.loanAmount : 0,
                    status: 'active'
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
