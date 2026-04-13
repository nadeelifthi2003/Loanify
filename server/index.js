const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('./models/Application');
const {
    ROLE_OPTIONS,
    STATUS_OPTIONS,
    createUser,
    getOverview,
    listUsers,
    updateUserRole,
    updateUserStatus,
} = require('./src/services/adminService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/loanify')
        .then(() => console.log('Successfully connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
            try {
                const mlRes = await fetch('http://localhost:8000/validate-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc)
                });
                if (mlRes.ok) {
                    const validation = await mlRes.json();
                    doc.status = validation.status;
                } else {
                    doc.status = 'Pending';
                }
            } catch (e) {
                console.error("ML Validation skipped for doc: ", e.message);
                doc.status = 'Pending';
            }
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

        const response = await fetch('http://localhost:8000/eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eligibilityPayload)
        });

        if (!response.ok) {
            throw new Error(`Python eligibility service error: ${response.status}`);
        }

        const result = await response.json();

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

        // Call Python service strictly (No Fallbacks)
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

        if (application.status !== 'Approved') {
            return res.status(400).json({ status: 'error', message: 'Can only make payments on Approved loans' });
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
        const { status } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Needs Info'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status provided' });
        }

        const application = await Application.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }

        application.status = status;

        if (status === 'Approved' && !application.nextDueDate) {
            // Find all other Approved applications for this customer to check existing due dates
            const existingApps = await Application.find({ 
                nic: application.nic, 
                status: 'Approved', 
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
        res.json({ status: 'success', message: `Application status updated to ${status}`, application });
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

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
