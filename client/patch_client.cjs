const fs = require('fs');
let data = fs.readFileSync('src/features/customer/pages/LoanApplication.tsx', 'utf8');

const target1 = `    const submitApplication = async () => {\r
        setIsSubmitting(true);\r
        try {\r
            // 1. Submit application to MongoDB (existing flow)\r
            const appResponse = await fetch('http://localhost:5000/api/applications', {\r
                method: 'POST',\r
                headers: { 'Content-Type': 'application/json' },\r
                body: JSON.stringify(formData)\r
            });`;

const target2 = `    const submitApplication = async () => {
        setIsSubmitting(true);
        try {
            // 1. Submit application to MongoDB (existing flow)
            const appResponse = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });`;

const replacement = `    const submitApplication = async () => {
        setIsSubmitting(true);
        try {
            // Convert documents to Base64
            const fileToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve({
                        fileName: file.name,
                        fileType: file.type,
                        data: reader.result
                    });
                    reader.onerror = error => reject(error);
                });
            };

            const allDocs = [...documents.proofOfIncome, ...documents.idProof];
            const base64Docs = await Promise.all(allDocs.map(file => fileToBase64(file)));

            const applicationPayload = {
                ...formData,
                documents: base64Docs
            };

            // 1. Submit application to MongoDB (existing flow)
            const appResponse = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationPayload)
            });`;

if (data.includes(target1)) data = data.replace(target1, replacement);
else if (data.includes(target2)) data = data.replace(target2, replacement);
else console.log('Target not found!');

fs.writeFileSync('src/features/customer/pages/LoanApplication.tsx', data);
console.log('Client patched');
