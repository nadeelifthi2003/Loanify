const mongoose = require('mongoose');
require('dotenv').config();
const Application = require('./models/Application');

const baseData = {
  title: "Mr",
  dob: "1990-01-01",
  gender: "Male",
  maritalStatus: "Single",
  dependents: 0,
  residentialStatus: "Rented",
  designation: "Executive"
};

const seedData = [
  {
    ...baseData,
    id: "L-1001",
    fullName: "John Doe",
    nic: "198512345678",
    email: "john.doe@example.com",
    contactNumber: "+94771234567",
    address: "123 Main St, Colombo",
    employmentType: "Full-Time",
    employerName: "Tech Corp",
    grossMonthlyIncome: 150000,
    netMonthlyIncome: 120000,
    existingLoanCommitments: 0,
    servicePeriod: "5 years",
    loanType: "Personal Loan",
    loanAmount: 500000,
    tenure: 36,
    loanPurpose: "Home Renovation",
    status: "Pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    ...baseData,
    id: "L-1002",
    title: "Ms",
    gender: "Female",
    fullName: "Jane Smith",
    nic: "199012345678",
    email: "jane.smith@example.com",
    contactNumber: "+94777654321",
    address: "456 Oak Rd, Kandy",
    employmentType: "Self-Employed",
    employerName: "Jane's Boutique",
    designation: "Owner",
    grossMonthlyIncome: 350000,
    netMonthlyIncome: 280000,
    existingLoanCommitments: 50000,
    servicePeriod: "3 years",
    loanType: "Business Loan",
    loanAmount: 250000,
    tenure: 60,
    loanPurpose: "Business Expansion",
    status: "Pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    ...baseData,
    id: "L-1003",
    fullName: "Michael Silva",
    nic: "198212345678",
    email: "michael.silva@example.com",
    contactNumber: "+94711122334",
    address: "789 Pine Ave, Galle",
    maritalStatus: "Married",
    dependents: 2,
    employmentType: "Contract",
    employerName: "BuildIt Construction",
    grossMonthlyIncome: 100000,
    netMonthlyIncome: 90000,
    existingLoanCommitments: 10000,
    servicePeriod: "1 year",
    loanType: "Vehicle Loan",
    loanAmount: 1500000,
    tenure: 48,
    loanPurpose: "Buy a used car",
    status: "Approved",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    ...baseData,
    id: "L-1004",
    title: "Mrs",
    gender: "Female",
    fullName: "Ayesha Perera",
    nic: "199512345678",
    email: "ayesha.perera@example.com",
    contactNumber: "+94765432109",
    address: "321 Lotus Ln, Negombo",
    employmentType: "Full-Time",
    employerName: "EduInstitute",
    designation: "Teacher",
    grossMonthlyIncome: 80000,
    netMonthlyIncome: 70000,
    existingLoanCommitments: 0,
    servicePeriod: "2 years",
    loanType: "Education Loan",
    loanAmount: 30000,
    tenure: 24,
    loanPurpose: "Masters Degree Tuition",
    status: "Needs Info",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    ...baseData,
    id: "L-1005",
    fullName: "Kamal Fernando",
    nic: "197812345678",
    email: "kamal.fernando@example.com",
    contactNumber: "+94755555555",
    address: "99 Beach Rd, Mount Lavinia",
    maritalStatus: "Married",
    dependents: 4,
    residentialStatus: "Owned",
    employmentType: "Full-Time",
    employerName: "Oceanic Shipping",
    designation: "Manager",
    grossMonthlyIncome: 250000,
    netMonthlyIncome: 200000,
    existingLoanCommitments: 100000,
    servicePeriod: "10 years",
    loanType: "Housing Loan",
    loanAmount: 5000000,
    tenure: 120,
    loanPurpose: "Buy a new house",
    status: "Rejected",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  }
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB. Clearing out old applications...');
    await Application.deleteMany({});
    console.log('Inserting mock loan applications...');
    await Application.insertMany(seedData);
    console.log('Successfully seeded database!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding DB:', err);
    process.exit(1);
  });
