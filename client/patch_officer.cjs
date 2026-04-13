const fs = require('fs');
let data = fs.readFileSync('src/features/officer/pages/ApplicationVerification.tsx', 'utf8');

const replacementFunctions = `    const handleDocumentStatusUpdate = async (docId: string, status: string) => {
        try {
            const res = await fetch(\`http://localhost:5000/api/officer/applications/\${id}/documents/\${docId}/status\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const d = await res.json();
            if (res.ok) {
                showToast(\`Document successfully updated to \${status}\`, 'success');
                setApp(d.application);
            } else {
                showToast(d.message || 'Failed to update document status', 'error');
            }
        } catch (error) {
            console.error('Document status update failed:', error);
            showToast('Network error while updating document status', 'error');
        }
    };

    const handleDownload = (doc: any) => {
        try {
            const dataParts = doc.data.split(',');
            const base64Data = dataParts.length > 1 ? dataParts[1] : dataParts[0];
            const binaryData = atob(base64Data);
            const arrayBuffer = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                arrayBuffer[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: doc.fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(\`Successfully downloaded: \${doc.fileName}\`, 'success');
        } catch (e) {
            showToast('Failed to download document', 'error');
        }
    };`;

const targetFn1 = `    const handleDownload = (docName: string) => {
        const textContext = \`This is a securely retrieved file from Loanify systems for: \${docName}\\nApplicant: \${app.fullName}\\n\\n[FILE CONTENTS BLOCKED BY DEMO MODE]\`;
        const blob = new Blob([textContext], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = docName.replace('.pdf', '') + '_secure.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(\`Successfully downloaded: \${docName}\`, 'success');
    };`;

let dataToReplace = data.includes(targetFn1.replace(/\r\n/g, '\n')) ? targetFn1.replace(/\r\n/g, '\n') : targetFn1;
data = data.replace(dataToReplace, replacementFunctions);


const targetRender1 = `                    {/* Uploaded Documents */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Uploaded Documents</h2>
                        <div className="space-y-3">
                            {['Bank Statement - Last 6 Months.pdf', 'Employment Letter.pdf', 'Identity Proof.pdf', 'Address Proof.pdf'].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                                    </div>
                                    <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(doc)}>
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>`;

const replacementRender = `                    {/* Uploaded Documents */}
                    <Card className="p-6">
                        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6">Uploaded Documents</h2>
                        <div className="space-y-3">
                            {app.documents && app.documents.length > 0 ? app.documents.map((doc: any) => (
                                <div key={doc._id} className="flex flex-col gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={doc.fileName}>{doc.fileName}</span>
                                            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-semibold \${doc.status === 'Valid' ? 'bg-green-100 text-green-700' : doc.status === 'Invalid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}\`}>{doc.status}</span>
                                        </div>
                                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(doc)}>
                                            Download
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                                        <Button size="sm" variant={doc.status === 'Valid' ? 'primary' : 'outline'} onClick={() => handleDocumentStatusUpdate(doc._id, 'Valid')} disabled={doc.status === 'Valid'} className="h-7 text-xs py-0 px-2 bg-green-500 hover:bg-green-600 border-none text-white">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Mark Valid
                                        </Button>
                                        <Button size="sm" variant={doc.status === 'Invalid' ? 'primary' : 'outline'} onClick={() => handleDocumentStatusUpdate(doc._id, 'Invalid')} disabled={doc.status === 'Invalid'} className="h-7 text-xs py-0 px-2 bg-red-500 hover:bg-red-600 border-none text-white">
                                            <XCircle className="w-3 h-3 mr-1" /> Mark Invalid
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">No documents uploaded.</p>
                            )}
                        </div>
                    </Card>`;

dataToReplace = data.includes(targetRender1.replace(/\r\n/g, '\n')) ? targetRender1.replace(/\r\n/g, '\n') : targetRender1;
data = data.replace(dataToReplace, replacementRender);

fs.writeFileSync('src/features/officer/pages/ApplicationVerification.tsx', data);
console.log('Officer patched');
