const data = [
  {
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
    loanAmount: 500000, // < 1m
    tenure: 36,
    loanPurpose: "Home Renovation",
  },
  {
    fullName: "Jane Smith",
    nic: "199012345678",
    email: "jane.smith@example.com",
    contactNumber: "+94777654321",
    address: "456 Oak Rd, Kandy",
    employmentType: "Self-Employed",
    employerName: "Jane's Boutique",
    grossMonthlyIncome: 350000,
    netMonthlyIncome: 280000,
    existingLoanCommitments: 50000,
    servicePeriod: "3 years",
    loanType: "Business Loan",
    loanAmount: 250000, // > 100k
    tenure: 60,
    loanPurpose: "Business Expansion",
  },
  {
    fullName: "Michael Silva",
    nic: "198212345678",
    email: "michael.silva@example.com",
    contactNumber: "+94711122334",
    address: "789 Pine Ave, Galle",
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
  },
  {
    fullName: "Ayesha Perera",
    nic: "199512345678",
    email: "ayesha.perera@example.com",
    contactNumber: "+94765432109",
    address: "321 Lotus Ln, Negombo",
    employmentType: "Full-Time",
    employerName: "EduInstitute",
    grossMonthlyIncome: 80000,
    netMonthlyIncome: 70000,
    existingLoanCommitments: 0,
    servicePeriod: "2 years",
    loanType: "Education Loan",
    loanAmount: 30000,
    tenure: 24,
    loanPurpose: "Masters Degree Tuition",
  },
  {
    fullName: "Kamal Fernando",
    nic: "197812345678",
    email: "kamal.fernando@example.com",
    contactNumber: "+94755555555",
    address: "99 Beach Rd, Mount Lavinia",
    employmentType: "Full-Time",
    employerName: "Oceanic Shipping",
    grossMonthlyIncome: 250000,
    netMonthlyIncome: 200000,
    existingLoanCommitments: 100000,
    servicePeriod: "10 years",
    loanType: "Housing Loan",
    loanAmount: 5000000,
    tenure: 120,
    loanPurpose: "Buy a new house",
  }
];

async function seed() {
    console.log('Starting DB seeding via POST API endpoint...');
    for (const applicant of data) {
        try {
            const res = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicant)
            });
            const json = await res.json();
            console.log(`Created: ${applicant.fullName} -> Status:`, json.status);
        } catch (e) {
            console.error('Error posting', applicant.fullName, e);
        }
    }
    console.log('Seeding finished!');
}

seed();
