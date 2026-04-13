const fs = require('fs');

// --- 1. CustomerDashboard.tsx ---
let dashData = fs.readFileSync('src/features/customer/pages/CustomerDashboard.tsx', 'utf8');

dashboardImportStr = `import { DollarSign, CreditCard, Calendar, ArrowUpRight, TrendingUp, FileText } from 'lucide-react';`;
dashboardImportRep = `import { DollarSign, CreditCard, Calendar, ArrowUpRight, TrendingUp, FileText, CheckCircle, XCircle } from 'lucide-react';`;
if (dashData.includes(dashboardImportStr)) {
    dashData = dashData.replace(dashboardImportStr, dashboardImportRep);
}

const dashTarget = `                                            <Badge variant={
                                                doc.status === 'Valid' ? 'success' :
                                                doc.status === 'Invalid' ? 'error' : 'warning'
                                            }>
                                                {doc.status}
                                            </Badge>`;

const dashRep = `                                            {doc.status === 'Invalid' ? (
                                                <Badge variant="error" className="bg-red-500 text-white font-bold px-3 py-1 flex items-center gap-1 shadow-sm ring-2 ring-red-500 ring-offset-1">
                                                    <XCircle className="w-4 h-4" /> INVALID
                                                </Badge>
                                            ) : doc.status === 'Valid' ? (
                                                <Badge variant="success" className="bg-green-100 text-green-700 font-bold px-3 py-1 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> VALID
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning">{doc.status}</Badge>
                                            )}`;

// Handle CRLF or LF securely
let dTarget = dashData.includes(dashTarget.replace(/\\r\\n/g, '\\n')) ? dashTarget.replace(/\\r\\n/g, '\\n') : dashTarget;
dashData = dashData.replace(dTarget, dashRep);

fs.writeFileSync('src/features/customer/pages/CustomerDashboard.tsx', dashData);


// --- 2. ApplicationVerification.tsx ---
let verData = fs.readFileSync('src/features/officer/pages/ApplicationVerification.tsx', 'utf8');

const verTarget = `                                            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-semibold \${doc.status === 'Valid' ? 'bg-green-100 text-green-700' : doc.status === 'Invalid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}\`}>{doc.status}</span>
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
                                    </div>`;

const verRep = `                                            {doc.status === 'Invalid' ? (
                                                <span className="px-3 py-1 flex items-center gap-1 rounded bg-red-500 text-white text-xs font-bold shadow-sm ring-2 ring-red-500 ring-offset-1"><XCircle className="w-4 h-4" /> INVALID BY ML MODULE</span>
                                            ) : doc.status === 'Valid' ? (
                                                <span className="px-3 py-1 flex items-center gap-1 rounded bg-green-100 text-green-700 text-xs font-bold"><CheckCircle className="w-4 h-4"/> VALID BY ML MODULE</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">{doc.status}</span>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => handleDownload(doc)}>
                                            Download
                                        </Button>
                                    </div>`;

let vTarget = verData.includes(verTarget.replace(/\\r\\n/g, '\\n')) ? verTarget.replace(/\\r\\n/g, '\\n') : verTarget;
verData = verData.replace(vTarget, verRep);

fs.writeFileSync('src/features/officer/pages/ApplicationVerification.tsx', verData);

console.log("UI Patched");
