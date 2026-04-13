const fs = require('fs');
let data = fs.readFileSync('index.js', 'utf8');

const replacement = `/*
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

        res.json({ status: 'success', message: \`Document status updated to \${status}\`, application });
    } catch (error) {
        console.error('Error updating document status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update document status', error: error.message });
    }
});

/*
 * API Endpoint: Get Officer Customers List`;

data = data.replace('/*\r\n * API Endpoint: Get Officer Customers List', replacement);
data = data.replace('/*\n * API Endpoint: Get Officer Customers List', replacement);

fs.writeFileSync('index.js', data);
console.log('Patched');
