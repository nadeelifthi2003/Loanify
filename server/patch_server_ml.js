const fs = require('fs');
let data = fs.readFileSync('index.js', 'utf8');

const targetStr = `        const newApplication = new Application({
            id: applicationId,
            fullName: \`\${applicationData.firstName} \${applicationData.lastName}\`,`;

const replacement = `        // Evaluate documents via ML Risk Service
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
                doc.status = 'Pending';
            }
            validatedDocs.push(doc);
        }

        const newApplication = new Application({
            id: applicationId,
            fullName: \`\${applicationData.firstName} \${applicationData.lastName}\`,`;

data = data.replace(targetStr, replacement);
data = data.replace(targetStr.replace(/\r\n/g, '\n'), replacement);

const targetDocs = `            tenure: parseInt(applicationData.loanTerm) || 12,
            documents: applicationData.documents || [],
            createdAt: new Date()`;

const replacementDocs = `            tenure: parseInt(applicationData.loanTerm) || 12,
            documents: validatedDocs,
            createdAt: new Date()`;

data = data.replace(targetDocs, replacementDocs);
data = data.replace(targetDocs.replace(/\r\n/g, '\n'), replacementDocs);

fs.writeFileSync('index.js', data);
console.log("Server Patched");
