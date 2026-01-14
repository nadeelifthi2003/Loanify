import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';

export const SystemSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    System Settings
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Configure global application settings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">General Configuration</h3>
                    <Input label="Platform Name" defaultValue="Loanify" />
                    <Input label="Support Email" defaultValue="support@loanify.com" />
                    <Input label="Max Loan Amount ($)" type="number" defaultValue="500000" />
                    <Input label="Default Interest Rate (%)" type="number" defaultValue="5.5" step="0.1" />
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Security Settings</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Two-Factor Authentication</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Enforce 2FA for all admin users</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Session Timeout</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Auto-logout after inactivity</p>
                        </div>
                        <select className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded px-2 py-1 text-sm">
                            <option>15 mins</option>
                            <option>30 mins</option>
                            <option>1 hour</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Maintenance Mode</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Disable customer access</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-warning" />
                    </div>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
        </div>
    );
};
