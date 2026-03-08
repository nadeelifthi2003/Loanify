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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
