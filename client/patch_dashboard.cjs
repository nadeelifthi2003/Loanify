const fs = require('fs');
let data = fs.readFileSync('src/features/customer/pages/CustomerDashboard.tsx', 'utf8');

const target = `{selectedApplication && selectedApplication.eligibilityResult ? (
                    <div className="space-y-6">`;

const replacement = `{selectedApplication ? (
                    <div className="space-y-6">
                        {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                            <Card className="p-5">
                                <h4 className="text-base font-semibold mb-4">Uploaded Documents</h4>
                                <div className="space-y-3">
                                    {selectedApplication.documents.map((doc, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-slate-400" />
                                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{doc.fileName}</p>
                                            </div>
                                            <Badge variant={
                                                doc.status === 'Valid' ? 'success' :
                                                doc.status === 'Invalid' ? 'error' : 'warning'
                                            }>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                        {!selectedApplication.eligibilityResult ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    This application does not have a stored eligibility result yet.
                                </p>
                            </div>
                        ) : (
                                <><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900">`;

const target1 = `{selectedApplication && selectedApplication.eligibilityResult ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900">`;

let dataToReplace = data.includes(target1.replace(/\r\n/g, '\n')) ? target1.replace(/\r\n/g, '\n') : target1;
data = data.replace(dataToReplace, replacement);

const targetElse = `                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            This application does not have a stored eligibility result yet.
                        </p>
                        <p className="text-sm text-slate-500">
                            New applications submitted through the updated flow will save the eligibility analysis and open it here from Recent Applications.
                        </p>
                    </div>
                )}`;

const replacementElse = `                        </>
                        )}
                    </div>
                ) : null}`;

dataToReplace = data.includes(targetElse.replace(/\r\n/g, '\n')) ? targetElse.replace(/\r\n/g, '\n') : targetElse;
data = data.replace(dataToReplace, replacementElse);

fs.writeFileSync('src/features/customer/pages/CustomerDashboard.tsx', data);
console.log('Dashboard Patched');
