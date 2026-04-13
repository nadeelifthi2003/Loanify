const fs = require('fs');

// --- 1. CustomerDashboard.tsx ---
let dashData = fs.readFileSync('src/features/customer/pages/CustomerDashboard.tsx', 'utf8');

dashData = dashData.replace('<XCircle className="w-4 h-4" /> INVALID', '<XCircle className="w-4 h-4" /> Invalid by System');
dashData = dashData.replace('<CheckCircle className="w-4 h-4" /> VALID', '<CheckCircle className="w-4 h-4" /> Valid by System');

fs.writeFileSync('src/features/customer/pages/CustomerDashboard.tsx', dashData);

// --- 2. ApplicationVerification.tsx ---
let verData = fs.readFileSync('src/features/officer/pages/ApplicationVerification.tsx', 'utf8');

verData = verData.replace('<XCircle className="w-4 h-4" /> INVALID BY ML MODULE', '<XCircle className="w-4 h-4" /> Invalid by System');
verData = verData.replace('<CheckCircle className="w-4 h-4"/> VALID BY ML MODULE', '<CheckCircle className="w-4 h-4"/> Valid by System');

fs.writeFileSync('src/features/officer/pages/ApplicationVerification.tsx', verData);

console.log("Text Patched");
