const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Mock Database
const applications = [];

/*
 * API Endpoint: Submit Loan Application
 * Method: POST
 * Body: { ...applicationData }
 * Response: { status: 'success', applicationId: string, message: string }
 */
app.post('/api/applications', (req, res) => {
    const applicationData = req.body;

    // Log Received Data
    console.log('Received Loan Application:', applicationData);

    // Simple Validation
    if (!applicationData.nic || !applicationData.loanAmount) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Mock Application ID Generation
    const applicationId = `L-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApplication = {
        id: applicationId,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        ...applicationData
    };

    applications.push(newApplication);

    res.json({
        status: 'success',
        applicationId: applicationId,
        message: 'Application submitted successfully!'
    });
});

/*
 * API Endpoint: Get Customer's Applications
 * Method: GET
 * Response: Array of applications
 */
app.get('/api/applications/my-applications', (req, res) => {
    // In a real app, filtering by user ID would happen here
    // For now, return all (mocking a single user session)
    res.json(applications);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
