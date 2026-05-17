import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    ArrowLeft, User, Bell, Lock, Moon, Sun,
    Shield, Save, Eye, EyeOff, CheckCircle,
} from 'lucide-react';

const API = 'http://localhost:5000';
const getToken = () => localStorage.getItem('loanify_token') || '';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

const TABS = [
    { id: 'profile',       label: 'Profile',        icon: User   },
    { id: 'notifications', label: 'Notifications',   icon: Bell   },
    { id: 'security',      label: 'Security',        icon: Shield },
    { id: 'appearance',    label: 'Appearance',      icon: Sun    },
];

export const OfficerSettings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        branch: '',
        department: '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('officer_notifications');
        return saved ? JSON.parse(saved) : {
            newApplication: true,
            riskAlerts: true,
            dailySummary: false,
            emailDigests: true,
        };
    });

    const [security, setSecurity] = useState(() => {
        const saved = localStorage.getItem('officer_security');
        return saved ? JSON.parse(saved) : { twoFactor: true, sessionTimeout: '30m' };
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
                        branch: data.user.branch || '',
                        department: data.user.department || '',
                    });
                }
            } catch {
                // fall back to auth context values
            }
        };
        fetchProfile();
    }, []);

    const initials = profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const saveProfile = async () => {
        if (!profile.name.trim()) { showToast('Name cannot be empty.', 'error'); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/profile/update`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    branch: profile.branch,
                    department: profile.department,
                }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                const saved = localStorage.getItem('loanify_user');
                if (saved) {
                    const u = JSON.parse(saved);
                    u.name = data.user.name;
                    localStorage.setItem('loanify_user', JSON.stringify(u));
                }
                showToast('Profile saved successfully!', 'success');
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
            showToast('Please fill in all password fields.', 'error'); return;
        }
        if (passwords.newPassword.length < 8) {
            showToast('New password must be at least 8 characters.', 'error'); return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('New passwords do not match.', 'error'); return;
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

    const saveNotifications = () => {
        localStorage.setItem('officer_notifications', JSON.stringify(notifications));
        showToast('Notification preferences saved!', 'success');
    };

    const toggleNotif = (key: keyof typeof notifications) =>
        setNotifications((p: typeof notifications) => ({ ...p, [key]: !p[key] }));

    const toggleTwoFactor = () => {
        const next = { ...security, twoFactor: !security.twoFactor };
        setSecurity(next);
        localStorage.setItem('officer_security', JSON.stringify(next));
        showToast(next.twoFactor ? '2FA enabled' : '2FA disabled', 'info');
    };

    const saveSessionTimeout = () => {
        localStorage.setItem('officer_security', JSON.stringify(security));
        showToast('Session timeout updated!', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto text-light-text-primary dark:text-dark-text-primary">
            <div>
                <Button
                    variant="ghost"
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Officer Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your profile, preferences, and security.</p>
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

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Personal Information
                            </h2>
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                                    {initials || <User className="w-8 h-8" />}
                                </div>
                                <div>
                                    <Button variant="outline" size="sm" onClick={() => showToast('Avatar upload coming soon.', 'info')}>
                                        Change Avatar
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 800 KB.</p>
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
                                <Input
                                    label="Branch"
                                    value={profile.branch}
                                    onChange={(e) => setProfile((p) => ({ ...p, branch: e.target.value }))}
                                    placeholder="e.g. Head Office"
                                />
                                <Input
                                    label="Department"
                                    value={profile.department}
                                    onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                                    placeholder="e.g. Operations"
                                />
                                <div className="flex items-end">
                                    <div className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                                        <p className="font-semibold text-gray-800 dark:text-white capitalize">{user?.role || 'Officer'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={saveProfile} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'notifications' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Notification Preferences
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'newApplication', title: 'New Application Alerts',  desc: 'Notify when a new loan application is assigned to you.' },
                                    { id: 'riskAlerts',     title: 'High Risk Alerts',         desc: 'Immediate alert for high-risk applications.' },
                                    { id: 'dailySummary',   title: 'Daily Summary Report',     desc: 'End-of-day summary of processed applications.' },
                                    { id: 'emailDigests',   title: 'Weekly Email Digest',      desc: 'Performance metrics sent to your email every week.' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications[item.id as keyof typeof notifications]}
                                                onChange={() => toggleNotif(item.id as keyof typeof notifications)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                        </label>
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

                    {/* ── SECURITY ── */}
                    {activeTab === 'security' && (
                        <Card className="p-6 space-y-8">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Security Settings
                            </h2>

                            {/* Change Password */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Change Password
                                </h3>
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
                            </div>

                            {/* 2FA */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Two-Factor Authentication
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-white dark:bg-dark-surface rounded-full shadow-sm h-fit">
                                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication (2FA)</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Add an extra layer of security by requiring a code at login.
                                            </p>
                                            <p className={`text-xs font-semibold mt-1 ${security.twoFactor ? 'text-green-600' : 'text-red-500'}`}>
                                                Status: {security.twoFactor ? 'Enabled ✓' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={security.twoFactor ? 'danger' : 'primary'}
                                        onClick={toggleTwoFactor}
                                    >
                                        {security.twoFactor ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                            </div>

                            {/* Session Timeout */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Session Timeout
                                </h3>
                                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Auto-logout after inactivity</p>
                                        <p className="text-xs text-gray-500 mt-0.5">For security, you'll be signed out after the selected period of inactivity.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
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
                                        <Button size="sm" variant="outline" onClick={saveSessionTimeout}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeTab === 'appearance' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Appearance
                            </h2>
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Interface Theme</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Currently using <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong> mode.
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={toggleTheme}>
                                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
