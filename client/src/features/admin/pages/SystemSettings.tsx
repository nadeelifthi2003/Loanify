import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Settings, Shield, Bell, Sun, Moon,
    Users, Save, AlertTriangle, CheckCircle,
    Eye, EyeOff, Lock, Sliders,
} from 'lucide-react';

const API = 'http://localhost:5000';
const getToken = () => localStorage.getItem('loanify_token') || '';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

const TABS = [
    { id: 'general',       label: 'General',        icon: Settings  },
    { id: 'security',      label: 'Security',        icon: Shield    },
    { id: 'notifications', label: 'Notifications',   icon: Bell      },
    { id: 'appearance',    label: 'Appearance',      icon: Sun       },
    { id: 'profile',       label: 'Admin Profile',   icon: Users     },
];

const ToggleSwitch = ({
    checked,
    onChange,
}: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
    </label>
);

export const SystemSettings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    // ── General config ──────────────────────────────────────────────
    const [general, setGeneral] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_general');
            return saved ? JSON.parse(saved) : {
                platformName: 'Loanify',
                supportEmail: 'support@loanify.com',
                maxLoanAmount: '5000000',
                defaultInterestRate: '13.5',
                maxTenureMonths: '240',
            };
        } catch {
            return {
                platformName: 'Loanify',
                supportEmail: 'support@loanify.com',
                maxLoanAmount: '5000000',
                defaultInterestRate: '13.5',
                maxTenureMonths: '240',
            };
        }
    });

    // ── Security config ──────────────────────────────────────────────
    const [security, setSecurity] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_security');
            return saved ? JSON.parse(saved) : {
                enforce2FA: true,
                maintenanceMode: false,
                sessionTimeout: '30m',
                allowGoogleLogin: true,
                auditLog: true,
            };
        } catch {
            return {
                enforce2FA: true,
                maintenanceMode: false,
                sessionTimeout: '30m',
                allowGoogleLogin: true,
                auditLog: true,
            };
        }
    });

    // ── Notifications ─────────────────────────────────────────────────
    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_notifications');
            return saved ? JSON.parse(saved) : {
                newUserRegistration: true,
                highRiskApplications: true,
                systemErrors: true,
                dailyReports: false,
            };
        } catch {
            return {
                newUserRegistration: true,
                highRiskApplications: true,
                systemErrors: true,
                dailyReports: false,
            };
        }
    });

    // ── Admin profile ─────────────────────────────────────────────────
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API}/api/profile/me`, { headers: authHeaders() });
                const data = await res.json();
                if (data.status === 'success') {
                    setProfile({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                    });
                }
            } catch {
                // fall back to auth context
            }
        };
        fetchProfile();
    }, []);

    // ── Save handlers ────────────────────────────────────────────────
    const saveGeneral = () => {
        if (!general.platformName.trim()) { showToast('Platform name cannot be empty.', 'error'); return; }
        if (!general.supportEmail.includes('@')) { showToast('Enter a valid support email.', 'error'); return; }
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem('admin_general', JSON.stringify(general));
            showToast('General settings saved successfully!', 'success');
            setSaving(false);
        }, 600);
    };

    const saveSecurity = () => {
        localStorage.setItem('admin_security', JSON.stringify(security));
        showToast('Security settings updated!', 'success');
    };

    const saveNotifications = () => {
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        showToast('Notification preferences saved!', 'success');
    };

    const saveProfile = async () => {
        if (!profile.name.trim()) { showToast('Name cannot be empty.', 'error'); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/profile/update`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ name: profile.name, phone: profile.phone }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                const saved = localStorage.getItem('loanify_user');
                if (saved) {
                    const u = JSON.parse(saved);
                    u.name = data.user.name;
                    localStorage.setItem('loanify_user', JSON.stringify(u));
                }
                showToast('Admin profile updated!', 'success');
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            showToast('Fill in all password fields.', 'error'); return;
        }
        if (passwords.newPassword.length < 8) {
            showToast('New password must be at least 8 characters.', 'error'); return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('Passwords do not match.', 'error'); return;
        }
        setChangingPw(true);
        try {
            const res = await fetch(`${API}/api/profile/change-password`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast('Password changed successfully!', 'success');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.message || 'Failed to change password.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setChangingPw(false);
        }
    };

    const toggleSecurity = (key: keyof typeof security) => {
        setSecurity((p: typeof security) => ({ ...p, [key]: !p[key] }));
    };

    const toggleNotif = (key: keyof typeof notifications) =>
        setNotifications((p: typeof notifications) => ({ ...p, [key]: !p[key] }));

    const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                    <Sliders className="w-6 h-6 text-primary" /> System Settings
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Configure platform-wide settings and manage your admin account.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="p-3 h-fit lg:col-span-1">
                    <nav className="space-y-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === id
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </Card>

                <div className="lg:col-span-3 space-y-6">

                    {/* ── GENERAL ── */}
                    {activeTab === 'general' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4">
                                General Configuration
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Platform Name"
                                    value={general.platformName}
                                    onChange={(e) => setGeneral((p: typeof general) => ({ ...p, platformName: e.target.value }))}
                                />
                                <Input
                                    label="Support Email"
                                    type="email"
                                    value={general.supportEmail}
                                    onChange={(e) => setGeneral((p: typeof general) => ({ ...p, supportEmail: e.target.value }))}
                                />
                                <Input
                                    label="Maximum Loan Amount (LKR)"
                                    type="number"
                                    value={general.maxLoanAmount}
                                    onChange={(e) => setGeneral((p: typeof general) => ({ ...p, maxLoanAmount: e.target.value }))}
                                />
                                <Input
                                    label="Default Interest Rate (%)"
                                    type="number"
                                    step="0.1"
                                    value={general.defaultInterestRate}
                                    onChange={(e) => setGeneral((p: typeof general) => ({ ...p, defaultInterestRate: e.target.value }))}
                                />
                                <Input
                                    label="Maximum Tenure (Months)"
                                    type="number"
                                    value={general.maxTenureMonths}
                                    onChange={(e) => setGeneral((p: typeof general) => ({ ...p, maxTenureMonths: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={saveGeneral} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                                    Save Configuration
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── SECURITY ── */}
                    {activeTab === 'security' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4">
                                Security Settings
                            </h2>

                            <div className="space-y-3">
                                {[
                                    { id: 'enforce2FA',       title: 'Enforce 2FA for All Staff',    desc: 'Require two-factor authentication for all officer and admin accounts.', danger: false },
                                    { id: 'allowGoogleLogin', title: 'Allow Google OAuth Login',     desc: 'Let users sign in with their Google account.', danger: false },
                                    { id: 'auditLog',         title: 'Audit Logging',                desc: 'Record all user actions and system events for compliance.', danger: false },
                                    { id: 'maintenanceMode',  title: 'Maintenance Mode',             desc: 'Disables customer-facing access during scheduled maintenance.', danger: true },
                                ].map((item) => (
                                    <div key={item.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                                        item.danger
                                            ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}>
                                        <div>
                                            <p className={`font-medium text-sm flex items-center gap-2 ${item.danger ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-white'}`}>
                                                {item.danger && <AlertTriangle className="w-4 h-4" />}
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={security[item.id as keyof typeof security] as boolean}
                                            onChange={() => toggleSecurity(item.id as keyof typeof security)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Session Timeout */}
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-white">Auto-logout Timeout</p>
                                    <p className="text-xs text-gray-500 mt-0.5">How long before idle sessions are automatically logged out.</p>
                                </div>
                                <select
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity((p: typeof security) => ({ ...p, sessionTimeout: e.target.value }))}
                                    className="bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="15m">15 minutes</option>
                                    <option value="30m">30 minutes</option>
                                    <option value="1h">1 hour</option>
                                    <option value="4h">4 hours</option>
                                </select>
                            </div>

                            {security.maintenanceMode && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                        Maintenance mode is <strong>ON</strong>. Customers cannot access the platform.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button onClick={saveSecurity} leftIcon={<Shield className="w-4 h-4" />}>
                                    Save Security Settings
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'notifications' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4">
                                Admin Notification Preferences
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'newUserRegistration',   title: 'New User Registrations',    desc: 'Alert when a new customer or officer registers.' },
                                    { id: 'highRiskApplications',  title: 'High-Risk Applications',    desc: 'Immediate alert when a high-risk loan is flagged.' },
                                    { id: 'systemErrors',          title: 'System Error Alerts',       desc: 'Get notified about backend service failures.' },
                                    { id: 'dailyReports',          title: 'Daily Summary Email',       desc: 'Receive a daily platform health and activity report.' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={notifications[item.id as keyof typeof notifications]}
                                            onChange={() => toggleNotif(item.id as keyof typeof notifications)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={saveNotifications} leftIcon={<Save className="w-4 h-4" />}>
                                    Save Preferences
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeTab === 'appearance' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4">
                                Appearance
                            </h2>
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Admin Interface Theme</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Currently using <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong> mode.
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={toggleTheme}>
                                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                                </Button>
                            </div>
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <p className="font-medium text-gray-800 dark:text-white text-sm mb-1">Platform Branding</p>
                                <p className="text-xs text-gray-500">Theme colour and logo customisation is managed by the design team. Contact <strong>devops@loanify.com</strong> for branding changes.</p>
                                <Badge variant="info" size="sm" className="mt-2">Managed Centrally</Badge>
                            </div>
                        </Card>
                    )}

                    {/* ── ADMIN PROFILE ── */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <Card className="p-6 space-y-6">
                                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4">
                                    Admin Profile
                                </h2>
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                                        {initials || <Users className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{profile.name}</p>
                                        <p className="text-sm text-gray-500">{profile.email}</p>
                                        <Badge variant="error" size="sm" className="mt-2">Administrator</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Full Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={profile.email}
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={profile.phone}
                                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                                        placeholder="+94 77 000 0000"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button onClick={saveProfile} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                                        Save Profile
                                    </Button>
                                </div>
                            </Card>

                            {/* Change Password */}
                            <Card className="p-6 space-y-5">
                                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5" /> Change Password
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {(['current', 'new', 'confirm'] as const).map((field) => (
                                        <div key={field} className="relative">
                                            <Input
                                                label={
                                                    field === 'current' ? 'Current Password'
                                                    : field === 'new' ? 'New Password'
                                                    : 'Confirm Password'
                                                }
                                                type={showPw[field] ? 'text' : 'password'}
                                                value={passwords[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                                                onChange={(e) =>
                                                    setPasswords((p) => ({
                                                        ...p,
                                                        [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                                    <p className="text-xs text-red-500">Passwords do not match.</p>
                                )}
                                <div className="flex justify-end">
                                    <Button onClick={changePassword} isLoading={changingPw} leftIcon={<CheckCircle className="w-4 h-4" />}>
                                        Update Password
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
