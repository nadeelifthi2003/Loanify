const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Needs Info'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: { type: String, required: true },
    fullName: { type: String, required: true },
    nic: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    dependents: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    residentialStatus: { type: String, required: true },
    employmentType: { type: String, required: true },
    employerName: { type: String, required: true },
    designation: { type: String, required: true },
    servicePeriod: { type: String, required: true },
    grossMonthlyIncome: { type: Number, required: true },
    netMonthlyIncome: { type: Number, required: true },
    existingLoanCommitments: { type: Number, required: false },
    loanType: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    loanPurpose: { type: String, required: true },
    tenure: { type: Number, required: true },
    guarantorName: { type: String, required: false },
    guarantorNIC: { type: String, required: false },
    guarantorContact: { type: String, required: false },
    paidAmount: { type: Number, default: 0 },
    paymentHistory: [{
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true }
    }],
    nextDueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
